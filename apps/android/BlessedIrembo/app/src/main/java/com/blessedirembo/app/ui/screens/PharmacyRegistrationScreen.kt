package com.blessedirembo.app.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.Business
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Phone
import androidx.compose.material.icons.outlined.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TimePicker
import androidx.compose.material3.TimePickerDefaults
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberTimePickerState
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.material.icons.outlined.Cancel
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blessedirembo.app.R
import com.blessedirembo.app.auth.AuthState
import com.blessedirembo.app.auth.AuthViewModel
import com.blessedirembo.app.data.model.AllDays
import com.blessedirembo.app.data.repository.PharmacyRepository
import com.blessedirembo.app.ui.components.CustomTextField
import com.blessedirembo.app.ui.components.PrimaryButton
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Pharmacy Registration Screen
 * Mirrors iOS SignUpPharmacyView — full field parity including:
 *  • License number first
 *  • Phone with WhatsApp note
 *  • Operating hours (24/7 toggle + day chips + time pickers)
 *  • FDA verification notice
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PharmacyRegistrationScreen(
    onBackClick: () -> Unit,
    onRegisterClick: () -> Unit,
    onSignInClick: () -> Unit,
    authViewModel: AuthViewModel = viewModel()
) {
    // ─── Form state ───────────────────────────────────────────────
    var licenseNumber by remember { mutableStateOf("") }
    var pharmacyName by remember { mutableStateOf("") }
    var ownerName by remember { mutableStateOf("") }
    var phoneNumber by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var physicalAddress by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    // ─── License validation state ─────────────────────────────────
    var licenseError by remember { mutableStateOf<String?>(null) }
    var licenseVerified by remember { mutableStateOf(false) }
    var licenseChecking by remember { mutableStateOf(false) }
    val pharmacyRepo = remember { PharmacyRepository() }
    val scope = rememberCoroutineScope()
    var licenseDebounceJob by remember { mutableStateOf<Job?>(null) }

    // ─── Operating Hours state ────────────────────────────────────
    var is24Hours by remember { mutableStateOf(false) }
    var selectedDays by remember { mutableStateOf(setOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday")) }
    var openHour by remember { mutableStateOf(8) }
    var openMinute by remember { mutableStateOf(0) }
    var closeHour by remember { mutableStateOf(20) }
    var closeMinute by remember { mutableStateOf(0) }
    var showOpenTimePicker by remember { mutableStateOf(false) }
    var showCloseTimePicker by remember { mutableStateOf(false) }

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

    // ─── Time Picker Dialogs ──────────────────────────────────────
    if (showOpenTimePicker) {
        val state = rememberTimePickerState(initialHour = openHour, initialMinute = openMinute, is24Hour = true)
        AlertDialog(
            onDismissRequest = { showOpenTimePicker = false },
            title = { Text("Opens at") },
            text = {
                TimePicker(
                    state = state,
                    colors = TimePickerDefaults.colors(clockDialColor = Teal500.copy(alpha = 0.1f))
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    openHour = state.hour
                    openMinute = state.minute
                    showOpenTimePicker = false
                }) { Text("OK", color = Teal500) }
            },
            dismissButton = {
                TextButton(onClick = { showOpenTimePicker = false }) { Text("Cancel") }
            }
        )
    }

    if (showCloseTimePicker) {
        val state = rememberTimePickerState(initialHour = closeHour, initialMinute = closeMinute, is24Hour = true)
        AlertDialog(
            onDismissRequest = { showCloseTimePicker = false },
            title = { Text("Closes at") },
            text = {
                TimePicker(
                    state = state,
                    colors = TimePickerDefaults.colors(clockDialColor = Teal500.copy(alpha = 0.1f))
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    closeHour = state.hour
                    closeMinute = state.minute
                    showCloseTimePicker = false
                }) { Text("OK", color = Teal500) }
            },
            dismissButton = {
                TextButton(onClick = { showCloseTimePicker = false }) { Text("Cancel") }
            }
        )
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = "Register Pharmacy",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(imageVector = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = White)
            )
        },
        snackbarHost = {
            SnackbarHost(snackbarHostState) { data -> Snackbar(snackbarData = data) }
        },
        containerColor = Gray100
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // ── Header ────────────────────────────────────────────
            Column(
                modifier = Modifier.padding(top = 24.dp, bottom = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.logo1),
                    contentDescription = "Logo",
                    modifier = Modifier.size(64.dp)
                )
                Text(
                    text = "Register Your Pharmacy",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Your council number is verified against the\nRwanda FDA December 2025 licensed list.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Gray500,
                    textAlign = TextAlign.Center
                )
            }

            // ── Form card ─────────────────────────────────────────
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .background(White, RoundedCornerShape(20.dp))
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {

                // ── 1. Council Registration Number ──
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(Icons.Outlined.Description, contentDescription = null,
                            tint = Gray500, modifier = Modifier.size(16.dp))
                        Text("Council Registration Number *",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold)
                    }
                    Text("Format: NPC/A0000 — as issued by Rwanda FDA",
                        style = MaterialTheme.typography.labelSmall, color = Gray500)
                    // Field with trailing state icon
                    Box {
                        CustomTextField(
                            value = licenseNumber,
                            onValueChange = { newValue ->
                                licenseNumber = newValue.uppercase()
                                licenseError = null
                                licenseVerified = false
                                // Debounce: check after 700ms of idle typing
                                licenseDebounceJob?.cancel()
                                if (newValue.length >= 5) {
                                    licenseChecking = true
                                    licenseDebounceJob = scope.launch {
                                        delay(700)
                                        val result = pharmacyRepo.verifyLicense(newValue.uppercase().trim())
                                        licenseChecking = false
                                        if (result.isSuccess) {
                                            licenseVerified = true
                                            licenseError = null
                                        } else {
                                            licenseVerified = false
                                            licenseError = "Not found in the Rwanda FDA licensed list"
                                        }
                                    }
                                } else {
                                    licenseChecking = false
                                }
                            },
                            placeholder = "NPC/A0000",
                            leadingIcon = Icons.Outlined.Description
                        )
                        // Trailing status icon
                        Box(
                            modifier = Modifier
                                .align(Alignment.CenterEnd)
                                .padding(end = 12.dp)
                        ) {
                            when {
                                licenseChecking -> CircularProgressIndicator(
                                    modifier = Modifier.size(18.dp),
                                    strokeWidth = 2.dp,
                                    color = Teal500
                                )
                                licenseVerified -> Icon(
                                    Icons.Outlined.CheckCircle,
                                    contentDescription = null,
                                    tint = Color(0xFF22C55E),
                                    modifier = Modifier.size(20.dp)
                                )
                                licenseError != null -> Icon(
                                    Icons.Outlined.Cancel,
                                    contentDescription = null,
                                    tint = Color.Red,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }
                    // Inline error below field (matches iOS red error row)
                    if (licenseError != null) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Outlined.Cancel,
                                contentDescription = null,
                                tint = Color.Red,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = licenseError!!,
                                style = MaterialTheme.typography.labelSmall,
                                color = Color.Red
                            )
                        }
                    }
                }

                // ── 2. Pharmacy Name ──
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(Icons.Outlined.Business, contentDescription = null,
                            tint = Gray500, modifier = Modifier.size(16.dp))
                        Text("Pharmacy Name",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold)
                    }
                    CustomTextField(
                        value = pharmacyName,
                        onValueChange = { pharmacyName = it },
                        placeholder = "Enter pharmacy name",
                        leadingIcon = Icons.Outlined.Business
                    )
                }

                // ── 3. Owner / Responsible Person ──
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(Icons.Outlined.Person, contentDescription = null,
                            tint = Gray500, modifier = Modifier.size(16.dp))
                        Text("Owner / Responsible Person",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold)
                    }
                    CustomTextField(
                        value = ownerName,
                        onValueChange = { ownerName = it },
                        placeholder = "Enter owner full name",
                        leadingIcon = Icons.Outlined.Person
                    )
                }

                // ── 4. Phone Number ──
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(Icons.Outlined.Phone, contentDescription = null,
                            tint = Gray500, modifier = Modifier.size(16.dp))
                        Text("Phone Number",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold)
                    }
                    Text(
                        "Primary contact — used for WhatsApp & sign-in",
                        style = MaterialTheme.typography.labelSmall,
                        color = Gray500
                    )
                    CustomTextField(
                        value = phoneNumber,
                        onValueChange = { phoneNumber = it },
                        placeholder = "+250 7XX XXX XXX",
                        leadingIcon = Icons.Outlined.Phone,
                        keyboardType = KeyboardType.Phone
                    )
                }

                // ── 5. Email ──
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(Icons.Outlined.Email, contentDescription = null,
                            tint = Gray500, modifier = Modifier.size(16.dp))
                        Text("Email Address",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold)
                    }
                    CustomTextField(
                        value = email,
                        onValueChange = { email = it },
                        placeholder = "pharmacy@example.com",
                        leadingIcon = Icons.Outlined.Email,
                        keyboardType = KeyboardType.Email
                    )
                }

                // ── 6. Physical Address ──
                CustomTextField(
                    value = physicalAddress,
                    onValueChange = { physicalAddress = it },
                    placeholder = "Enter full address including district",
                    leadingIcon = Icons.Outlined.LocationOn
                )

                // ── 7. Operating Hours ─────────────────────────────
                HorizontalDivider(color = Gray100)
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("🕐", style = MaterialTheme.typography.bodyMedium)
                        Text("Operating Hours",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold)
                    }

                    // 24/7 Toggle
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Open 24/7", style = MaterialTheme.typography.bodyMedium)
                        Switch(
                            checked = is24Hours,
                            onCheckedChange = { is24Hours = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = White, checkedTrackColor = Teal500)
                        )
                    }

                    if (!is24Hours) {
                        // Day selection chips
                        Text("Open Days",
                            style = MaterialTheme.typography.labelSmall, color = Gray500)
                        Row(
                            modifier = Modifier.horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            AllDays.list.forEach { day ->
                                val isSelected = selectedDays.contains(day)
                                Box(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(
                                            if (isSelected) Teal500 else Color.Transparent
                                        )
                                        .border(
                                            1.dp,
                                            if (isSelected) Teal500 else Gray500.copy(alpha = 0.4f),
                                            CircleShape
                                        )
                                        .clickable {
                                            selectedDays = if (isSelected) {
                                                selectedDays - day
                                            } else {
                                                selectedDays + day
                                            }
                                        }
                                        .padding(horizontal = 14.dp, vertical = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = day.take(3),
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.SemiBold,
                                        color = if (isSelected) White else MaterialTheme.colorScheme.onBackground
                                    )
                                }
                            }
                        }

                        // Open / Close time pickers
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(horizontalAlignment = Alignment.Start) {
                                Text("Opens at",
                                    style = MaterialTheme.typography.labelSmall, color = Gray500)
                                Spacer(Modifier.height(4.dp))
                                Box(
                                    modifier = Modifier
                                        .background(Gray100, RoundedCornerShape(10.dp))
                                        .clickable { showOpenTimePicker = true }
                                        .padding(horizontal = 20.dp, vertical = 12.dp)
                                ) {
                                    Text(
                                        text = "%02d:%02d".format(openHour, openMinute),
                                        style = MaterialTheme.typography.bodyLarge,
                                        fontWeight = FontWeight.Medium,
                                        color = Teal500
                                    )
                                }
                            }
                            Column(horizontalAlignment = Alignment.Start) {
                                Text("Closes at",
                                    style = MaterialTheme.typography.labelSmall, color = Gray500)
                                Spacer(Modifier.height(4.dp))
                                Box(
                                    modifier = Modifier
                                        .background(Gray100, RoundedCornerShape(10.dp))
                                        .clickable { showCloseTimePicker = true }
                                        .padding(horizontal = 20.dp, vertical = 12.dp)
                                ) {
                                    Text(
                                        text = "%02d:%02d".format(closeHour, closeMinute),
                                        style = MaterialTheme.typography.bodyLarge,
                                        fontWeight = FontWeight.Medium,
                                        color = Teal500
                                    )
                                }
                            }
                        }
                    }
                }

                HorizontalDivider(color = Gray100)

                // ── 8. Password ──
                CustomTextField(
                    value = password,
                    onValueChange = { password = it },
                    placeholder = "Min. 6 characters",
                    leadingIcon = Icons.Outlined.Lock,
                    isPassword = true
                )

                // ── 9. Confirm Password ──
                CustomTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it },
                    placeholder = "Re-enter your password",
                    leadingIcon = Icons.Outlined.Lock,
                    isPassword = true
                )

                // Password match warning
                if (confirmPassword.isNotEmpty() && password != confirmPassword) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.Red.copy(alpha = 0.06f), RoundedCornerShape(10.dp))
                            .padding(10.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Outlined.Warning, contentDescription = null,
                            tint = Color.Red, modifier = Modifier.size(16.dp))
                        Text("Passwords do not match",
                            style = MaterialTheme.typography.labelSmall, color = Color.Red)
                    }
                }

                // ── FDA notice banner ──
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Teal500.copy(alpha = 0.08f), RoundedCornerShape(12.dp))
                        .border(1.dp, Teal500.copy(alpha = 0.25f), RoundedCornerShape(12.dp))
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Icon(Icons.Outlined.CheckCircle, contentDescription = null,
                        tint = Teal500, modifier = Modifier.size(18.dp))
                    Text(
                        "Verified by Rwanda FDA. Your council registration number is cross-checked " +
                        "against the official December 2025 list of licensed human retail pharmacies.",
                        style = MaterialTheme.typography.labelSmall,
                        color = Teal500
                    )
                }

                // ── Register Button ──
                PrimaryButton(
                    text = "Register Pharmacy",
                    onClick = {
                        if (password == confirmPassword && password.length >= 6) {
                            val openTime = "%02d:%02d".format(openHour, openMinute)
                            val closeTime = "%02d:%02d".format(closeHour, closeMinute)
                            val orderedDays = AllDays.list.filter { selectedDays.contains(it) }
                            authViewModel.signUpPharmacy(
                                pharmacyName = pharmacyName,
                                ownerName = ownerName,
                                phoneNumber = phoneNumber,
                                email = email,
                                licenseNumber = licenseNumber,
                                address = physicalAddress,
                                latitude = 0.0,
                                longitude = 0.0,
                                is24Hours = is24Hours,
                                operatingDays = orderedDays,
                                openTime = openTime,
                                closeTime = closeTime,
                                password = password
                            )
                        }
                    },
                    enabled = pharmacyName.isNotBlank() && email.isNotBlank() &&
                              licenseNumber.isNotBlank() && password.isNotBlank() &&
                              password == confirmPassword && !isLoading,
                    isLoading = isLoading
                )

                // ── Sign in link ──
                Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    Text(
                        text = "Already have an account? Sign In",
                        style = MaterialTheme.typography.bodySmall,
                        color = Teal500,
                        modifier = Modifier.clickable(onClick = onSignInClick)
                    )
                }
            }

            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

