package com.blessedirembo.app.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.blessedirembo.app.analytics.AnalyticsManager
import com.blessedirembo.app.data.model.UserProfile
import com.blessedirembo.app.data.model.UserRole
import com.blessedirembo.app.data.repository.UserRepository
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * AuthState encapsulates all possible states for authentication operations.
 */
sealed class AuthState {
    data object Idle : AuthState()
    data object Loading : AuthState()
    data class Success(val user: FirebaseUser, val role: String = UserRole.USER) : AuthState()
    data class Error(val message: String) : AuthState()
}

/**
 * AuthViewModel
 * Manages authentication flows for both Sign In and Sign Up screens.
 * Also handles user role resolution for navigation.
 */
class AuthViewModel : ViewModel() {

    private val userRepository = UserRepository()

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    val isSignedIn: Boolean
        get() = FirebaseAuthManager.isSignedIn

    val currentUser: FirebaseUser?
        get() = FirebaseAuthManager.currentUser

    // ─── Sign In ──────────────────────────────────────────────────────────────

    /**
     * Sign in and resolve the user's role from Firestore for correct routing.
     */
    fun signIn(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = FirebaseAuthManager.signIn(email, password)
            result.fold(
                onSuccess = { user ->
                    // Resolve role from Firestore
                    val profileResult = userRepository.getUserProfile(user.uid)
                    val role = profileResult.getOrNull()?.role ?: UserRole.USER
                    AnalyticsManager.logSignIn()
                    _authState.value = AuthState.Success(user, role)
                },
                onFailure = { e ->
                    _authState.value = AuthState.Error(FirebaseAuthManager.getErrorMessage(e))
                }
            )
        }
    }

    // ─── Sign Up ──────────────────────────────────────────────────────────────

    /**
     * Register a new user and save their profile (name, phone, role) to Firestore.
     * Used by both UserSignUpScreen (role=USER) and PharmacyRegistrationScreen (role=PHARMACY_OWNER).
     */
    fun signUpWithProfile(
        email: String,
        password: String,
        fullName: String,
        phone: String,
        role: String
    ) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = FirebaseAuthManager.signUp(email, password)
            result.fold(
                onSuccess = { user ->
                    // Persist profile to Firestore
                    val profile = UserProfile(
                        uid = user.uid,
                        fullName = fullName,
                        email = email,
                        phone = phone,
                        role = role
                    )
                    userRepository.saveUserProfile(profile)
                    AnalyticsManager.logSignUp(role)
                    _authState.value = AuthState.Success(user, role)
                },
                onFailure = { e ->
                    _authState.value = AuthState.Error(FirebaseAuthManager.getErrorMessage(e))
                }
            )
        }
    }

    // ─── Role resolution (for splash screen auto-login) ──────────────────────

    /**
     * Fetch the current user's stored role from Firestore.
     * Returns null if not signed in or the profile doesn't exist.
     */
    fun getCurrentUserRole(onResult: (String?) -> Unit) {
        val uid = FirebaseAuthManager.currentUser?.uid ?: run {
            onResult(null)
            return
        }
        viewModelScope.launch {
            val role = userRepository.getUserProfile(uid).getOrNull()?.role
            onResult(role)
        }
    }

    // ─── Sign Out ─────────────────────────────────────────────────────────────

    fun signOut() {
        FirebaseAuthManager.signOut()
        _authState.value = AuthState.Idle
    }

    fun clearError() {
        _authState.value = AuthState.Idle
    }
}
