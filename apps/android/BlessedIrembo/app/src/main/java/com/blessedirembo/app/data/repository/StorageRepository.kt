package com.blessedirembo.app.data.repository

import android.net.Uri
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.util.UUID

/**
 * StorageRepository
 * Handles file uploads to Firebase Storage
 */
class StorageRepository {

    private val storageRef = FirebaseStorage.getInstance().reference

    /**
     * Uploads a receipt image to the 'receipts' folder in Firebase Storage.
     * Returns the download URL upon success.
     */
    suspend fun uploadReceipt(fileUri: Uri, pharmacyId: String): Result<String> {
        return try {
            val fileName = "${pharmacyId}_${UUID.randomUUID()}.jpg"
            val receiptRef = storageRef.child("receipts/$fileName")
            
            // Upload file
            receiptRef.putFile(fileUri).await()
            
            // Get download URL
            val downloadUrl = receiptRef.downloadUrl.await()
            
            Result.success(downloadUrl.toString())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
