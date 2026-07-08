package com.blessedirembo.app.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Phone
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
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
import com.blessedirembo.app.ui.components.FloatingLanguageSwitcher
import com.blessedirembo.app.ui.components.PrimaryButton
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.util.t

/**
 * Sign In Screen
 * Mirrors iOS SignInView exactly:
 *   - Segmented pill-style Phone / Email picker
 *   - Error banner with red background
 *   - "Remember me" toggle + "Forgot password?" link on same row
 *   - Phone-mode info note below Sign In button
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
    // 0 = Phone Number, 1 = Email (mirrors iOS SignInMethod enum)
    var selectedTab by remember { mutableStateOf(0) }
    var identifier by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var rememberMe by remember { mutableStateOf(false) }

    // Forgot password dialog state
    var showForgotPassword by remember { mutableStateOf(false) }
    var resetEmail by remember { mutableStateOf("") }

    val authState by authViewModel.authState.collectAsState()
    val resetEmailSent by authViewModel.resetEmailSent.collectAsState()

    // Reset auth state on entrance to prevent stale states (like previous success) from auto-redirecting
    LaunchedEffect(Unit) {
        authViewModel.resetAuthState()
    }

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
            title = { Text(t("auth.emailSent")) },
            text = { Text(t("auth.checkInbox")) },
            confirmButton = {
                TextButton(onClick = { authViewModel.clearResetEmailSent() }) {
                    Text(t("common.confirm"), color = Teal500)
                }
            }
        )
    }

    // Forgot Password dialog (mirrors iOS alert)
    if (showForgotPassword) {
        AlertDialog(
            onDismissRequest = { showForgotPassword = false },
            title = { Text(t("auth.resetPassword")) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(t("auth.resetPasswordPrompt"))
                    OutlinedTextField(
                        value = resetEmail,
                        onValueChange = { resetEmail = it },
                        label = { Text(t("auth.emailLabel")) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    val errorMessage = (authState as? AuthState.Error)?.message
                    if (errorMessage != null) {
                        Text(
                            text = errorMessage,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        authViewModel.resetPassword(resetEmail)
                    },
                    enabled = resetEmail.isNotBlank() && authState !is AuthState.Loading
                ) {
                    Text(t("auth.sendResetEmail"), color = Teal500)
                }
            },
            dismissButton = {
                TextButton(onClick = { showForgotPassword = false }) {
                    Text(t("common.cancel"))
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
                        text = t("auth.signIn"),
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
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.TopCenter
        ) {
            Column(
                modifier = Modifier
                    .fillMaxHeight()
                    .widthIn(max = 480.dp)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
            // ── Header ──────────────────────────────────────────────────────
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
                    text = t("auth.signInTitle"),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = Gray900
                )
                Text(
                    text = t("auth.signInSubtitle"),
                    style = MaterialTheme.typography.bodyMedium,
                    color = Gray500
                )
            }

            // ── Form card ────────────────────────────────────────────────────
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .shadow(
                        elevation = 4.dp,
                        shape = RoundedCornerShape(20.dp),
                        ambientColor = Color.Black.copy(alpha = 0.05f)
                    )
                    .background(White, RoundedCornerShape(20.dp))
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                // ── Error banner (inline, matching iOS exactly) ──────────────
                if (errorMessage != null) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.Red.copy(alpha = 0.08f), RoundedCornerShape(12.dp))
                            .border(1.dp, Color.Red.copy(alpha = 0.25f), RoundedCornerShape(12.dp))
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.ErrorOutline,
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

                // ── Sign-in method picker (iOS pill/segmented style) ──────────
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = t("auth.signInWith"),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = Gray900
                    )
                    // Pill-style segmented control (like iOS .pickerStyle(.segmented))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(Gray100)
                            .padding(3.dp)
                    ) {
                        Row(modifier = Modifier.fillMaxWidth()) {
                            listOf(t("auth.phoneLabel"), t("auth.emailLabel")).forEachIndexed { index, label ->
                                val isSelected = selectedTab == index
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(
                                            if (isSelected) White else Color.Transparent
                                        )
                                        .clickable {
                                            selectedTab = index
                                            identifier = ""
                                            authViewModel.clearError()
                                        }
                                        .padding(vertical = 9.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = label,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                                        color = if (isSelected) Gray900 else Gray500
                                    )
                                }
                            }
                        }
                    }
                }

                // ── Identifier field with iOS-style label ────────────────────
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    // Label row (matching iOS: "Label(signInMethod.rawValue, systemImage: ...)")
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (selectedTab == 0) Icons.Outlined.Phone else Icons.Outlined.Email,
                            contentDescription = null,
                            tint = Gray900,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = if (selectedTab == 0) t("auth.phoneLabel") else t("auth.emailLabel"),
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = Gray900
                        )
                    }
                    if (selectedTab == 0) {
                        Text(
                            text = t("auth.phoneModeSub"),
                            style = MaterialTheme.typography.labelSmall,
                            color = Gray500
                        )
                    }
                    CustomTextField(
                        value = identifier,
                        onValueChange = { identifier = it },
                        placeholder = if (selectedTab == 0) "+250 7XX XXX XXX" else "you@example.com",
                        leadingIcon = if (selectedTab == 0) Icons.Outlined.Phone else Icons.Outlined.Email,
                        keyboardType = if (selectedTab == 0) KeyboardType.Phone else KeyboardType.Email
                    )
                }

                // ── Password field with iOS-style label ──────────────────────
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Lock,
                            contentDescription = null,
                            tint = Gray900,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = t("auth.passwordLabel"),
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = Gray900
                        )
                    }
                    CustomTextField(
                        value = password,
                        onValueChange = { password = it },
                        placeholder = t("auth.passwordPlaceholder"),
                        leadingIcon = Icons.Outlined.Lock,
                        isPassword = true
                    )
                }

                // ── Remember me + Forgot password (iOS HStack) ───────────────
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Switch(
                        checked = rememberMe,
                        onCheckedChange = { rememberMe = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = White,
                            checkedTrackColor = Teal500
                        ),
                        modifier = Modifier.size(48.dp, 28.dp)
                    )
                    Text(
                        text = " " + t("auth.rememberMe"),
                        style = MaterialTheme.typography.bodySmall,
                        color = Gray500
                    )
                    Spacer(modifier = Modifier.weight(1f))
                    Text(
                        text = t("auth.forgotPassword"),
                        style = MaterialTheme.typography.bodySmall,
                        color = Teal500,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.clickable {
                            resetEmail = if (selectedTab == 1) identifier else ""
                            showForgotPassword = true
                        }
                    )
                }

                // ── Sign In button ────────────────────────────────────────────
                PrimaryButton(
                    text = t("auth.signIn"),
                    onClick = { authViewModel.signIn(identifier, password) },
                    enabled = identifier.isNotBlank() && password.isNotBlank() && !isLoading,
                    isLoading = isLoading
                )

                // ── Phone info note (only shown in phone mode) ───────────────
                if (selectedTab == 0) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Teal500.copy(alpha = 0.06f), RoundedCornerShape(10.dp))
                            .border(1.dp, Teal500.copy(alpha = 0.2f), RoundedCornerShape(10.dp))
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
                            text = t("auth.phoneModeNote"),
                            style = MaterialTheme.typography.labelSmall,
                            color = Gray500
                        )
                    }
                }
            }

            // ── Sign Up link ─────────────────────────────────────────────────
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = buildAnnotatedString {
                    append(t("auth.noAccount") + " ")
                    withStyle(SpanStyle(color = Teal500, fontWeight = FontWeight.SemiBold)) {
                        append(t("auth.signUp"))
                    }
                },
                style = MaterialTheme.typography.bodyMedium,
                color = Gray500,
                modifier = Modifier.clickable(onClick = onNavigateToSignUp)
            )
            Spacer(modifier = Modifier.height(40.dp))
        } // end Column

        // Floating language switcher overlay (top-end)
        FloatingLanguageSwitcher(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(top = 16.dp, end = 16.dp)
        )
        } // end Box
    }
}
