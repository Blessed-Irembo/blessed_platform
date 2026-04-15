package com.blessedirembo.app.auth

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.tasks.await

/**
 * FirebaseAuthManager
 * Single source of truth for all Firebase Auth operations.
 * Mirrors the AuthViewModel pattern used in iOS.
 */
object FirebaseAuthManager {

    private val auth: FirebaseAuth by lazy { FirebaseAuth.getInstance() }

    val currentUser: FirebaseUser?
        get() = auth.currentUser

    val isSignedIn: Boolean
        get() = auth.currentUser != null

    /**
     * Sign in with email and password.
     * @return Result wrapping the FirebaseUser on success.
     */
    suspend fun signIn(email: String, password: String): Result<FirebaseUser> {
        return try {
            val result = auth.signInWithEmailAndPassword(email, password).await()
            val user = result.user ?: throw Exception("Authentication failed: no user returned.")
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Register a new user with email and password.
     * @return Result wrapping the FirebaseUser on success.
     */
    suspend fun signUp(email: String, password: String): Result<FirebaseUser> {
        return try {
            val result = auth.createUserWithEmailAndPassword(email, password).await()
            val user = result.user ?: throw Exception("Registration failed: no user returned.")
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Sign out the current user.
     */
    fun signOut() {
        auth.signOut()
    }

    /**
     * Returns a human-readable message from a Firebase Auth exception.
     */
    fun getErrorMessage(e: Throwable): String {
        return when {
            e.message?.contains("email address is already in use") == true ->
                "An account with this email already exists."
            e.message?.contains("password is invalid") == true ||
            e.message?.contains("no user record") == true ->
                "Incorrect email or password. Please try again."
            e.message?.contains("badly formatted") == true ->
                "Please enter a valid email address."
            e.message?.contains("password should be at least") == true ->
                "Password must be at least 6 characters."
            e.message?.contains("network error") == true ->
                "Network error. Please check your connection."
            else -> e.message ?: "An unknown error occurred."
        }
    }

    /**
     * Update the Firebase Auth display name.
     */
    suspend fun updateProfile(name: String): Result<Unit> {
        return try {
            val user = auth.currentUser ?: throw Exception("Not authenticated")
            val profileUpdates = com.google.firebase.auth.UserProfileChangeRequest.Builder()
                .setDisplayName(name)
                .build()
            user.updateProfile(profileUpdates).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Send a password reset email to the given address.
     */
    suspend fun sendPasswordResetEmail(email: String): Result<Unit> {
        return try {
            auth.sendPasswordResetEmail(email).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Update the user's password securely in Firebase Auth.
     */
    suspend fun updatePassword(newPassword: String): Result<Unit> {
        return try {
            val user = auth.currentUser ?: throw Exception("Not authenticated")
            user.updatePassword(newPassword).await()
            Result.success(Unit)
        } catch (e: Exception) {
            val error = if (e.message?.contains("CREDENTIAL_TOO_OLD_LOGIN_AGAIN") == true || e.message?.contains("CREDENTIAL_TOO_OLD") == true) {
                "Your session has expired for security reasons. Please fully log out and sign back in to change your password."
            } else { getErrorMessage(e) }
            Result.failure(Exception(error))
        }
    }
}
