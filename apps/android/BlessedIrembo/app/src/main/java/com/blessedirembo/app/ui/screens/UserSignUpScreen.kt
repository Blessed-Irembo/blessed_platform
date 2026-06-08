package com.blessedirembo.app.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Phone
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import com.blessedirembo.app.R
import com.blessedirembo.app.ui.components.CustomTextField
import com.blessedirembo.app.ui.components.FloatingLanguageSwitcher
import com.blessedirembo.app.ui.components.PrimaryButton
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.util.t
import android.content.Intent
import android.net.Uri
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blessedirembo.app.auth.AuthState
import com.blessedirembo.app.auth.AuthViewModel

/**
 * User Sign Up Screen
 * Form for new users to create an account
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserSignUpScreen(
    onBackClick: () -> Unit,
    onSignUpSuccess: () -> Unit,
    onSignInClick: () -> Unit,
    authViewModel: AuthViewModel = viewModel()
) {
    // Form state
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phoneNumber by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var acceptTerms by remember { mutableStateOf(false) }
    var validationError by remember { mutableStateOf<String?>(null) }
    val authState by authViewModel.authState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    // React to auth state changes
    LaunchedEffect(authState) {
        when (val state = authState) {
            is AuthState.Success -> onSignUpSuccess()
            is AuthState.Error -> {
                snackbarHostState.showSnackbar(state.message)
                authViewModel.clearError()
            }
            else -> Unit
        }
    }

    // React to local validation errors (e.g. password mismatch)
    LaunchedEffect(validationError) {
        val err = validationError
        if (err != null) {
            snackbarHostState.showSnackbar(err)
            validationError = null
        }
    }

    val context = LocalContext.current
    val isLoading = authState is AuthState.Loading

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = t("auth.signUp"),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = t("common.cancel")
                        )
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = White
                )
            )
        },
        containerColor = White,
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->

        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Logo
            Image(
                painter = painterResource(id = R.drawable.logo1),
                contentDescription = "Blessed Irembo Logo",
                modifier = Modifier.size(56.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Title
            Text(
                text = t("auth.signUp"),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Subtitle
            Text(
                text = t("auth.registerUserSubtitle"),
                style = MaterialTheme.typography.bodyMedium,
                color = Gray500
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Form Fields
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                CustomTextField(
                    value = fullName,
                    onValueChange = { fullName = it },
                    placeholder = t("auth.fullNameLabel"),
                    leadingIcon = Icons.Outlined.Person
                )

                CustomTextField(
                    value = email,
                    onValueChange = { email = it },
                    placeholder = t("auth.emailLabel"),
                    leadingIcon = Icons.Outlined.Email,
                    keyboardType = KeyboardType.Email
                )

                CustomTextField(
                    value = phoneNumber,
                    onValueChange = { phoneNumber = it },
                    placeholder = t("auth.phoneLabel"),
                    leadingIcon = Icons.Outlined.Phone,
                    keyboardType = KeyboardType.Phone
                )

                CustomTextField(
                    value = password,
                    onValueChange = { password = it },
                    placeholder = t("auth.passwordLabel"),
                    leadingIcon = Icons.Outlined.Lock,
                    isPassword = true
                )

                CustomTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it },
                    placeholder = t("auth.confirmPasswordLabel"),
                    leadingIcon = Icons.Outlined.Lock,
                    isPassword = true,
                    imeAction = ImeAction.Done
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Terms and Conditions Toggle
            Row(
                modifier = Modifier.padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // "I accept the " + teal clickable "Terms & Conditions"
                val termsText = t("auth.acceptTerms")
                // Find where "Terms" starts in the translated string
                val termsKeyword = if (termsText.contains("Terms")) "Terms & Conditions"
                                   else if (termsText.contains("Amategeko")) "Amategeko n'Amabwiriza"
                                   else "Terms & Conditions"
                val splitIndex = termsText.indexOf(termsKeyword)
                Text(
                    text = buildAnnotatedString {
                        if (splitIndex >= 0) {
                            append(termsText.substring(0, splitIndex))
                            withStyle(
                                SpanStyle(
                                    color = Teal500,
                                    fontWeight = FontWeight.SemiBold,
                                    textDecoration = TextDecoration.Underline
                                )
                            ) {
                                append(termsKeyword)
                            }
                        } else {
                            append(termsText)
                        }
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = Gray500,
                    modifier = Modifier
                        .weight(1f)
                        .clickable {
                            val intent = Intent(
                                Intent.ACTION_VIEW,
                                Uri.parse("https://www.blessedirembo.com/terms")
                            )
                            context.startActivity(intent)
                        }
                )
                Switch(
                    checked = acceptTerms,
                    onCheckedChange = { acceptTerms = it },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = White,
                        checkedTrackColor = Teal500,
                        uncheckedThumbColor = White,
                        uncheckedTrackColor = Gray500.copy(alpha = 0.3f)
                    )
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Sign Up Button
            PrimaryButton(
                text = t("auth.signUp"),
                onClick = {
                    when {
                        password != confirmPassword -> {
                            validationError = "Passwords do not match. Please try again."
                        }
                        else -> {
                            authViewModel.signUpWithProfile(
                                email = email,
                                password = password,
                                fullName = fullName,
                                phone = phoneNumber,
                                role = com.blessedirembo.app.data.model.UserRole.USER
                            )
                        }
                    }
                },
                enabled = acceptTerms && fullName.isNotBlank() && email.isNotBlank() && !isLoading,
                isLoading = isLoading
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Sign In Link
            Text(
                text = buildAnnotatedString {
                    append(t("role.alreadyAccount") + " ")
                    withStyle(
                        style = SpanStyle(
                            color = Teal500,
                            fontWeight = FontWeight.SemiBold
                        )
                    ) {
                        append(t("role.signIn"))
                    }
                },
                style = MaterialTheme.typography.bodyMedium,
                color = Gray500,
                modifier = Modifier.clickable(onClick = onSignInClick)
            )

            Spacer(modifier = Modifier.height(32.dp))
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
