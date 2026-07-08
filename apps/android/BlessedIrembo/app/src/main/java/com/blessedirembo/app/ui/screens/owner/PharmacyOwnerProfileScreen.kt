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
import androidx.compose.foundation.layout.statusBarsPadding
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
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import android.content.Intent
import android.net.Uri
import androidx.compose.ui.platform.LocalContext
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Shield
import com.blessedirembo.app.ui.components.SettingsListItem
import com.blessedirembo.app.ui.components.DeleteAccountDialog
import com.blessedirembo.app.auth.AuthState
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.SuccessGreen
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.util.t

// Custom colors for icons
val EditBlue = Color(0xFF3B82F6)
val TimeOrange = Color(0xFFF97316)
val LocationRed = Color(0xFFEF4444)
val PlanPurple = Color(0xFFA855F7)
val StaffGreen = Color(0xFF22C55E)
private val IosBackground = Color(0xFFF2F2F7)

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
    onNotificationsClick: () -> Unit = {},
    onSignOutClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    val pharmacy by pharmacyViewModel.ownerPharmacy.collectAsState()
    val context = LocalContext.current
    
    var showDeleteDialog by remember { androidx.compose.runtime.mutableStateOf(false) }
    val deleteAccountState by authViewModel.deleteAccountState.collectAsState()
    val isDeleting = deleteAccountState is AuthState.Loading
    val deleteError = (deleteAccountState as? AuthState.Error)?.message
    
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
            .background(IosBackground)
            .verticalScroll(scrollState)
            .statusBarsPadding()
    ) {
        // Header with pharmacy info
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp, bottom = 24.dp),
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
                        text = t("details.verified") + " Partner",
                        style = MaterialTheme.typography.labelSmall,
                        color = SuccessGreen
                    )
                }
            }
        }
        
        // Business Information Section
        SectionHeader(title = t("owner.businessInfo"))
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = White),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Column {
                SettingsListItem(
                    icon = Icons.Filled.Edit,
                    title = t("owner.editProfile"),
                    onClick = onEditProfileClick,
                    iconTint = EditBlue
                )
                SettingsListItem(
                    icon = Icons.Filled.AccessTime,
                    title = t("owner.operatingHours"),
                    onClick = onOperatingHoursClick,
                    iconTint = TimeOrange
                )
                SettingsListItem(
                    icon = Icons.Filled.LocationOn,
                    title = t("owner.locationAddress"),
                    onClick = onLocationClick,
                    iconTint = LocationRed
                )
            }
        }
        
        // Management Section
        SectionHeader(title = t("owner.management"))
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = White),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Column {
                SettingsListItem(
                    icon = Icons.Filled.CreditCard,
                    title = t("owner.subscriptionPlan"),
                    onClick = onSubscriptionClick,
                    iconTint = PlanPurple
                )
            }
        }
        
        // App Settings Section
        SectionHeader(title = t("nav.settings"))
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = White),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Column {
                SettingsListItem(
                    icon = Icons.Filled.Notifications,
                    title = t("profile.notifications"),
                    onClick = onNotificationsClick,
                    iconTint = Teal500
                )
                SettingsListItem(
                    title = t("profile.privacyPolicy"),
                    icon = Icons.Filled.Shield,
                    onClick = {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.blessedirembo.com/privacy-policy"))
                        context.startActivity(intent)
                    },
                    iconTint = Teal500
                )
                SettingsListItem(
                    icon = Icons.Filled.Description,
                    title = t("profile.terms"),
                    onClick = {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.blessedirembo.com/terms"))
                        context.startActivity(intent)
                    },
                    iconTint = Teal500
                )
                SettingsListItem(
                    icon = Icons.AutoMirrored.Filled.Help,
                    title = t("profile.help"),
                    onClick = {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://blessedirembo.com/help"))
                        context.startActivity(intent)
                    },
                    iconTint = Teal500
                )
            }
        }
        
        Spacer(modifier = Modifier.height(32.dp))
        
        // Sign Out Button
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .clickable { onSignOutClick() },
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = White),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = t("profile.logout"),
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color(0xFFEF4444),
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Delete Account Button
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .clickable { showDeleteDialog = true },
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = Color.Red.copy(alpha = 0.08f)),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color.Red.copy(alpha = 0.2f))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = t("profile.deleteAccount"),
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color.Red,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
        
        Spacer(modifier = Modifier.height(100.dp)) // Bottom nav spacing

        if (showDeleteDialog) {
            DeleteAccountDialog(
                onDismiss = {
                    authViewModel.resetDeleteAccountState()
                    showDeleteDialog = false
                },
                onConfirm = { password ->
                    authViewModel.deleteAccount(password) { result ->
                        if (result.isSuccess) {
                            showDeleteDialog = false
                            onSignOutClick()
                        }
                    }
                },
                isLoading = isDeleting,
                errorMessage = deleteError
            )
        }
    }
}

@Composable
private fun SectionHeader(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.bodyMedium,
        color = Gray500,
        modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 24.dp, bottom = 6.dp)
    )
}
