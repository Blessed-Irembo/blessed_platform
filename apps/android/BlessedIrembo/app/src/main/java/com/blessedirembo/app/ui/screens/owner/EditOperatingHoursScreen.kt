package com.blessedirembo.app.ui.screens.owner

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blessedirembo.app.auth.AuthViewModel
import com.blessedirembo.app.data.model.AllDays
import com.blessedirembo.app.data.repository.PharmacyRepository
import com.blessedirembo.app.ui.components.PrimaryButton
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.SuccessGreen
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.ui.viewmodel.PharmacyViewModel
import kotlinx.coroutines.launch

/**
 * Edit Operating Hours Screen
 * Mirrors iOS EditOperatingHoursView:
 *  • 24/7 toggle
 *  • Day selection (chips)
 *  • Open/close time pickers
 * Saves directly to Firestore via PharmacyRepository.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditOperatingHoursScreen(
    onBackClick: () -> Unit,
    authViewModel: AuthViewModel = viewModel(),
    pharmacyViewModel: PharmacyViewModel = viewModel()
) {
    val pharmacy by pharmacyViewModel.ownerPharmacy.collectAsState()
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }
    val repo = remember { PharmacyRepository() }

    // ── state loaded from pharmacy ──
    var is24Hours by remember { mutableStateOf(false) }
    var selectedDays by remember { mutableStateOf(setOf<String>()) }
    var openHour by remember { mutableStateOf(8) }
    var openMinute by remember { mutableStateOf(0) }
    var closeHour by remember { mutableStateOf(20) }
    var closeMinute by remember { mutableStateOf(0) }

    var isSaving by remember { mutableStateOf(false) }
    var showOpenPicker by remember { mutableStateOf(false) }
    var showClosePicker by remember { mutableStateOf(false) }

    // Load current values from pharmacy
    LaunchedEffect(pharmacy) {
        pharmacy?.let { p ->
            val hours = p.parsedOperatingHours
            is24Hours = hours.is24Hours
            selectedDays = hours.days.toSet()
            val openParts = hours.openTime.split(":").mapNotNull { it.toIntOrNull() }
            val closeParts = hours.closeTime.split(":").mapNotNull { it.toIntOrNull() }
            if (openParts.size >= 2) { openHour = openParts[0]; openMinute = openParts[1] }
            if (closeParts.size >= 2) { closeHour = closeParts[0]; closeMinute = closeParts[1] }
        }
    }

    // Load pharmacy if not yet loaded
    LaunchedEffect(Unit) {
        val uid = authViewModel.currentUser?.uid
        if (uid != null && pharmacy == null) {
            pharmacyViewModel.loadPharmacyByOwnerId(uid)
        }
    }

    // ── Time pickers ──
    if (showOpenPicker) {
        val state = rememberTimePickerState(initialHour = openHour, initialMinute = openMinute, is24Hour = true)
        AlertDialog(
            onDismissRequest = { showOpenPicker = false },
            title = { Text("Opens at") },
            text = {
                TimePicker(state = state,
                    colors = TimePickerDefaults.colors(clockDialColor = Teal500.copy(alpha = 0.1f)))
            },
            confirmButton = {
                TextButton(onClick = { openHour = state.hour; openMinute = state.minute; showOpenPicker = false }) {
                    Text("OK", color = Teal500)
                }
            },
            dismissButton = { TextButton(onClick = { showOpenPicker = false }) { Text("Cancel") } }
        )
    }

    if (showClosePicker) {
        val state = rememberTimePickerState(initialHour = closeHour, initialMinute = closeMinute, is24Hour = true)
        AlertDialog(
            onDismissRequest = { showClosePicker = false },
            title = { Text("Closes at") },
            text = {
                TimePicker(state = state,
                    colors = TimePickerDefaults.colors(clockDialColor = Teal500.copy(alpha = 0.1f)))
            },
            confirmButton = {
                TextButton(onClick = { closeHour = state.hour; closeMinute = state.minute; showClosePicker = false }) {
                    Text("OK", color = Teal500)
                }
            },
            dismissButton = { TextButton(onClick = { showClosePicker = false }) { Text("Cancel") } }
        )
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Operating Hours", fontWeight = FontWeight.SemiBold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = White)
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) { data -> Snackbar(snackbarData = data) } },
        containerColor = Gray100
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {

            // ── 24/7 Toggle Card ──
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = White)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(TimeOrange.copy(alpha = 0.1f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Filled.AccessTime, contentDescription = null,
                                tint = TimeOrange, modifier = Modifier.size(20.dp))
                        }
                        Column {
                            Text("Open 24/7", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
                            Text("Always open, all days", style = MaterialTheme.typography.bodySmall, color = Gray500)
                        }
                    }
                    Switch(
                        checked = is24Hours,
                        onCheckedChange = { is24Hours = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = White, checkedTrackColor = Teal500)
                    )
                }
            }

            // ── Day + Time Selection (hidden when 24/7) ──
            if (!is24Hours) {

                // Day selection card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = White)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text("Open Days",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = Gray500)

                        AllDays.list.forEach { day ->
                            val isSelected = selectedDays.contains(day)
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        selectedDays = if (isSelected) selectedDays - day else selectedDays + day
                                    }
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(day, style = MaterialTheme.typography.bodyMedium)
                                Box(
                                    modifier = Modifier
                                        .size(24.dp)
                                        .clip(CircleShape)
                                        .background(if (isSelected) Teal500 else Color.Transparent)
                                        .border(1.5.dp, if (isSelected) Teal500 else Gray500.copy(alpha = 0.4f), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (isSelected) {
                                        Text("✓", style = MaterialTheme.typography.labelSmall, color = White)
                                    }
                                }
                            }
                            if (day != AllDays.list.last()) HorizontalDivider(color = Gray100)
                        }
                    }
                }

                // Time pickers card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = White)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text("Opening Hours",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = Gray500)

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            TimePickerRow(
                                label = "Opens at",
                                time = "%02d:%02d".format(openHour, openMinute),
                                onClick = { showOpenPicker = true }
                            )
                            TimePickerRow(
                                label = "Closes at",
                                time = "%02d:%02d".format(closeHour, closeMinute),
                                onClick = { showClosePicker = true }
                            )
                        }
                    }
                }
            }

            // ── Save Button ──
            PrimaryButton(
                text = if (isSaving) "Saving…" else "Save Hours",
                onClick = {
                    val pharmId = pharmacy?.id
                    if (pharmId.isNullOrBlank()) return@PrimaryButton
                    if (!is24Hours && selectedDays.isEmpty()) return@PrimaryButton
                    scope.launch {
                        isSaving = true
                        val orderedDays = AllDays.list.filter { selectedDays.contains(it) }
                        val result = repo.updateOperatingHours(
                            pharmacyId = pharmId,
                            is24Hours = is24Hours,
                            days = orderedDays,
                            openTime = "%02d:%02d".format(openHour, openMinute),
                            closeTime = "%02d:%02d".format(closeHour, closeMinute)
                        )
                        isSaving = false
                        if (result.isSuccess) {
                            snackbarHostState.showSnackbar("Hours updated successfully ✓")
                            pharmacyViewModel.loadPharmacyByOwnerId(authViewModel.currentUser?.uid ?: "")
                        } else {
                            snackbarHostState.showSnackbar("Failed to save: ${result.exceptionOrNull()?.message}")
                        }
                    }
                },
                enabled = !isSaving && (is24Hours || selectedDays.isNotEmpty()),
                isLoading = isSaving
            )
        }
    }
}

@Composable
private fun TimePickerRow(label: String, time: String, onClick: () -> Unit) {
    Column(horizontalAlignment = Alignment.Start) {
        Text(label, style = MaterialTheme.typography.labelSmall, color = Gray500)
        Spacer(Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .background(Gray100, RoundedCornerShape(10.dp))
                .clickable(onClick = onClick)
                .padding(horizontal = 24.dp, vertical = 14.dp)
        ) {
            Text(time, style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.SemiBold, color = Teal500)
        }
    }
}
