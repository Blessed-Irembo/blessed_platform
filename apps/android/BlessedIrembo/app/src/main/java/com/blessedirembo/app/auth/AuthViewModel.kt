package com.blessedirembo.app.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.blessedirembo.app.analytics.AnalyticsManager
import com.blessedirembo.app.data.model.UserProfile
import com.blessedirembo.app.data.model.UserRole
import com.blessedirembo.app.data.repository.PharmacyRepository
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
 * Manages authentication flows for Sign In, Sign Up (User & Pharmacy Owner), and
 * password reset. Mirrors iOS AuthViewModel.
 */
class AuthViewModel : ViewModel() {

    private val userRepository = UserRepository()
    private val pharmacyRepository = PharmacyRepository()

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    /** True once a reset email has been sent successfully. */
    private val _resetEmailSent = MutableStateFlow(false)
    val resetEmailSent: StateFlow<Boolean> = _resetEmailSent.asStateFlow()

    val isSignedIn: Boolean
        get() = FirebaseAuthManager.isSignedIn

    val currentUser: FirebaseUser?
        get() = FirebaseAuthManager.currentUser

    // ─── Sign In ──────────────────────────────────────────────────────────────

    /**
     * Sign in with email (or phone-derived email) and password.
     * Mirrors iOS AuthViewModel.signIn(identifier:password:rememberMe:).
     */
    fun signIn(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            // If the identifier looks like a phone number, try to find the matching email in Firestore.
            val resolvedEmail = if (email.contains("@")) {
                email
            } else {
                userRepository.fetchEmailByPhone(email).getOrNull() ?: email
            }
            val result = FirebaseAuthManager.signIn(resolvedEmail, password)
            result.fold(
                onSuccess = { user ->
                    val roleResult = userRepository.fetchUserRole(user.uid)
                    val role = roleResult.getOrNull() ?: UserRole.USER
                    AnalyticsManager.logSignIn()
                    _authState.value = AuthState.Success(user, role)
                },
                onFailure = { e ->
                    _authState.value = AuthState.Error(FirebaseAuthManager.getErrorMessage(e))
                }
            )
        }
    }

    // ─── Sign Up (User) ───────────────────────────────────────────────────────

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

    // ─── Sign Up (Pharmacy Owner) ─────────────────────────────────────────────

    /**
     * Register a new pharmacy owner account:
     *   1. Create Firebase Auth user
     *   2. Save user profile to Firestore /users
     *   3. Create pharmacy document in Firestore /pharmacies
     *
     * Mirrors iOS AuthViewModel.signUpPharmacy().
     */
    fun signUpPharmacy(
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
        closeTime: String,
        password: String
    ) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading

            // Step 1 – create auth user
            val authResult = FirebaseAuthManager.signUp(email, password)
            authResult.fold(
                onSuccess = { user ->
                    // Step 2 – save user profile
                    val profile = UserProfile(
                        uid = user.uid,
                        fullName = ownerName,
                        email = email,
                        phone = phoneNumber,
                        role = UserRole.PHARMACY_OWNER
                    )
                    userRepository.saveUserProfile(profile)

                    // Step 3 – create pharmacy document
                    pharmacyRepository.registerPharmacy(
                        uid = user.uid,
                        pharmacyName = pharmacyName,
                        ownerName = ownerName,
                        phoneNumber = phoneNumber,
                        email = email,
                        licenseNumber = licenseNumber,
                        address = address,
                        latitude = latitude,
                        longitude = longitude,
                        is24Hours = is24Hours,
                        operatingDays = operatingDays,
                        openTime = openTime,
                        closeTime = closeTime
                    )

                    AnalyticsManager.logSignUp(UserRole.PHARMACY_OWNER)
                    _authState.value = AuthState.Success(user, UserRole.PHARMACY_OWNER)
                },
                onFailure = { e ->
                    _authState.value = AuthState.Error(FirebaseAuthManager.getErrorMessage(e))
                }
            )
        }
    }

    // ─── Forgot Password ──────────────────────────────────────────────────────

    /**
     * Send a password reset email. Mirrors iOS AuthViewModel.resetPassword().
     */
    fun resetPassword(email: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = FirebaseAuthManager.sendPasswordResetEmail(email)
            result.fold(
                onSuccess = {
                    _resetEmailSent.value = true
                    _authState.value = AuthState.Idle
                },
                onFailure = { e ->
                    _authState.value = AuthState.Error(FirebaseAuthManager.getErrorMessage(e))
                }
            )
        }
    }

    fun clearResetEmailSent() {
        _resetEmailSent.value = false
    }

    // ─── Role resolution ──────────────────────────────────────────────────────

    fun getCurrentUserRole(onResult: (String?) -> Unit) {
        val uid = FirebaseAuthManager.currentUser?.uid ?: run {
            onResult(null)
            return
        }
        viewModelScope.launch {
            val role = userRepository.fetchUserRole(uid).getOrNull()
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

    // ─── Edit Profile (user) ──────────────────────────────────────────────────

    private val _editProfileState = MutableStateFlow<AuthState>(AuthState.Idle)
    val editProfileState: StateFlow<AuthState> = _editProfileState.asStateFlow()

    fun resetEditProfileState() {
        _editProfileState.value = AuthState.Idle
    }

    fun saveProfileChanges(name: String, phone: String, newPassword: String?) {
        viewModelScope.launch {
            _editProfileState.value = AuthState.Loading
            val uid = FirebaseAuthManager.currentUser?.uid ?: return@launch

            val repoResult = userRepository.updateUserDocument(uid, name, phone)
            if (repoResult.isFailure) {
                _editProfileState.value = AuthState.Error(repoResult.exceptionOrNull()?.message ?: "Database update failed")
                return@launch
            }

            FirebaseAuthManager.updateProfile(name)

            if (!newPassword.isNullOrBlank()) {
                val passResult = FirebaseAuthManager.updatePassword(newPassword)
                if (passResult.isFailure) {
                    _editProfileState.value = AuthState.Error(passResult.exceptionOrNull()?.message ?: "Password update failed")
                    return@launch
                }
            }

            _editProfileState.value = AuthState.Success(FirebaseAuthManager.currentUser!!, UserRole.USER)
        }
    }
}
