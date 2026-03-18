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
}
