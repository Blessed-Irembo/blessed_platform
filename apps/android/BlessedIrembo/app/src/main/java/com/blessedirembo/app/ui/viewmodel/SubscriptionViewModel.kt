package com.blessedirembo.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.blessedirembo.app.data.model.Pharmacy
import com.blessedirembo.app.data.model.SubscriptionPlan
import com.blessedirembo.app.data.model.SubscriptionRequest
import com.blessedirembo.app.data.model.SubscriptionStatus
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.util.Calendar
import java.util.Date

/**
 * SubscriptionViewModel
 * Mirrors iOS SubscriptionViewModel exactly:
 *  - Calculates subscription status (free trial / premium / expired)
 *  - Listens for pending subscription_requests in real-time
 *  - Submits payment intent (submitIntent)
 *  - Uploads receipt image (uploadReceipt)
 *  - Cancels pending request (cancelRequest)
 */
class SubscriptionViewModel : ViewModel() {

    private val db = FirebaseFirestore.getInstance()
    private val storage = FirebaseStorage.getInstance()

    private val _status = MutableStateFlow<SubscriptionStatus>(SubscriptionStatus.Unknown)
    val status: StateFlow<SubscriptionStatus> = _status.asStateFlow()

    private val _pendingRequest = MutableStateFlow<SubscriptionRequest?>(null)
    val pendingRequest: StateFlow<SubscriptionRequest?> = _pendingRequest.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isUploading = MutableStateFlow(false)
    val isUploading: StateFlow<Boolean> = _isUploading.asStateFlow()

    private val _uploadProgress = MutableStateFlow(0f)
    val uploadProgress: StateFlow<Float> = _uploadProgress.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    private val _successMessage = MutableStateFlow<String?>(null)
    val successMessage: StateFlow<String?> = _successMessage.asStateFlow()

    private var requestListener: ListenerRegistration? = null

    // MARK: - Status Calculation (mirrors iOS exactly)
    fun calculateStatus(pharmacy: Pharmacy) {
        val now = Date()

        if (!pharmacy.isActive) {
            _status.value = SubscriptionStatus.Expired
            return
        }

        val endDate = pharmacy.subscriptionEndDate?.toDate()
        if (endDate != null) {
            _status.value = if (endDate.after(now)) {
                SubscriptionStatus.Premium(expiresOn = endDate)
            } else {
                SubscriptionStatus.Expired
            }
        } else {
            // No paid subscription — check 90-day free trial
            val createdAt = pharmacy.createdAt?.toDate() ?: now
            val trialEnd = Calendar.getInstance().apply {
                time = createdAt
                add(Calendar.DAY_OF_YEAR, 90)
            }.time

            if (trialEnd.after(now)) {
                val diffMs = trialEnd.time - now.time
                val daysRemaining = (diffMs / (1000 * 60 * 60 * 24)).toInt()
                _status.value = SubscriptionStatus.FreeTrial(daysRemaining = maxOf(daysRemaining, 0))
            } else {
                _status.value = SubscriptionStatus.Expired
            }
        }
    }

    // MARK: - Real-time pending request listener
    fun startPendingRequestListener(pharmacyId: String) {
        requestListener?.remove()

        requestListener = db.collection("subscription_requests")
            .whereEqualTo("pharmacyId", pharmacyId)
            .whereEqualTo("status", "pending")
            .addSnapshotListener { snapshot, error ->
                if (error != null) return@addSnapshotListener
                val doc = snapshot?.documents?.firstOrNull()
                if (doc != null) {
                    val data = doc.data ?: return@addSnapshotListener
                    val ts = data["createdAt"] as? com.google.firebase.Timestamp
                    _pendingRequest.value = SubscriptionRequest(
                        id = doc.id,
                        pharmacyId = data["pharmacyId"] as? String ?: "",
                        pharmacyName = data["pharmacyName"] as? String ?: "",
                        planId = data["planId"] as? String ?: "",
                        amount = (data["amount"] as? Long)?.toInt() ?: 0,
                        receiptUrl = data["receiptUrl"] as? String ?: "",
                        status = data["status"] as? String ?: "pending",
                        createdAt = ts?.toDate() ?: Date()
                    )
                } else {
                    _pendingRequest.value = null
                }
            }
    }

    fun stopListener() {
        requestListener?.remove()
        requestListener = null
    }

    override fun onCleared() {
        super.onCleared()
        stopListener()
    }

    // MARK: - Submit Intent to Pay
    fun submitIntent(plan: SubscriptionPlan, pharmacyId: String, pharmacyName: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            try {
                val data = hashMapOf(
                    "pharmacyId" to pharmacyId,
                    "pharmacyName" to pharmacyName,
                    "planId" to plan.id,
                    "amount" to plan.amount,
                    "status" to "pending",
                    "receiptUrl" to "",
                    "createdAt" to FieldValue.serverTimestamp()
                )
                db.collection("subscription_requests").add(data).await()
                _successMessage.value = "Payment intent submitted! Our team will review it shortly."
            } catch (e: Exception) {
                _errorMessage.value = "Failed to submit intent: ${e.message}"
            }
            _isLoading.value = false
        }
    }

    // MARK: - Cancel Pending Request
    fun cancelRequest() {
        val request = _pendingRequest.value ?: return
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null
            try {
                db.collection("subscription_requests")
                    .document(request.id)
                    .update("status", "cancelled")
                    .await()
                // Listener will auto-clear pendingRequest
            } catch (e: Exception) {
                _errorMessage.value = "Failed to cancel request: ${e.message}"
            }
            _isLoading.value = false
        }
    }

    // MARK: - Upload Receipt
    fun uploadReceipt(imageBytes: ByteArray, pharmacyId: String, pharmacyName: String) {
        val request = _pendingRequest.value ?: return
        viewModelScope.launch {
            _isUploading.value = true
            _errorMessage.value = null
            _uploadProgress.value = 0f
            try {
                val timestamp = System.currentTimeMillis()
                val path = "receipts/${pharmacyId}_${timestamp}_receipt.jpg"
                val storageRef = storage.reference.child(path)

                val uploadTask = storageRef.putBytes(imageBytes)
                uploadTask.addOnProgressListener { snapshot ->
                    _uploadProgress.value = snapshot.bytesTransferred.toFloat() / snapshot.totalByteCount.toFloat()
                }
                uploadTask.await()

                val downloadUrl = storageRef.downloadUrl.await()

                // Update request document with receipt URL
                db.collection("subscription_requests")
                    .document(request.id)
                    .update("receiptUrl", downloadUrl.toString())
                    .await()

                // Notify admin
                val notif = hashMapOf(
                    "recipientId" to "ADMIN",
                    "title" to "New Receipt Uploaded",
                    "message" to "Pharmacy $pharmacyName uploaded a payment receipt.",
                    "isRead" to false,
                    "createdAt" to FieldValue.serverTimestamp()
                )
                db.collection("notifications").add(notif).await()

                _successMessage.value = "Receipt uploaded successfully! The admin can now see your payment proof."
            } catch (e: Exception) {
                _errorMessage.value = "Upload failed: ${e.message}"
            }
            _isUploading.value = false
            _uploadProgress.value = 0f
        }
    }

    fun clearMessages() {
        _errorMessage.value = null
        _successMessage.value = null
    }
}
