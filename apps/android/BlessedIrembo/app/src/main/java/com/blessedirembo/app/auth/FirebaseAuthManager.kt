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
}
