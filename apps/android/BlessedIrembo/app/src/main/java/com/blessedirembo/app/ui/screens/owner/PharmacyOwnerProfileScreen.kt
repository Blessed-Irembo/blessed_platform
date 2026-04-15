package com.blessedirembo.app.ui.screens.owner

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Help
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.LocalPharmacy
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.blessedirembo.app.ui.components.SettingsListItem
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.SuccessGreen
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White

// Custom colors for icons
val EditBlue = Color(0xFF3B82F6)
val TimeOrange = Color(0xFFF97316)
val LocationRed = Color(0xFFEF4444)
val PlanPurple = Color(0xFFA855F7)
val StaffGreen = Color(0xFF22C55E)

/**
 * Pharmacy Owner Profile Screen
 * Shows business info, management, and app settings
 */
@Composable
fun PharmacyOwnerProfileScreen(
    pharmacyViewModel: com.blessedirembo.app.ui.viewmodel.PharmacyViewModel = androidx.lifecycle.viewmodel.compose.viewModel(),
    authViewModel: com.blessedirembo.app.auth.AuthViewModel = androidx.lifecycle.viewmodel.compose.viewModel(),
    onEditProfileClick: () -> Unit = {},
    onOperatingHoursClick: () -> Unit = {},
    onLocationClick: () -> Unit = {},
    onSubscriptionClick: () -> Unit = {},
    onStaffMembersClick: () -> Unit = {},
    onNotificationsClick: () -> Unit = {},
    onPrivacyClick: () -> Unit = {},
    onHelpClick: () -> Unit = {},
    onSignOutClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    val pharmacy by pharmacyViewModel.ownerPharmacy.collectAsState()
    
    LaunchedEffect(Unit) {
        val uid = authViewModel.currentUser?.uid
        if (uid != null) {
            pharmacyViewModel.loadPharmacyByOwnerId(uid)
        }
    }
    
    val pharmacyName = pharmacy?.name?.takeIf { it.isNotBlank() } ?: "Loading..."
    val isVerified = pharmacy?.isVerified ?: false
    
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Gray100)
            .verticalScroll(scrollState)
    ) {
        // Header with pharmacy info
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(White)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Pharmacy icon
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(androidx.compose.foundation.shape.CircleShape)
                    .background(Teal500.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.LocalPharmacy, // iOS uses cross.case.fill
                    contentDescription = null,
                    tint = Teal500,
                    modifier = Modifier.size(40.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = pharmacyName,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = Gray900
            )
            
            if (isVerified) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .background(SuccessGreen.copy(alpha = 0.1f), RoundedCornerShape(12.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.CheckCircle,
                        contentDescription = "Verified",
                        tint = SuccessGreen,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Verified Partner",
                        style = MaterialTheme.typography.labelSmall,
                        color = SuccessGreen
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Business Information Section
        SectionHeader(title = "Business Information")
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = White),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Column {
                SettingsListItem(
                    icon = Icons.Filled.Edit,
                    title = "Edit Profile",
                    onClick = onEditProfileClick,
                    iconTint = EditBlue
                )
                SettingsListItem(
                    icon = Icons.Filled.AccessTime,
                    title = "Operating Hours",
                    onClick = onOperatingHoursClick,
                    iconTint = TimeOrange
                )
                SettingsListItem(
                    icon = Icons.Filled.LocationOn,
                    title = "Location & Address",
                    onClick = onLocationClick,
                    iconTint = LocationRed
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Management Section
        SectionHeader(title = "Management")
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = White),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Column {
                SettingsListItem(
                    icon = Icons.Filled.CreditCard,
                    title = "Subscription Plan",
                    onClick = onSubscriptionClick,
                    iconTint = PlanPurple
                )
                SettingsListItem(
                    icon = Icons.Filled.Groups,
                    title = "Staff Members",
                    onClick = onStaffMembersClick,
                    iconTint = StaffGreen
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // App Settings Section
        SectionHeader(title = "App Settings")
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = White),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Column {
                SettingsListItem(
                    icon = Icons.Filled.Notifications,
                    title = "Notifications",
                    onClick = onNotificationsClick,
                    iconTint = Teal500
                )
                SettingsListItem(
                    icon = Icons.Filled.Lock,
                    title = "Privacy & Security",
                    onClick = onPrivacyClick,
                    iconTint = Teal500
                )
                SettingsListItem(
                    icon = Icons.AutoMirrored.Filled.Help,
                    title = "Help & Support",
                    onClick = onHelpClick,
                    iconTint = Teal500
                )
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Sign Out Button
        TextButton(
            onClick = onSignOutClick,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
        ) {
            Text(
                text = "Sign Out",
                style = MaterialTheme.typography.bodyLarge,
                color = Color(0xFFEF4444),
                fontWeight = FontWeight.SemiBold
            )
        }
        
        Spacer(modifier = Modifier.height(100.dp)) // Bottom nav spacing
    }
}

@Composable
private fun SectionHeader(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.bodyMedium,
        color = Gray500,
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
    )
}
