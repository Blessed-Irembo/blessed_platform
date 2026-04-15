package com.blessedirembo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Phone
import androidx.compose.material.icons.outlined.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.foundation.Image
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blessedirembo.app.R
import com.blessedirembo.app.auth.AuthState
import com.blessedirembo.app.auth.AuthViewModel
import com.blessedirembo.app.ui.components.CustomTextField
import com.blessedirembo.app.ui.components.PrimaryButton
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White

/**
 * Sign In Screen
 * Mirrors iOS SignInView — supports Phone Number OR Email sign-in,
 * with Forgot Password dialog and inline error banner.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignInScreen(
    onBackClick: () -> Unit,
    onSignInSuccess: (role: String) -> Unit,
    onNavigateToSignUp: () -> Unit,
    modifier: Modifier = Modifier,
    authViewModel: AuthViewModel = viewModel()
) {
    // 0 = Phone Number, 1 = Email
    var selectedTab by remember { mutableIntStateOf(0) }
    var identifier by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    // Forgot password dialog state
    var showForgotPassword by remember { mutableStateOf(false) }
    var resetEmail by remember { mutableStateOf("") }

    val authState by authViewModel.authState.collectAsState()
    val resetEmailSent by authViewModel.resetEmailSent.collectAsState()

    // React to auth state changes
    LaunchedEffect(authState) {
        when (val state = authState) {
            is AuthState.Success -> onSignInSuccess(state.role)
            else -> Unit
        }
    }

    // Show reset-email-sent confirmation dialog
    if (resetEmailSent) {
        AlertDialog(
            onDismissRequest = { authViewModel.clearResetEmailSent() },
            title = { Text("Email Sent") },
            text = { Text("Check your inbox for a password reset link.") },
            confirmButton = {
                TextButton(onClick = { authViewModel.clearResetEmailSent() }) {
                    Text("OK", color = Teal500)
                }
            }
        )
    }

    // Forgot Password dialog (mirrors iOS alert)
    if (showForgotPassword) {
        AlertDialog(
            onDismissRequest = { showForgotPassword = false },
            title = { Text("Reset Password") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("We'll send a password reset link to your email.")
                    OutlinedTextField(
                        value = resetEmail,
                        onValueChange = { resetEmail = it },
                        label = { Text("Email address") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showForgotPassword = false
                        authViewModel.resetPassword(resetEmail)
                    },
                    enabled = resetEmail.contains("@")
                ) {
                    Text("Send Reset Email", color = Teal500)
                }
            },
            dismissButton = {
                TextButton(onClick = { showForgotPassword = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    val isLoading = authState is AuthState.Loading
    val errorMessage = (authState as? AuthState.Error)?.message

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = "Sign In",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = White
                )
            )
        },
        containerColor = Gray100,
        modifier = modifier
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // ── Header ──────────────────────────────────
            Column(
                modifier = Modifier.padding(top = 32.dp, bottom = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.logo1),
                    contentDescription = "Blessed Irembo Logo",
                    modifier = Modifier.size(72.dp)
                )
                Text(
                    text = "Welcome Back",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Sign in to continue",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Gray500
                )
            }

            // ── Form card ────────────────────────────────
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .background(White, RoundedCornerShape(20.dp))
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {

                // Error banner (inline, matching iOS style)
                if (errorMessage != null) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFFF0000).copy(alpha = 0.08f), RoundedCornerShape(12.dp))
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Warning,
                            contentDescription = null,
                            tint = Color.Red,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = errorMessage,
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Red
                        )
                    }
                }

                // ── Sign-in method picker (Phone / Email) ──
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Sign in with",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    TabRow(
                        selectedTabIndex = selectedTab,
                        containerColor = Gray100,
                        contentColor = Teal500
                    ) {
                        Tab(
                            selected = selectedTab == 0,
                            onClick = {
                                selectedTab = 0
                                identifier = ""
                                authViewModel.clearError()
                            },
                            text = { Text("Phone Number") },
                            icon = {
                                Icon(
                                    imageVector = Icons.Outlined.Phone,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        )
                        Tab(
                            selected = selectedTab == 1,
                            onClick = {
                                selectedTab = 1
                                identifier = ""
                                authViewModel.clearError()
                            },
                            text = { Text("Email") },
                            icon = {
                                Icon(
                                    imageVector = Icons.Outlined.Email,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        )
                    }
                }

                // ── Identifier field ──
                CustomTextField(
                    value = identifier,
                    onValueChange = { identifier = it },
                    placeholder = if (selectedTab == 0) "+250 788 123 456" else "you@example.com",
                    leadingIcon = if (selectedTab == 0) Icons.Outlined.Phone else Icons.Outlined.Email,
                    keyboardType = if (selectedTab == 0) KeyboardType.Phone else KeyboardType.Email
                )

                // Phone-mode helper note
                if (selectedTab == 0) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Teal500.copy(alpha = 0.06f), RoundedCornerShape(10.dp))
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Info,
                            contentDescription = null,
                            tint = Teal500,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Enter the phone number you registered with. Your password stays the same.",
                            style = MaterialTheme.typography.labelSmall,
                            color = Gray500
                        )
                    }
                }

                // ── Password ──
                CustomTextField(
                    value = password,
                    onValueChange = { password = it },
                    placeholder = "Enter your password",
                    leadingIcon = Icons.Outlined.Lock,
                    isPassword = true
                )

                // ── Forgot password ──
                Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.CenterEnd) {
                    Text(
                        text = "Forgot password?",
                        style = MaterialTheme.typography.bodySmall,
                        color = Teal500,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.clickable {
                            // Pre-fill email if user typed one
                            resetEmail = if (selectedTab == 1) identifier else ""
                            showForgotPassword = true
                        }
                    )
                }

                // ── Sign In button ──
                PrimaryButton(
                    text = "Sign In",
                    onClick = { authViewModel.signIn(identifier, password) },
                    enabled = identifier.isNotBlank() && password.isNotBlank() && !isLoading,
                    isLoading = isLoading
                )
            }

            // ── Don't have an account ──
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = buildAnnotatedString {
                    append("Don't have an account? ")
                    withStyle(SpanStyle(color = Teal500, fontWeight = FontWeight.SemiBold)) {
                        append("Sign Up")
                    }
                },
                style = MaterialTheme.typography.bodyMedium,
                color = Gray500,
                modifier = Modifier.clickable(onClick = onNavigateToSignUp)
            )
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}
