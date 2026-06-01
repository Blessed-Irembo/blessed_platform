package com.blessedirembo.app.ui.screens.owner

import android.location.Geocoder
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.spring
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBarDefaults
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blessedirembo.app.auth.AuthViewModel
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.ui.viewmodel.PharmacyViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import com.blessedirembo.app.util.t

/**
 * EditLocationScreen
 *
 * Mirrors iOS EditLocationView.swift exactly:
 * - Read-only info card showing current address, district, and GPS coordinates
 * - "Change Address" button to unlock edit mode
 * - Edit fields: address (multiline), district, latitude, longitude
 * - "Auto-fill coordinates from address" geocoder button
 * - "Save Location" button → writes to Firestore via PharmacyViewModel
 * - "Cancel" button → exits edit mode and resets fields
 * - Success/error AlertDialog messages
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditLocationScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier,
    authViewModel: AuthViewModel = viewModel(),
    pharmacyViewModel: PharmacyViewModel = viewModel()
) {
    val pharmacy by pharmacyViewModel.ownerPharmacy.collectAsState()
    val updateResult by pharmacyViewModel.updateLocationResult.collectAsState()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // ── Edit mode toggle (mirrors iOS @State isEditing) ──
    var isEditing by remember { mutableStateOf(false) }

    // ── Form fields ──
    var address by remember { mutableStateOf("") }
    var district by remember { mutableStateOf("") }
    var latitudeText by remember { mutableStateOf("") }
    var longitudeText by remember { mutableStateOf("") }

    // ── Async state ──
    var isSaving by remember { mutableStateOf(false) }
    var isGeocoding by remember { mutableStateOf(false) }
    var showSuccess by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // Load current pharmacy values into form when pharmacy data arrives or edit mode starts
    fun loadCurrentValues() {
        pharmacy?.let {
            address = it.address
            district = it.district
            latitudeText = if (it.latitude != 0.0) String.format("%.6f", it.latitude) else ""
            longitudeText = if (it.longitude != 0.0) String.format("%.6f", it.longitude) else ""
        }
    }

    LaunchedEffect(pharmacy) {
        if (pharmacy != null) loadCurrentValues()
    }

    // ── React to save result ──
    LaunchedEffect(updateResult) {
        val result = updateResult ?: return@LaunchedEffect
        isSaving = false
        if (result.isSuccess) {
            showSuccess = true
        } else {
            errorMessage = result.exceptionOrNull()?.message ?: "Failed to save location."
        }
        pharmacyViewModel.clearUpdateLocationResult()
    }

    // ── Geocoding helper (mirrors iOS CLGeocoder) ──
    fun geocodeAddress() {
        if (address.isBlank()) return
        isGeocoding = true
        errorMessage = null
        scope.launch {
            try {
                val query = "${address.trim()}, ${district.trim()}, Rwanda"
                @Suppress("DEPRECATION")
                val results = withContext(Dispatchers.IO) {
                    Geocoder(context).getFromLocationName(query, 1)
                }
                withContext(Dispatchers.Main) {
                    isGeocoding = false
                    val loc = results?.firstOrNull()
                    if (loc != null) {
                        latitudeText = String.format("%.6f", loc.latitude)
                        longitudeText = String.format("%.6f", loc.longitude)
                    } else {
                        errorMessage = "No results found. Try a more specific address."
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    isGeocoding = false
                    errorMessage = "Could not find coordinates: ${e.localizedMessage}"
                }
            }
        }
    }

    // ── Save location (mirrors iOS EditLocationView.save()) ──
    fun save() {
        val p = pharmacy ?: return
        errorMessage = null
        val lat = latitudeText.toDoubleOrNull() ?: p.latitude
        val lon = longitudeText.toDoubleOrNull() ?: p.longitude

        // Rwanda coordinate validation (mirrors iOS Pharmacy.isValidRwandaCoordinates)
        if (lat !in (-2.9)..(-1.0) || lon !in 28.8..30.9) {
            errorMessage = "Coordinates appear to be outside Rwanda. Please double-check."
            return
        }

        isSaving = true
        pharmacyViewModel.updateLocation(
            pharmacyId = p.id,
            address = address.trim(),
            district = district.trim(),
            latitude = lat,
            longitude = lon
        )
    }

    // ── Dialogs ──
    if (showSuccess) {
        AlertDialog(
            onDismissRequest = {
                showSuccess = false
                isEditing = false
                onBackClick()
            },
            title = { Text(t("profile.locationUpdated")) },
            text = { Text(t("profile.locationUpdatedDesc")) },
            confirmButton = {
                TextButton(onClick = {
                    showSuccess = false
                    isEditing = false
                    onBackClick()
                }) {
                    Text("OK", color = Teal500)
                }
            }
        )
    }

    if (errorMessage != null) {
        AlertDialog(
            onDismissRequest = { errorMessage = null },
            title = { Text(t("common.error")) },
            text = { Text(errorMessage ?: "") },
            confirmButton = {
                TextButton(onClick = { errorMessage = null }) {
                    Text("OK", color = Teal500)
                }
            }
        )
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        "Location & Address",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = White)
            )
        },
        containerColor = Gray100,
        modifier = modifier
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {

            // ── Section 1: Current Info (always visible, read-only) ─────────
            SectionCard(title = t("profile.currentLocation")) {
                LocationInfoRow(
                    icon = Icons.Filled.LocationOn,
                    iconTint = Color(0xFFEF4444),
                    label = t("auth.addressLabel"),
                    value = pharmacy?.address?.ifBlank { null } ?: t("common.notSet")
                )
                LocationInfoRow(
                    icon = Icons.Filled.Place,
                    iconTint = Teal500,
                    label = t("auth.districtLabel"),
                    value = pharmacy?.district?.ifBlank { null } ?: t("common.notSet")
                )
                val lat = pharmacy?.latitude ?: 0.0
                val lon = pharmacy?.longitude ?: 0.0
                if (lat != 0.0 || lon != 0.0) {
                    LocationInfoRow(
                        icon = Icons.Filled.MyLocation,
                        iconTint = Color(0xFF3B82F6),
                        label = t("profile.coordinates"),
                        value = String.format("%.5f, %.5f", lat, lon)
                    )
                }

                if (!isEditing) {
                    Spacer(modifier = Modifier.height(8.dp))
                    TextButton(
                        onClick = { isEditing = true },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Filled.Edit, contentDescription = null, tint = Teal500, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text(
                            t("profile.changeAddress"),
                            fontWeight = FontWeight.SemiBold,
                            color = Teal500
                        )
                    }
                }
            }

            // ── Section 2: Edit Fields (only when isEditing) ─────────────────
            AnimatedVisibility(
                visible = isEditing,
                enter = expandVertically(animationSpec = spring()),
                exit = shrinkVertically(animationSpec = spring())
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {

                    SectionCard(
                        title = t("profile.editLocation"),
                        footer = t("profile.findCoordsHint")
                    ) {
                        OutlinedTextField(
                            value = address,
                            onValueChange = { address = it },
                            label = { Text(t("profile.streetAddress")) },
                            minLines = 2,
                            maxLines = 4,
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Teal500,
                                focusedLabelColor = Teal500
                            )
                        )
                        OutlinedTextField(
                            value = district,
                            onValueChange = { district = it },
                            label = { Text(t("profile.districtPlaceholder")) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Teal500,
                                focusedLabelColor = Teal500
                            )
                        )
                        OutlinedTextField(
                            value = latitudeText,
                            onValueChange = { latitudeText = it },
                            label = { Text(t("auth.latitude")) },
                            placeholder = { Text("–1.9536") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Teal500,
                                focusedLabelColor = Teal500
                            )
                        )
                        OutlinedTextField(
                            value = longitudeText,
                            onValueChange = { longitudeText = it },
                            label = { Text(t("auth.longitude")) },
                            placeholder = { Text("30.0606") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Teal500,
                                focusedLabelColor = Teal500
                            )
                        )
                        TextButton(
                            onClick = {
                                isEditing = false
                                loadCurrentValues()
                                errorMessage = null
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(t("common.cancel"), color = Gray500)
                        }
                    }

                    // ── Geocode Button ─────────────────────────────────────────
                    Button(
                        onClick = { geocodeAddress() },
                        enabled = address.isNotBlank() && !isGeocoding,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (address.isNotBlank()) Teal500.copy(alpha = 0.15f) else Gray100,
                            contentColor = if (address.isNotBlank()) Teal500 else Gray500,
                            disabledContainerColor = Gray100,
                            disabledContentColor = Gray500
                        )
                    ) {
                        if (isGeocoding) {
                            CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp, color = Teal500)
                            Spacer(Modifier.width(8.dp))
                            Text(t("auth.gettingLocation"))
                        } else {
                            Icon(Icons.Filled.Map, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text(t("profile.autoFillCoords"), fontWeight = FontWeight.Medium)
                        }
                    }

                    Button(
                        onClick = { save() },
                        enabled = address.isNotBlank() && !isSaving,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Teal500)
                    ) {
                        if (isSaving) {
                            CircularProgressIndicator(color = White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                            Spacer(Modifier.width(8.dp))
                            Text(t("common.saving"), fontWeight = FontWeight.SemiBold, color = White)
                        } else {
                            Text(t("profile.saveLocation"), fontWeight = FontWeight.SemiBold, color = White)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(60.dp))
        }
    }
}

// ── Private helper composables ────────────────────────────────────────────────

@Composable
private fun SectionCard(
    title: String,
    footer: String? = null,
    content: @Composable () -> Unit
) {
    Column {
        Text(
            text = title.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = Gray500,
            modifier = Modifier.padding(horizontal = 4.dp, vertical = 6.dp)
        )
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(White)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            content()
        }
        if (footer != null) {
            Text(
                text = footer,
                style = MaterialTheme.typography.labelSmall,
                color = Gray500,
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 6.dp)
            )
        }
    }
}

@Composable
private fun LocationInfoRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconTint: Color,
    label: String,
    value: String
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(iconTint.copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = iconTint,
                modifier = Modifier.size(18.dp)
            )
        }
        Column {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = Gray500
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium,
                color = Gray900,
                fontWeight = FontWeight.Medium
            )
        }
    }
}
