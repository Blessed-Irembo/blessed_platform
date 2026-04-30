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
            // First check users collection and use the stored role if available
            val userDoc = usersCollection.document(uid).get().await()
            if (userDoc.exists() && userDoc.data?.isNotEmpty() == true) {
                val role = userDoc.getString("role") ?: com.blessedirembo.app.data.model.UserRole.USER
                return Result.success(role)
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
     * Looks up in the `phone_to_email` collection, mirroring iOS phone-based sign-in path.
     */
    suspend fun fetchEmailByPhone(phone: String): Result<String?> {
        return try {
            // Normalise the phone: strip spaces and ensure leading +
            val normalised = phone.trim()

            val doc = db.collection("phone_to_email").document(normalised).get().await()
            if (doc.exists() && doc.data?.isNotEmpty() == true) {
                return Result.success(doc.getString("email"))
            }

            Result.success(null)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Save the mapping from a phone number to an email to support phone-only login.
     */
    suspend fun savePhoneToEmailMapping(phone: String, email: String): Result<Unit> {
        return try {
            val normalised = phone.trim()
            val data = mapOf("email" to email)
            db.collection("phone_to_email").document(normalised).set(data).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

