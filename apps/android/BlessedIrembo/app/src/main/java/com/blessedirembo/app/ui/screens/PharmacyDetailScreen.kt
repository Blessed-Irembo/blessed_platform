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
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.blessedirembo.app.ui.components.StarRating
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray300
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White

/**
 * Pharmacy Detail Screen
 * Shows pharmacy details with map, info, action buttons, and tabs
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PharmacyDetailScreen(
    pharmacyId: String,
    onBackClick: () -> Unit,
    onShareClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("About", "Services", "Reviews")
    val scrollState = rememberScrollState()
    
    // Sample pharmacy data (in real app, fetch based on pharmacyId)
    val pharmacyName = "City Pharmacy Kigali"
    val distance = "0 m"
    val rating = 4.5f
    val reviewCount = 127
    val aboutText = "Leading pharmacy in downtown Kigali offering a wide range of prescription medications, over-the-counter drugs, and health consultations."
    val address = "KN 5 Ave, Kigali"
    val phone = "+250788123456"
    val email = "contact@citypharmacy.rw"
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { },
                navigationIcon = {
                    IconButton(
                        onClick = onBackClick,
                        modifier = Modifier
                            .padding(8.dp)
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(White)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Gray900
                        )
                    }
                },
                actions = {
                    IconButton(
                        onClick = onShareClick,
                        modifier = Modifier
                            .padding(8.dp)
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(White)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Share,
                            contentDescription = "Share",
                            tint = Teal500
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Transparent
                )
            )
        },
        containerColor = White
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
        ) {
            // Map Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .background(Color(0xFFE8F5E9)),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    // Map pin placeholder
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Teal500),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.LocationOn,
                            contentDescription = null,
                            tint = White,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Map View",
                        style = MaterialTheme.typography.bodySmall,
                        color = Gray500
                    )
                }
            }
            
            // Pharmacy Info Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 16.dp)
            ) {
                // Name with verified badge
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = pharmacyName,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = Gray900
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(
                        imageVector = Icons.Filled.CheckCircle,
                        contentDescription = "Verified",
                        tint = Teal500,
                        modifier = Modifier.size(20.dp)
                    )
                }
                
                // Distance
                Text(
                    text = distance,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Gray500,
                    modifier = Modifier.padding(top = 4.dp)
                )
                
                // Rating
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(top = 8.dp)
                ) {
                    StarRating(rating = rating)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "$rating",
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.SemiBold,
                        color = Gray900
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "($reviewCount reviews)",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Gray500
                    )
                }
            }
            
            // Action Buttons
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                ActionButton(
                    icon = Icons.Filled.Call,
                    label = "Call",
                    onClick = { /* TODO: Call pharmacy */ }
                )
                ActionButton(
                    icon = Icons.Filled.Directions,
                    label = "Directions",
                    onClick = { /* TODO: Open directions */ }
                )
                ActionButton(
                    icon = Icons.AutoMirrored.Filled.Message,
                    label = "Message",
                    onClick = { /* TODO: Send message */ }
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
            
            // Tab Content
            when (selectedTab) {
                0 -> AboutTabContent(
                    aboutText = aboutText,
                    address = address,
                    phone = phone,
                    email = email
                )
                1 -> ServicesTabContent()
                2 -> ReviewsTabContent()
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
    email: String
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
 * Services tab content placeholder
 */
@Composable
private fun ServicesTabContent() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(32.dp))
        Text(
            text = "Services information coming soon",
            style = MaterialTheme.typography.bodyMedium,
            color = Gray500
        )
    }
}

/**
 * Reviews tab content placeholder
 */
@Composable
private fun ReviewsTabContent() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(32.dp))
        Text(
            text = "Reviews coming soon",
            style = MaterialTheme.typography.bodyMedium,
            color = Gray500
        )
    }
}
