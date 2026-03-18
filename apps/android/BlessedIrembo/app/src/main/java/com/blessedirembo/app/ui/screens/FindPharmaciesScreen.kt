package com.blessedirembo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.BottomSheetScaffold
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.SheetState
import androidx.compose.material3.SheetValue
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberBottomSheetScaffoldState
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
import com.blessedirembo.app.ui.theme.Gray300
import com.blessedirembo.app.ui.theme.Gray400
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.ui.viewmodel.PharmacyUiState
import com.blessedirembo.app.ui.viewmodel.PharmacyViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FindPharmaciesScreen(
    onBackClick: () -> Unit,
    onPharmacyClick: (String) -> Unit,
    modifier: Modifier = Modifier,
    pharmacyViewModel: PharmacyViewModel = viewModel()
) {
    var searchQuery by remember { mutableStateOf("") }
    val uiState by pharmacyViewModel.uiState.collectAsState()

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
                        text = "Find Pharmacies",
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
                            Text("Loading pharmacies...", style = MaterialTheme.typography.bodyMedium, color = Gray500)
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
                                text = "${state.pharmacies.size} pharmacies nearby",
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
                                Text("Sort", style = MaterialTheme.typography.bodyMedium, color = Teal500, fontWeight = FontWeight.Medium)
                            }
                        }

                        // Pharmacy List (Expands within bottom sheet)
                        LazyColumn(
                            contentPadding = PaddingValues(bottom = 24.dp)
                        ) {
                            items(state.pharmacies) { pharmacy ->
                                val pharmacyInfo = PharmacyInfo(
                                    id = pharmacy.id,
                                    name = pharmacy.name,
                                    distance = "—",
                                    rating = pharmacy.rating.toFloat(),
                                    reviewCount = pharmacy.reviewCount,
                                    address = pharmacy.address,
                                    isOpen = pharmacy.isOpen,
                                    isVerified = pharmacy.isVerified,
                                    latitude = pharmacy.latitude,
                                    longitude = pharmacy.longitude
                                )
                                PharmacyListItem(
                                    pharmacy = pharmacyInfo,
                                    onClick = { onPharmacyClick(pharmacy.id) }
                                )
                                if (pharmacy != state.pharmacies.last()) {
                                    HorizontalDivider(
                                        color = Gray100,
                                        modifier = Modifier.padding(vertical = 8.dp)
                                    )
                                }
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
                PharmacyInfo(
                    id = p.id,
                    name = p.name,
                    distance = "—",
                    rating = p.rating.toFloat(),
                    reviewCount = p.reviewCount,
                    address = p.address,
                    isOpen = p.isOpen,
                    isVerified = p.isVerified,
                    latitude = p.latitude,
                    longitude = p.longitude
                )
            }

            com.blessedirembo.app.ui.components.GoogleMapView(
                pharmacies = mapPharmacies,
                selectedPharmacyId = null,
                onPharmacyClick = { id -> onPharmacyClick(id) },
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
                        Text(text = "Search pharmacies...", color = Gray400)
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

                // Location Button aligned to end
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
