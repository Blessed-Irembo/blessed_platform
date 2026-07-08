package com.blessedirembo.app.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.blessedirembo.app.analytics.AnalyticsManager
import com.blessedirembo.app.data.model.UserProfile
import com.blessedirembo.app.data.model.UserRole
import com.blessedirembo.app.data.repository.PharmacyRepository
import com.blessedirembo.app.data.repository.UserRepository
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.EmailAuthProvider
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FieldValue
import kotlinx.coroutines.tasks.await
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
 * password reset. Mirrors iOS AuthViewModel exactly.
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
     *
     * Phone sign-in flow:
     *   1. Normalize phone to +250XXXXXXXXX
     *   2. Look up email in phone_to_email collection
     *   3. Fallback to synthetic email (phone@blessed-irembo.app)
     *   4. Sign in with resolved email
     *   5. Check pharmacies FIRST for role (pharmacy always wins over user)
     */
    fun signIn(identifier: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading

            val trimmed = identifier.trim()
            if (trimmed.isEmpty()) {
                _authState.value = AuthState.Error("Please enter your email or phone number")
                return@launch
            }
            if (password.isEmpty()) {
                _authState.value = AuthState.Error("Please enter your password")
                return@launch
            }

            // Resolve the actual Firebase Auth email
            val resolvedEmail: String = if (trimmed.contains("@")) {
                // Already an email — use directly
                trimmed
            } else {
                // Phone-number path: normalize first, then look up in phone_to_email
                val normalized = userRepository.normalizePhoneNumber(trimmed)
                val emailResult = userRepository.fetchEmailByPhone(normalized)
                emailResult.getOrNull() ?: run {
                    _authState.value = AuthState.Error("No account found with this phone number. Please check and try again.")
                    return@launch
                }
            }

            val result = FirebaseAuthManager.signIn(resolvedEmail, password)
            result.fold(
                onSuccess = { user ->
                    // Normalize the input phone number for reliable lookup
                    val normalizedPhone = if (!trimmed.contains("@")) userRepository.normalizePhoneNumber(trimmed) else null
                    
                    // PHARMACY always wins: fetchUserRole checks pharmacies before users
                    val roleResult = userRepository.fetchUserRole(
                        uid = user.uid,
                        email = if (trimmed.contains("@")) trimmed else resolvedEmail,
                        phone = normalizedPhone ?: trimmed
                    )
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

    /**
     * Sign up a regular user (looking for pharmacies).
     * Phone number is primary; email is optional (synthetic email generated if blank).
     * Mirrors iOS AuthViewModel.signUpUser().
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

            val normalizedPhone = userRepository.normalizePhoneNumber(phone)

            val resolvedEmail = if (email.isBlank()) {
                "${normalizedPhone.replace("+", "")}@blessed-irembo.app"
            } else {
                email
            }

            val result = FirebaseAuthManager.signUp(resolvedEmail, password)
            result.fold(
                onSuccess = { user ->
                    val profile = UserProfile(
                        uid = user.uid,
                        fullName = fullName,
                        email = resolvedEmail,
                        phone = normalizedPhone,
                        role = role
                    )
                    userRepository.saveUserProfile(profile)
                    userRepository.savePhoneToEmailMapping(normalizedPhone, resolvedEmail)
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
     *   1. Verify license against licensed_pharmacies Firestore collection
     *   2. Create Firebase Auth user
     *   3. Save user profile to Firestore /users
     *   4. Create pharmacy document in Firestore /pharmacies
     *   5. Save phone_to_email mapping
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

            // Normalize phone (mirrors iOS User.normalizePhoneNumber)
            val normalizedPhone = userRepository.normalizePhoneNumber(phoneNumber)

            // Verify license against Rwanda FDA list (with underscore doc IDs like iOS)
            val licenseResult = pharmacyRepository.verifyLicense(licenseNumber)
            if (licenseResult.isFailure) {
                _authState.value = AuthState.Error(
                    licenseResult.exceptionOrNull()?.message ?: "Invalid license number."
                )
                return@launch
            }

            // Email is required for pharmacy (unlike user where it's optional)
            if (email.isBlank()) {
                _authState.value = AuthState.Error("Please enter a valid email address")
                return@launch
            }

            // Step 1 – create auth user
            val authResult = FirebaseAuthManager.signUp(email, password)
            authResult.fold(
                onSuccess = { user ->
                    // Step 2 – save user profile document (role = PHARMACY_OWNER)
                    val profile = UserProfile(
                        uid = user.uid,
                        fullName = ownerName,
                        email = email,
                        phone = normalizedPhone,
                        role = UserRole.PHARMACY_OWNER
                    )
                    userRepository.saveUserProfile(profile)
                    // Save phone→email mapping for future phone-based sign-in
                    userRepository.savePhoneToEmailMapping(normalizedPhone, email)

                    // Step 3 – create pharmacy document (doc ID = uid, mirrors iOS)
                    pharmacyRepository.registerPharmacy(
                        uid = user.uid,
                        pharmacyName = pharmacyName,
                        ownerName = ownerName,
                        phoneNumber = normalizedPhone,
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
     * Send a password reset email.
     * Accepts either email or phone number as identifier.
     * If phone number given, resolves it to email first via phone_to_email collection.
     * Mirrors iOS AuthViewModel.resetPassword().
     */
    fun resetPassword(identifier: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading

            val trimmed = identifier.trim()
            if (trimmed.isEmpty()) {
                _authState.value = AuthState.Error("Please enter your email address")
                return@launch
            }

            val email: String = if (trimmed.contains("@")) {
                trimmed
            } else {
                // Phone mode: resolve to email first
                val normalized = userRepository.normalizePhoneNumber(trimmed)
                val emailResult = userRepository.fetchEmailByPhone(normalized)
                val resolved = emailResult.getOrNull()
                if (resolved.isNullOrBlank() || resolved.endsWith("@blessed-irembo.app")) {
                    // Can't send reset to synthetic email — prompt for real email
                    _authState.value = AuthState.Error(
                        "Please enter your email address to reset your password."
                    )
                    return@launch
                }
                resolved
            }

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

    fun resetAuthState() {
        _authState.value = AuthState.Idle
    }

    // ─── Role resolution ──────────────────────────────────────────────────────

    /**
     * Get the current user's role (for use on Splash screen auto-login).
     * Checks pharmacies before users — pharmacy always wins.
     */
    fun getCurrentUserRole(onResult: (String?) -> Unit) {
        val user = FirebaseAuthManager.currentUser ?: run {
            onResult(null)
            return
        }
        viewModelScope.launch {
            // user.phoneNumber is always null for email-based auth.
            // Fetch the phone from their Firestore profile instead (stored at sign-up).
            var storedPhone = userRepository.getUserProfile(user.uid).getOrNull()?.phone
            
            // If we don't have a stored phone profile (e.g. admin-created account), 
            // recover it from the synthetic email if they used Phone Auth
            if (storedPhone == null && user.email?.endsWith("@blessed-irembo.app") == true) {
                val digits = user.email!!.substringBefore("@")
                storedPhone = userRepository.normalizePhoneNumber(digits)
            }
            
            val role = userRepository.fetchUserRole(
                uid = user.uid,
                email = user.email,
                phone = storedPhone
            ).getOrNull()
            onResult(role)
        }
    }

    // ─── Sign Out ─────────────────────────────────────────────────────────────

    fun signOut() {
        FirebaseAuthManager.signOut()
        _authState.value = AuthState.Idle
    }

    // ─── Delete Account ────────────────────────────────────────────────────────

    private val _deleteAccountState = MutableStateFlow<AuthState>(AuthState.Idle)
    val deleteAccountState: StateFlow<AuthState> = _deleteAccountState.asStateFlow()

    fun resetDeleteAccountState() {
        _deleteAccountState.value = AuthState.Idle
    }

    fun deleteAccount(password: String, onComplete: (Result<Unit>) -> Unit) {
        viewModelScope.launch {
            _deleteAccountState.value = AuthState.Loading
            
            val user = FirebaseAuthManager.currentUser
            if (user == null || user.email == null) {
                val error = Exception("Not authenticated")
                _deleteAccountState.value = AuthState.Error(error.message ?: "Not authenticated")
                onComplete(Result.failure(error))
                return@launch
            }
            
            // 1. Re-authenticate user
            val credential = EmailAuthProvider.getCredential(user.email!!, password)
            try {
                user.reauthenticate(credential).await()
            } catch (e: Exception) {
                val errorMsg = FirebaseAuthManager.getErrorMessage(e)
                _deleteAccountState.value = AuthState.Error(errorMsg)
                onComplete(Result.failure(Exception(errorMsg)))
                return@launch
            }
            
            val uid = user.uid
            val db = FirebaseFirestore.getInstance()
            val batch = db.batch()
            
            // 2. Fetch role to determine what to delete
            val roleResult = userRepository.fetchUserRole(uid, user.email, user.phoneNumber)
            val role = roleResult.getOrNull()
            
            try {
                if (role == UserRole.PHARMACY_OWNER) {
                    val pharmacyResult = pharmacyRepository.getPharmacyByOwnerId(uid)
                    val pharmacy = pharmacyResult.getOrNull()
                    
                    // Delete pharmacy document
                    val pharmacyRef = db.collection("pharmacies").document(uid)
                    batch.delete(pharmacyRef)
                    
                    // Delete phone mapping if phone number exists
                    val phone = pharmacy?.phoneNumber ?: ""
                    if (phone.isNotBlank()) {
                        val phoneRef = db.collection("phone_to_email").document(userRepository.normalizePhoneNumber(phone))
                        batch.delete(phoneRef)
                        
                        val rawPhoneRef = db.collection("phone_to_email").document(phone.trim())
                        batch.delete(rawPhoneRef)
                    }
                    
                    // Delete user profile doc if it exists for this uid
                    val userRef = db.collection("users").document(uid)
                    batch.delete(userRef)
                } else {
                    // Regular user
                    val profileResult = userRepository.getUserProfile(uid)
                    val profile = profileResult.getOrNull()
                    
                    // Delete user profile doc
                    val userRef = db.collection("users").document(uid)
                    batch.delete(userRef)
                    
                    // Delete phone mapping if exists
                    val phone = profile?.phone ?: ""
                    if (phone.isNotBlank()) {
                        val phoneRef = db.collection("phone_to_email").document(userRepository.normalizePhoneNumber(phone))
                        batch.delete(phoneRef)
                        
                        val rawPhoneRef = db.collection("phone_to_email").document(phone.trim())
                        batch.delete(rawPhoneRef)
                    }
                }
                
                // Commit Firestore deletes
                batch.commit().await()
                
                // 3. Delete Firebase Auth user
                user.delete().await()
                
                // Reset state
                _deleteAccountState.value = AuthState.Idle
                onComplete(Result.success(Unit))
            } catch (e: Exception) {
                val errorMsg = e.message ?: "Failed to delete account data."
                _deleteAccountState.value = AuthState.Error(errorMsg)
                onComplete(Result.failure(Exception(errorMsg)))
            }
        }
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
                _editProfileState.value = AuthState.Error(
                    repoResult.exceptionOrNull()?.message ?: "Database update failed"
                )
                return@launch
            }

            FirebaseAuthManager.updateProfile(name)

            if (!newPassword.isNullOrBlank()) {
                val passResult = FirebaseAuthManager.updatePassword(newPassword)
                if (passResult.isFailure) {
                    _editProfileState.value = AuthState.Error(
                        passResult.exceptionOrNull()?.message ?: "Password update failed"
                    )
                    return@launch
                }
            }

            _editProfileState.value = AuthState.Success(FirebaseAuthManager.currentUser!!, UserRole.USER)
        }
    }
}
