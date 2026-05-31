package com.blessedirembo.app.data.repository

import com.blessedirembo.app.data.model.Pharmacy
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

/**
 * PharmacyRepository
 * Reads and writes pharmacy data from Firestore at /pharmacies
 */
class PharmacyRepository {

    private val db = FirebaseFirestore.getInstance()
    private val pharmaciesCollection = db.collection("pharmacies")

    /**
     * Verify a pharmacy license against the licensed_pharmacies collection.
     *
     * IMPORTANT: iOS uses underscore instead of slash in Firestore document IDs
     * because '/' is a Firestore path separator.
     * e.g. NPC/A0001 → stored as NPC_A0001
     */
    suspend fun verifyLicense(licenseNumber: String): Result<Boolean> {
        return try {
            val normalised = licenseNumber.uppercase().trim()

            // Quick format check (mirrors iOS): must match NPC/AXXXX
            val formatOk = Regex("^NPC/A\\d{4}$").containsMatchIn(normalised)
            if (!formatOk) {
                return Result.failure(Exception("Invalid format. Use NPC/A0000 as issued by Rwanda FDA."))
            }

            // Convert to Firestore-safe doc ID (mirrors iOS: replace / with _)
            val docId = normalised.replace("/", "_")

            val doc = db.collection("licensed_pharmacies").document(docId).get().await()
            if (!doc.exists()) {
                return Result.failure(Exception("Not found in the Rwanda FDA licensed list"))
            }

            val isRegistered = doc.getBoolean("isRegistered") ?: false
            if (isRegistered) {
                return Result.failure(Exception("This pharmacy is already registered. Please sign in instead."))
            }

            Result.success(true)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Fetch all verified and active pharmacies.
     */
    suspend fun getNearbyPharmacies(): Result<List<Pharmacy>> {
        return try {
            val snapshot = pharmaciesCollection
                .whereEqualTo("isVerified", true)
                .whereEqualTo("isActive", true)
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
            var pharmacy = snapshot.documents.firstOrNull()?.toObject(Pharmacy::class.java)

            // Fallback: check by document ID (matching iOS behavior)
            if (pharmacy == null) {
                val doc = pharmaciesCollection.document(ownerId).get().await()
                pharmacy = doc.toObject(Pharmacy::class.java)
            }

            Result.success(pharmacy)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Search pharmacies by name (client-side filter).
     */
    suspend fun searchPharmacies(query: String): Result<List<Pharmacy>> {
        return getNearbyPharmacies().map { list ->
            list.filter { it.name.contains(query, ignoreCase = true) }
        }
    }

    /**
     * Register a new pharmacy document in Firestore.
     * Mirrors iOS AuthViewModel.signUpPharmacy().
     */
    suspend fun registerPharmacy(
        uid: String,
        pharmacyName: String,
        ownerName: String,
        phoneNumber: String,
        email: String,
        licenseNumber: String,
        address: String,
        latitude: Double,
        longitude: Double,
        is24Hours: Boolean,
        operatingDays: List<String>,
        openTime: String,
        closeTime: String
    ): Result<Unit> {
        return try {
            val ohMap = mapOf(
                "is24Hours" to is24Hours,
                "days" to (if (is24Hours) listOf("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday") else operatingDays),
                "openTime" to (if (is24Hours) "00:00" else openTime),
                "closeTime" to (if (is24Hours) "23:59" else closeTime)
            )
            val data = hashMapOf(
                "name" to pharmacyName,
                "ownerName" to ownerName,
                "phoneNumber" to phoneNumber,
                "whatsAppNumber" to phoneNumber,  // sync WhatsApp with phone
                "email" to email,
                "licenseNumber" to licenseNumber,
                "address" to address,
                "latitude" to latitude,
                "longitude" to longitude,
                "is24_7" to is24Hours,
                "operatingHours" to ohMap,
                "ownerId" to uid,
                "isVerified" to false,
                "rating" to 0.0,
                "reviewCount" to 0,
                "whatsappClicks" to 0,
                "profileViews" to 0,
                "subscriptionPlan" to "Free",
                "isPremium" to false,
                "createdAt" to FieldValue.serverTimestamp()
            )
            pharmaciesCollection.document(uid).set(data).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Update pharmacy profile fields (name, email, phone).
     * Mirrors iOS PharmacyProfileSettingsView.saveChanges().
     */
    suspend fun updatePharmacyProfile(
        pharmacyId: String,
        name: String,
        email: String,
        phone: String
    ): Result<Unit> {
        return try {
            pharmaciesCollection.document(pharmacyId).update(
                mapOf(
                    "name" to name,
                    "email" to email,
                    "phoneNumber" to phone,
                    "whatsAppNumber" to phone,   // keep WhatsApp in sync
                    "updatedAt" to FieldValue.serverTimestamp()
                )
            ).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Update operating hours for a pharmacy.
     * Mirrors iOS EditOperatingHoursView.save().
     */
    suspend fun updateOperatingHours(
        pharmacyId: String,
        is24Hours: Boolean,
        days: List<String>,
        openTime: String,
        closeTime: String
    ): Result<Unit> {
        return try {
            val ohMap = mapOf(
                "is24Hours" to is24Hours,
                "days" to (if (is24Hours) listOf("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday") else days),
                "openTime" to (if (is24Hours) "00:00" else openTime),
                "closeTime" to (if (is24Hours) "23:59" else closeTime)
            )
            pharmaciesCollection.document(pharmacyId).update(
                mapOf(
                    "operatingHours" to ohMap,
                    "is24_7" to is24Hours,
                    "updatedAt" to FieldValue.serverTimestamp()
                )
            ).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Update pharmacy location (address, district, lat/lng).
     * Mirrors iOS EditLocationView.save() — writes address, district, coordinates + updatedAt.
     */
    suspend fun updatePharmacyLocation(
        pharmacyId: String,
        address: String,
        district: String,
        latitude: Double,
        longitude: Double
    ): Result<Unit> {
        return try {
            pharmaciesCollection.document(pharmacyId).update(
                mapOf(
                    "address" to address,
                    "district" to district,
                    "latitude" to latitude,
                    "longitude" to longitude,
                    "updatedAt" to FieldValue.serverTimestamp()
                )
            ).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Increment the WhatsApp clicks counter for a pharmacy.
     */
    suspend fun incrementWhatsAppClicks(pharmacyId: String): Result<Unit> {
        return try {
            pharmaciesCollection.document(pharmacyId).update(
                "whatsappClicks", FieldValue.increment(1)
            ).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Increment the profile views counter for a pharmacy.
     */
    suspend fun incrementProfileViews(pharmacyId: String): Result<Unit> {
        return try {
            pharmaciesCollection.document(pharmacyId).update(
                "profileViews", FieldValue.increment(1)
            ).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
