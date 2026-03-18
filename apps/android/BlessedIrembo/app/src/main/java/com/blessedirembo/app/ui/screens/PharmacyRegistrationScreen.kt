package com.blessedirembo.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.Business
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Phone
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import com.blessedirembo.app.ui.components.CustomTextField
import com.blessedirembo.app.ui.components.PrimaryButton
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blessedirembo.app.auth.AuthState
import com.blessedirembo.app.auth.AuthViewModel
import com.blessedirembo.app.data.model.UserRole

/**
 * Pharmacy Registration Screen
 * Extended form for pharmacy owners to register their business
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PharmacyRegistrationScreen(
    onBackClick: () -> Unit,
    onRegisterClick: () -> Unit,
    onSignInClick: () -> Unit,
    authViewModel: AuthViewModel = viewModel()
) {
    // Form state
    var pharmacyName by remember { mutableStateOf("") }
    var ownerName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phoneNumber by remember { mutableStateOf("") }
    var licenseNumber by remember { mutableStateOf("") }
    var physicalAddress by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    val authState by authViewModel.authState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(authState) {
        when (val state = authState) {
            is AuthState.Success -> onRegisterClick()
            is AuthState.Error -> {
                snackbarHostState.showSnackbar(state.message)
                authViewModel.clearError()
            }
            else -> Unit
        }
    }
    val isLoading = authState is AuthState.Loading

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = "Register",
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
        snackbarHost = {
            SnackbarHost(snackbarHostState) { data -> Snackbar(snackbarData = data) }
        },
        containerColor = White
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(8.dp))

            // Form Fields
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                CustomTextField(
                    value = pharmacyName,
                    onValueChange = { pharmacyName = it },
                    placeholder = "Pharmacy Name",
                    leadingIcon = Icons.Outlined.Business
                )

                CustomTextField(
                    value = ownerName,
                    onValueChange = { ownerName = it },
                    placeholder = "Owner Name",
                    leadingIcon = Icons.Outlined.Person
                )

                CustomTextField(
                    value = email,
                    onValueChange = { email = it },
                    placeholder = "Email",
                    leadingIcon = Icons.Outlined.Email,
                    keyboardType = KeyboardType.Email
                )

                CustomTextField(
                    value = phoneNumber,
                    onValueChange = { phoneNumber = it },
                    placeholder = "Phone Number",
                    leadingIcon = Icons.Outlined.Phone,
                    keyboardType = KeyboardType.Phone
                )

                CustomTextField(
                    value = licenseNumber,
                    onValueChange = { licenseNumber = it },
                    placeholder = "License Number",
                    leadingIcon = Icons.Outlined.Description
                )

                CustomTextField(
                    value = physicalAddress,
                    onValueChange = { physicalAddress = it },
                    placeholder = "Physical Address",
                    leadingIcon = Icons.Outlined.LocationOn
                )

                CustomTextField(
                    value = password,
                    onValueChange = { password = it },
                    placeholder = "Password",
                    leadingIcon = Icons.Outlined.Lock,
                    isPassword = true
                )

                CustomTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it },
                    placeholder = "Confirm Password",
                    leadingIcon = Icons.Outlined.Lock,
                    isPassword = true,
                    imeAction = ImeAction.Done
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Verification Notice
            Text(
                text = "Your pharmacy will be verified before going live",
                style = MaterialTheme.typography.bodySmall,
                color = Gray500,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Register Button
            PrimaryButton(
                text = "Register Pharmacy",
                onClick = {
                    if (password == confirmPassword) {
                        authViewModel.signUpWithProfile(
                            email = email,
                            password = password,
                            fullName = ownerName,
                            phone = phoneNumber,
                            role = UserRole.PHARMACY_OWNER
                        )
                    }
                },
                enabled = pharmacyName.isNotBlank() && email.isNotBlank() && licenseNumber.isNotBlank() && !isLoading,
                isLoading = isLoading
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Sign In Link
            Text(
                text = buildAnnotatedString {
                    append("Already have an account? ")
                    withStyle(
                        style = SpanStyle(
                            color = Teal500,
                            fontWeight = FontWeight.SemiBold
                        )
                    ) {
                        append("Sign In")
                    }
                },
                style = MaterialTheme.typography.bodyMedium,
                color = Gray500,
                modifier = Modifier.clickable(onClick = onSignInClick)
            )

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
