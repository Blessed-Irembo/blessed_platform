package com.blessedirembo.app.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
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
    data class Success(val user: FirebaseUser) : AuthState()
    data class Error(val message: String) : AuthState()
}

/**
 * AuthViewModel
 * Manages authentication flows for both Sign In and Sign Up screens.
 */
class AuthViewModel : ViewModel() {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    val isSignedIn: Boolean
        get() = FirebaseAuthManager.isSignedIn

    val currentUser: FirebaseUser?
        get() = FirebaseAuthManager.currentUser

    fun signIn(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = FirebaseAuthManager.signIn(email, password)
            _authState.value = result.fold(
                onSuccess = { user -> AuthState.Success(user) },
                onFailure = { e -> AuthState.Error(FirebaseAuthManager.getErrorMessage(e)) }
            )
        }
    }

    fun signUp(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = FirebaseAuthManager.signUp(email, password)
            _authState.value = result.fold(
                onSuccess = { user -> AuthState.Success(user) },
                onFailure = { e -> AuthState.Error(FirebaseAuthManager.getErrorMessage(e)) }
            )
        }
    }

    fun signOut() {
        FirebaseAuthManager.signOut()
        _authState.value = AuthState.Idle
    }

    fun clearError() {
        _authState.value = AuthState.Idle
    }
}
