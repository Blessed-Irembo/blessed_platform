package com.blessedirembo.app.data.repository

import com.blessedirembo.app.data.model.UserProfile
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

/**
 * UserRepository
 * Handles reading and writing user profiles in Firestore at /users/{uid}
 */
class UserRepository {

    private val db = FirebaseFirestore.getInstance()
    private val usersCollection = db.collection("users")

    /**
     * Save a new user profile after sign-up.
     */
    suspend fun saveUserProfile(profile: UserProfile): Result<Unit> {
        return try {
            usersCollection.document(profile.uid).set(profile).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Fetch an existing user profile to determine role and display info.
     */
    suspend fun getUserProfile(uid: String): Result<UserProfile> {
        return try {
            val doc = usersCollection.document(uid).get().await()
            val profile = doc.toObject(UserProfile::class.java)
                ?: return Result.failure(Exception("User profile not found"))
            Result.success(profile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Fetch user role by checking the `users` collection first, then `pharmacies`.
     * Mirrors the iOS FirebaseManager.fetchUserRole behavior.
     */
    suspend fun fetchUserRole(uid: String): Result<String?> {
        return try {
            // First check users collection
            val userDoc = usersCollection.document(uid).get().await()
            if (userDoc.exists() && userDoc.data?.isNotEmpty() == true) {
                return Result.success(com.blessedirembo.app.data.model.UserRole.USER)
            }

            // Then check pharmacies collection
            val pharmacyDoc = db.collection("pharmacies").document(uid).get().await()
            if (pharmacyDoc.exists() && pharmacyDoc.data?.isNotEmpty() == true) {
                return Result.success(com.blessedirembo.app.data.model.UserRole.PHARMACY_OWNER)
            }

            // Not found in either
            Result.success(null)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Perform a partial update of a user's profile fields.
     */
    suspend fun updateUserDocument(uid: String, name: String, phone: String): Result<Unit> {
        return try {
            val updates = mapOf(
                "fullName" to name,
                "phone" to phone
            )
            usersCollection.document(uid).update(updates).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Phone-number sign-in: look up the email associated with a given phone number.
     * Checks /users then /pharmacies, mirroring iOS phone-based sign-in path.
     */
    suspend fun fetchEmailByPhone(phone: String): Result<String?> {
        return try {
            // Normalise the phone: strip spaces and ensure leading +
            val normalised = phone.trim()

            // Check users collection
            var snapshot = usersCollection
                .whereEqualTo("phone", normalised)
                .limit(1)
                .get()
                .await()
            snapshot.documents.firstOrNull()?.getString("email")?.let {
                return Result.success(it)
            }

            // Check pharmacies collection (phone stored as phoneNumber)
            snapshot = db.collection("pharmacies")
                .whereEqualTo("phoneNumber", normalised)
                .limit(1)
                .get()
                .await()
            snapshot.documents.firstOrNull()?.getString("email")?.let {
                return Result.success(it)
            }

            Result.success(null)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

