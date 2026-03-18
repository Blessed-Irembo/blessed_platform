package com.blessedirembo.app.data.repository

import com.blessedirembo.app.data.model.Pharmacy
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

/**
 * PharmacyRepository
 * Reads pharmacy data from Firestore at /pharmacies
 */
class PharmacyRepository {

    private val db = FirebaseFirestore.getInstance()
    private val pharmaciesCollection = db.collection("pharmacies")

    /**
     * Fetch all verified pharmacies.
     * In production this would filter by geolocation radius.
     */
    suspend fun getNearbyPharmacies(): Result<List<Pharmacy>> {
        return try {
            val snapshot = pharmaciesCollection
                .whereEqualTo("isVerified", true)
                .get()
                .await()
            val pharmacies = snapshot.toObjects(Pharmacy::class.java)
            Result.success(pharmacies)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Fetch a single pharmacy by ID for the detail screen.
     */
    suspend fun getPharmacyById(pharmacyId: String): Result<Pharmacy> {
        return try {
            val doc = pharmaciesCollection.document(pharmacyId).get().await()
            val pharmacy = doc.toObject(Pharmacy::class.java)
                ?: return Result.failure(Exception("Pharmacy not found"))
            Result.success(pharmacy)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Fetch a single pharmacy by owner ID (for the owner dashboard).
     */
    suspend fun getPharmacyByOwnerId(ownerId: String): Result<Pharmacy?> {
        return try {
            val snapshot = pharmaciesCollection
                .whereEqualTo("ownerId", ownerId)
                .limit(1)
                .get()
                .await()
            val pharmacy = snapshot.documents.firstOrNull()?.toObject(Pharmacy::class.java)
            Result.success(pharmacy)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Search pharmacies by name (client-side filter for now).
     */
    suspend fun searchPharmacies(query: String): Result<List<Pharmacy>> {
        return getNearbyPharmacies().map { list ->
            list.filter { it.name.contains(query, ignoreCase = true) }
        }
    }
}
