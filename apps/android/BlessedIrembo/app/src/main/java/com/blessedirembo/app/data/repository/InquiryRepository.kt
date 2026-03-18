package com.blessedirembo.app.data.repository

import com.blessedirembo.app.data.model.Inquiry
import com.blessedirembo.app.data.model.InquiryStatus
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

/**
 * InquiryRepository
 * Handles user↔pharmacy inquiry messaging in Firestore at /inquiries
 */
class InquiryRepository {

    private val db = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()
    private val inquiriesCollection = db.collection("inquiries")

    /**
     * Send a new inquiry from the current user to a pharmacy.
     */
    suspend fun sendInquiry(
        pharmacyId: String,
        pharmacyName: String,
        message: String
    ): Result<Unit> {
        val currentUser = auth.currentUser
            ?: return Result.failure(Exception("You must be signed in to send an inquiry."))

        return try {
            val inquiry = Inquiry(
                pharmacyId = pharmacyId,
                senderId = currentUser.uid,
                senderName = currentUser.displayName ?: "Anonymous",
                message = message,
                isRead = false,
                status = InquiryStatus.PENDING
            )
            inquiriesCollection.add(inquiry).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Real-time stream of inquiries for a specific pharmacy (used by pharmacy owner).
     */
    fun getInquiriesForPharmacy(pharmacyId: String): Flow<List<Inquiry>> = callbackFlow {
        val listener = inquiriesCollection
            .whereEqualTo("pharmacyId", pharmacyId)
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val inquiries = snapshot?.toObjects(Inquiry::class.java) ?: emptyList()
                trySend(inquiries)
            }
        awaitClose { listener.remove() }
    }

    /**
     * Mark an inquiry as read (called when the pharmacy owner opens it).
     */
    suspend fun markAsRead(inquiryId: String): Result<Unit> {
        return try {
            inquiriesCollection.document(inquiryId)
                .update("isRead", true)
                .await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Update the status of an inquiry (Replied / Archived).
     */
    suspend fun updateInquiryStatus(inquiryId: String, status: String): Result<Unit> {
        return try {
            inquiriesCollection.document(inquiryId)
                .update("status", status)
                .await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
