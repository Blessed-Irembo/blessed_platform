package com.blessedirembo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Sort
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.BottomSheetScaffold
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberBottomSheetScaffoldState
import androidx.compose.material3.rememberModalBottomSheetState
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blessedirembo.app.analytics.AnalyticsManager
import com.blessedirembo.app.data.model.Pharmacy
import com.blessedirembo.app.ui.components.PharmacyInfo
import com.blessedirembo.app.ui.components.PharmacyListItem
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray400
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.ui.viewmodel.PharmacyUiState
import com.blessedirembo.app.ui.viewmodel.PharmacyViewModel
import com.blessedirembo.app.util.t
import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.google.android.gms.location.CurrentLocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import androidx.compose.ui.platform.LocalContext

private fun formatDistance(
    userLocation: android.location.Location?,
    pharmacyLat: Double,
    pharmacyLng: Double
): String {
    val refLoc = userLocation ?: android.location.Location("default").apply {
        latitude = -1.9536
        longitude = 30.0606
    }
    val results = FloatArray(1)
    android.location.Location.distanceBetween(
        refLoc.latitude, refLoc.longitude,
        pharmacyLat, pharmacyLng,
        results
    )
    val distKm = results[0] / 1000f
    return String.format(java.util.Locale.US, "%.1f km away", distKm)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FindPharmaciesScreen(
    onBackClick: () -> Unit,
    onPharmacyClick: (String) -> Unit,
    isGuest: Boolean = false,
    onSignInRequired: () -> Unit = {},
    modifier: Modifier = Modifier,
    pharmacyViewModel: PharmacyViewModel = viewModel()
) {
    var searchQuery by remember { mutableStateOf("") }
    val uiState by pharmacyViewModel.uiState.collectAsState()
    val context = LocalContext.current
    var userLocation by remember { mutableStateOf<android.location.Location?>(null) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                      permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (granted) {
            val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
            try {
                fusedLocationClient.lastLocation.addOnSuccessListener { loc ->
                    if (loc != null) userLocation = loc
                }
            } catch (e: SecurityException) { }
        }
    }

    LaunchedEffect(Unit) {
        val hasFineLoc = ContextCompat.checkSelfPermission(
            context, Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val hasCoarseLoc = ContextCompat.checkSelfPermission(
            context, Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        if (!hasFineLoc && !hasCoarseLoc) {
            permissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        } else {
            val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
            try {
                val priority = if (hasFineLoc) Priority.PRIORITY_HIGH_ACCURACY
                               else Priority.PRIORITY_BALANCED_POWER_ACCURACY
                val request = CurrentLocationRequest.Builder()
                    .setPriority(priority)
                    .setMaxUpdateAgeMillis(30_000L)
                    .setDurationMillis(5_000L)
                    .build()
                fusedLocationClient.getCurrentLocation(request, null)
                    .addOnSuccessListener { loc ->
                        if (loc != null) userLocation = loc
                    }
                fusedLocationClient.lastLocation.addOnSuccessListener { loc ->
                    if (loc != null && userLocation == null) userLocation = loc
                }
            } catch (e: SecurityException) { }
        }
    }

    // QuickDetailsSheet state — mirrors iOS selectedPharmacy + QuickDetailsSheet
    var quickPharmacy by remember { mutableStateOf<PharmacyInfo?>(null) }
    var selectedPharmacyId by remember { mutableStateOf<String?>(null) }
    val quickSheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    val scaffoldState = rememberBottomSheetScaffoldState()

    // Log screen view
    LaunchedEffect(Unit) {
        AnalyticsManager.logScreenView("FindPharmacies")
    }

    // Trigger search when query changes
    LaunchedEffect(searchQuery) {
        if (searchQuery.isEmpty()) {
            pharmacyViewModel.loadNearbyPharmacies()
        } else {
            pharmacyViewModel.searchPharmacies(searchQuery)
        }
    }

    // ── QuickDetailsSheet — shown when a map marker is tapped
    // mirrors iOS QuickDetailsSheet with name, verified badge, address, View Details CTA
    if (quickPharmacy != null) {
        ModalBottomSheet(
            onDismissRequest = {
                quickPharmacy = null
                selectedPharmacyId = null
            },
            sheetState = quickSheetState,
            containerColor = White,
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
        ) {
            val p = quickPharmacy!!
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .padding(bottom = 32.dp)
            ) {
                // Pharmacy name + verified badge — mirrors iOS HStack with checkmark.seal.fill
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = p.name,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Gray900
                            )
                            if (p.isVerified) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Icon(
                                    imageVector = Icons.Filled.Verified,
                                    contentDescription = "Verified",
                                    tint = Teal500,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        // Distance row — mirrors iOS location.fill + formattedDistance
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Filled.LocationOn,
                                contentDescription = null,
                                tint = Teal500,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = p.distance.ifBlank { "—" },
                                style = MaterialTheme.typography.bodyMedium,
                                color = Gray500
                            )
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        // Address
                        Text(
                            text = p.address,
                            style = MaterialTheme.typography.bodySmall,
                            color = Gray500,
                            maxLines = 2
                        )
                    }

                    // Close button — mirrors iOS xmark.circle.fill
                    IconButton(
                        onClick = {
                            quickPharmacy = null
                            selectedPharmacyId = null
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Close,
                            contentDescription = "Close",
                            tint = Gray400
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // "View Details" CTA — mirrors iOS NavigationLink with primaryTeal background
                androidx.compose.material3.Button(
                    onClick = {
                        quickPharmacy = null
                        selectedPharmacyId = null
                        if (isGuest) onSignInRequired() else onPharmacyClick(p.id)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(
                        containerColor = Teal500
                    )
                ) {
                    Text(
                        text = t("map.viewDetails"),
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = White
                    )
                }
            }
        }
    }

    BottomSheetScaffold(
        scaffoldState = scaffoldState,
        sheetPeekHeight = 280.dp,
        sheetShape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        sheetContainerColor = White,
        sheetContentColor = Gray900,
        sheetShadowElevation = 16.dp,
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = t("map.nearMe"),
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
        sheetContent = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                // Header (Status Row)
                when (val state = uiState) {
                    is PharmacyUiState.Loading -> {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                            Text(t("common.loading"), style = MaterialTheme.typography.bodyMedium, color = Gray500)
                        }
                    }

                    is PharmacyUiState.Error -> {
                        Text(
                            text = state.message,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.error,
                            modifier = Modifier.padding(vertical = 12.dp)
                        )
                    }

                    is PharmacyUiState.Success -> {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "${state.pharmacies.size} ${t("map.pharmacies")} ${t("map.nearMe")}",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = Gray900
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.clickable { /* TODO: sort options */ }
                            ) {
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.Sort,
                                    contentDescription = "Sort",
                                    tint = Teal500,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(t("map.sort"), style = MaterialTheme.typography.bodyMedium, color = Teal500, fontWeight = FontWeight.Medium)
                            }
                        }

                        // Pharmacy List — uses updated PharmacyListItem card layout
                        LazyColumn(
                            contentPadding = PaddingValues(bottom = 24.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(state.pharmacies) { pharmacy ->
                                val distanceStr = formatDistance(userLocation, pharmacy.latitude, pharmacy.longitude)
                                
                                val pharmacyInfo = PharmacyInfo(
                                    id = pharmacy.id,
                                    name = pharmacy.name,
                                    distance = distanceStr,
                                    rating = pharmacy.rating.toFloat(),
                                    reviewCount = pharmacy.reviewCount,
                                    address = pharmacy.address,
                                    isOpen = pharmacy.isCurrentlyOpen,
                                    isVerified = pharmacy.isVerified,
                                    latitude = pharmacy.latitude,
                                    longitude = pharmacy.longitude
                                )
                                PharmacyListItem(
                                    pharmacy = pharmacyInfo,
                                    isSelected = selectedPharmacyId == pharmacy.id,
                                    onClick = {
                                        if (isGuest) {
                                            onSignInRequired()
                                        } else {
                                            onPharmacyClick(pharmacy.id)
                                        }
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    ) { paddingValues ->
        // Underlying map view container
        Box(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            val pharmacies = if (uiState is PharmacyUiState.Success) {
                (uiState as PharmacyUiState.Success).pharmacies
            } else emptyList()

            val mapPharmacies = pharmacies.map { p ->
                val distanceStr = formatDistance(userLocation, p.latitude, p.longitude)
                PharmacyInfo(
                    id = p.id,
                    name = p.name,
                    distance = distanceStr,
                    rating = p.rating.toFloat(),
                    reviewCount = p.reviewCount,
                    address = p.address,
                    isOpen = p.isCurrentlyOpen,
                    isVerified = p.isVerified,
                    latitude = p.latitude,
                    longitude = p.longitude
                )
            }

            com.blessedirembo.app.ui.components.GoogleMapView(
                pharmacies = mapPharmacies,
                selectedPharmacyId = selectedPharmacyId,
                onPharmacyClick = { id ->
                    // Tap on marker → show QuickDetailsSheet (mirrors iOS onPharmacyTap)
                    val pharmacy = mapPharmacies.find { it.id == id }
                    if (pharmacy != null) {
                        selectedPharmacyId = id
                        quickPharmacy = pharmacy
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            // Overlays: Search Bar and Location Button
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // Search Bar with shadow so it separates from the map
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = {
                        Text(text = t("map.searchPlaceholder"), color = Gray400)
                    },
                    leadingIcon = {
                        Icon(imageVector = Icons.Filled.Search, contentDescription = null, tint = Gray400)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(elevation = 8.dp, shape = RoundedCornerShape(12.dp)),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        unfocusedBorderColor = Color.Transparent,
                        focusedBorderColor = Teal500,
                        unfocusedContainerColor = White,
                        focusedContainerColor = White
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Location Button aligned to end — mirrors iOS locationButton
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .shadow(elevation = 8.dp, shape = CircleShape)
                            .clip(CircleShape)
                            .background(White)
                            .clickable { pharmacyViewModel.loadNearbyPharmacies() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.MyLocation,
                            contentDescription = "My Location",
                            tint = Teal500,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }
    }
}
