package com.blessedirembo.app.ui.screens

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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Message
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Directions
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blessedirembo.app.analytics.AnalyticsManager
import com.blessedirembo.app.ui.components.StarRating
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray300
import com.blessedirembo.app.ui.theme.Gray400
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.ui.viewmodel.InquiryViewModel
import com.blessedirembo.app.ui.viewmodel.PharmacyViewModel
import com.blessedirembo.app.ui.viewmodel.SendState
import kotlinx.coroutines.launch

/**
 * Pharmacy Detail Screen
 * Loads real pharmacy data from Firestore and shows inquiry bottom sheet.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PharmacyDetailScreen(
    pharmacyId: String,
    onBackClick: () -> Unit,
    onShareClick: () -> Unit = {},
    modifier: Modifier = Modifier,
    pharmacyViewModel: PharmacyViewModel = viewModel(),
    inquiryViewModel: InquiryViewModel = viewModel()
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("About", "Services", "Reviews")
    val scrollState = rememberScrollState()
    val pharmacy by pharmacyViewModel.selectedPharmacy.collectAsState()
    val sendState by inquiryViewModel.sendState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val sheetState = rememberModalBottomSheetState()
    var showInquirySheet by remember { mutableStateOf(false) }
    var inquiryMessage by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()

    // Load pharmacy on entry + log analytics
    LaunchedEffect(pharmacyId) {
        pharmacyViewModel.loadPharmacyById(pharmacyId)
        pharmacy?.let { AnalyticsManager.logPharmacyView(pharmacyId, it.name) }
    }

    // React to send state
    LaunchedEffect(sendState) {
        when (val state = sendState) {
            is SendState.Success -> {
                snackbarHostState.showSnackbar("Inquiry sent! The pharmacy will reply soon.")
                inquiryMessage = ""
                showInquirySheet = false
                inquiryViewModel.resetSendState()
            }
            is SendState.Error -> {
                snackbarHostState.showSnackbar(state.message)
                inquiryViewModel.resetSendState()
            }
            else -> Unit
        }
    }

    // If pharmacy not loaded yet, use display placeholders
    val pharmacyName = pharmacy?.name ?: "Loading..."
    val distance = "—"
    val rating = pharmacy?.rating?.toFloat() ?: 0f
    val reviewCount = pharmacy?.reviewCount ?: 0
    val aboutText = pharmacy?.description?.ifBlank {
        "A verified pharmacy offering prescription medications, OTC drugs, and health consultations."
    } ?: "Loading..."
    val address = pharmacy?.address ?: "—"
    val phone = pharmacy?.phoneNumber?.ifBlank { pharmacy?.phone }?.ifBlank { "—" } ?: "—"
    val emailText = pharmacy?.email?.ifBlank { "—" } ?: "—"
    val operatingHours = pharmacy?.displayOperatingHours ?: "—"

    // Inquiry Bottom Sheet
    if (showInquirySheet) {
        ModalBottomSheet(
            onDismissRequest = { showInquirySheet = false },
            sheetState = sheetState
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp)
                    .padding(bottom = 32.dp)
            ) {
                Text(
                    text = "Send Inquiry",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Gray900
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Message to $pharmacyName",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Gray500
                )
                Spacer(modifier = Modifier.height(24.dp))
                OutlinedTextField(
                    value = inquiryMessage,
                    onValueChange = { inquiryMessage = it },
                    placeholder = { Text("e.g. Do you have Amoxicillin 500mg in stock?") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Teal500,
                        unfocusedBorderColor = Gray300
                    ),
                    maxLines = 5
                )
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = {
                        val msg = inquiryMessage.trim()
                        if (msg.isNotEmpty()) {
                            inquiryViewModel.sendInquiry(
                                pharmacyId = pharmacyId,
                                pharmacyName = pharmacyName,
                                message = msg
                            )
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Teal500),
                    enabled = inquiryMessage.isNotBlank() && sendState !is SendState.Sending
                ) {
                    if (sendState is SendState.Sending) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = White, strokeWidth = 2.dp)
                    } else {
                        Icon(imageVector = Icons.Filled.Send, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Send Inquiry", style = MaterialTheme.typography.labelLarge)
                    }
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { },
                navigationIcon = {
                    IconButton(
                        onClick = onBackClick,
                        modifier = Modifier.padding(8.dp).size(40.dp).clip(CircleShape).background(White)
                    ) {
                        Icon(imageVector = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Gray900)
                    }
                },
                actions = {
                    IconButton(
                        onClick = onShareClick,
                        modifier = Modifier.padding(8.dp).size(40.dp).clip(CircleShape).background(White)
                    ) {
                        Icon(imageVector = Icons.Filled.Share, contentDescription = "Share", tint = Teal500)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent)
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = White
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
        ) {
            // Map Header
            if (pharmacy != null) {
                val p = pharmacy!!
                val mapPharmacy = com.blessedirembo.app.ui.components.PharmacyInfo(
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

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(260.dp)
                ) {
                    com.blessedirembo.app.ui.components.GoogleMapView(
                        pharmacies = listOf(mapPharmacy),
                        selectedPharmacyId = p.id,
                        onPharmacyClick = { },
                        modifier = Modifier.fillMaxSize()
                    )
                }
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(260.dp)
                        .background(Color(0xFFE8F5E9)),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Teal500)
                }
            }

            // Pharmacy Info
            Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = pharmacyName, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = Gray900)
                    if (pharmacy?.isVerified == true) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(imageVector = Icons.Filled.CheckCircle, contentDescription = "Verified", tint = Teal500, modifier = Modifier.size(20.dp))
                    }
                }
                Text(text = distance, style = MaterialTheme.typography.bodyMedium, color = Gray500, modifier = Modifier.padding(top = 4.dp))
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 8.dp)) {
                    StarRating(rating = rating)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "$rating", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold, color = Gray900)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "($reviewCount reviews)", style = MaterialTheme.typography.bodyMedium, color = Gray500)
                }
            }

            // Action Buttons
            Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp), horizontalArrangement = Arrangement.SpaceEvenly) {
                ActionButton(icon = Icons.Filled.Call, label = "Call", onClick = { /* TODO: dial phone */ })
                ActionButton(icon = Icons.Filled.Directions, label = "Directions", onClick = { /* TODO: open maps */ })
                ActionButton(
                    icon = Icons.AutoMirrored.Filled.Message,
                    label = "Message",
                    onClick = {
                        scope.launch {
                            showInquirySheet = true
                            sheetState.show()
                        }
                    }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Tabs
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = White,
                contentColor = Teal500,
                indicator = { tabPositions ->
                    TabRowDefaults.SecondaryIndicator(
                        modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                        color = Teal500
                    )
                }
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = {
                            Text(
                                text = title,
                                fontWeight = if (selectedTab == index) FontWeight.SemiBold else FontWeight.Normal,
                                color = if (selectedTab == index) Teal500 else Gray500
                            )
                        }
                    )
                }
            }

            when (selectedTab) {
                0 -> AboutTabContent(aboutText = aboutText, address = address, phone = phone, email = emailText, operatingHours = operatingHours)
                1 -> ServicesTabContent(services = pharmacy?.services ?: emptyList())
                2 -> ReviewsTabContent(reviewCount = pharmacy?.reviewCount ?: 0)
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

/**
 * Circular action button (Call, Directions, Message)
 */
@Composable
private fun ActionButton(
    icon: ImageVector,
    label: String,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .clip(CircleShape)
                .border(1.dp, Gray300, CircleShape)
                .background(White)
                .clickable(onClick = onClick),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = Teal500,
                modifier = Modifier.size(24.dp)
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = Gray500
        )
    }
}

/**
 * About tab content
 */
@Composable
private fun AboutTabContent(
    aboutText: String,
    address: String,
    phone: String,
    email: String,
    operatingHours: String
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = "About",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = Gray900
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = aboutText,
            style = MaterialTheme.typography.bodyMedium,
            color = Gray500
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text(
            text = "Contact Information",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = Gray900
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        // Address
        ContactInfoRow(
            icon = Icons.Filled.LocationOn,
            text = address
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        // Phone
        ContactInfoRow(
            icon = Icons.Filled.Phone,
            text = phone
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        // Email
        ContactInfoRow(
            icon = Icons.Filled.Email,
            text = email
        )

        Spacer(modifier = Modifier.height(12.dp))
        
        // Operating Hours — matches iOS clock.fill
        ContactInfoRow(
            icon = Icons.Filled.Schedule,
            text = operatingHours
        )
    }
}

/**
 * Contact info row
 */
@Composable
private fun ContactInfoRow(
    icon: ImageVector,
    text: String
) {
    Row(
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Teal500,
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium,
            color = Gray900
        )
    }
}

/**
 * Services tab — renders the real services list.
 * Mirrors iOS servicesSection with checkmark.circle.fill per service,
 * or "No services listed" empty state.
 */
@Composable
private fun ServicesTabContent(services: List<String>) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = "Available Services",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = Gray900
        )
        Spacer(modifier = Modifier.height(12.dp))

        if (services.isEmpty()) {
            Text(
                text = "No services listed",
                style = MaterialTheme.typography.bodyMedium,
                color = Gray500,
                modifier = Modifier
                    .padding(vertical = 40.dp)
                    .fillMaxWidth()
            )
        } else {
            services.forEach { service ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Filled.CheckCircle,
                        contentDescription = null,
                        tint = Teal500,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = service,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Gray900
                    )
                }
            }
        }
    }
}

/**
 * Reviews tab — mirrors iOS reviewsSection empty state exactly:
 * star icon + "No reviews yet" + "Be the first to review this pharmacy"
 */
@Composable
private fun ReviewsTabContent(reviewCount: Int) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Customer Reviews",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = Gray900
            )
            if (reviewCount > 0) {
                Text(
                    text = "$reviewCount reviews",
                    style = MaterialTheme.typography.bodySmall,
                    color = Gray500
                )
            }
        }

        if (reviewCount == 0) {
            // Empty state — mirrors iOS exactly
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 40.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Filled.Star,
                    contentDescription = null,
                    tint = Gray400.copy(alpha = 0.4f),
                    modifier = Modifier.size(48.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "No reviews yet",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Gray500
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Be the first to review this pharmacy",
                    style = MaterialTheme.typography.bodySmall,
                    color = Gray500
                )
            }
        } else {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Reviews will be loaded from backend",
                style = MaterialTheme.typography.bodyMedium,
                color = Gray500
            )
        }
    }
}
