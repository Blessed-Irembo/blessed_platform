package com.blessedirembo.app.ui.screens.owner

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blessedirembo.app.ui.components.StatCard
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.SuccessGreen
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blessedirembo.app.ui.screens.NotificationsSheet
import com.blessedirembo.app.ui.viewmodel.NotificationViewModel
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

val BlueAccent = Color(0xFF3B82F6)
val PurpleAccent = Color(0xFF4F46E5)

/**
 * Pharmacy Owner Dashboard Screen
 * Overview screen showing live engagement metrics
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PharmacyOwnerDashboardScreen(
    onNotificationClick: () -> Unit = {},
    modifier: Modifier = Modifier,
    authViewModel: com.blessedirembo.app.auth.AuthViewModel = viewModel(),
    pharmacyViewModel: com.blessedirembo.app.ui.viewmodel.PharmacyViewModel = viewModel(),
    notificationViewModel: NotificationViewModel = viewModel()
) {
    val scrollState = rememberScrollState()
    val pharmacy by pharmacyViewModel.ownerPharmacy.collectAsState()
    val unreadCount by notificationViewModel.unreadCount.collectAsState()
    var showNotificationsSheet by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        val uid = authViewModel.currentUser?.uid
        if (uid != null) {
            pharmacyViewModel.loadPharmacyByOwnerId(uid)
            notificationViewModel.listenForNotifications(uid)
        }
    }

    if (showNotificationsSheet) {
        NotificationsSheet(
            onDismiss = { showNotificationsSheet = false },
            notificationViewModel = notificationViewModel
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Gray100)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Blessed Irembo",
                    fontSize = 34.sp,
                    fontWeight = FontWeight.Bold,
                    color = Gray900
                )
                Text(
                    text = pharmacy?.name?.uppercase() ?: "PHARMACY NAME",
                    style = MaterialTheme.typography.titleSmall,
                    color = Gray500,
                    modifier = Modifier.padding(top = 4.dp),
                    letterSpacing = 2.sp
                )
            }
            
            // Notification bell with badge
            BadgedBox(
                badge = {
                    if (unreadCount > 0) {
                        Badge(
                            containerColor = Color.Red,
                            modifier = Modifier.padding(top = 4.dp, end = 4.dp)
                        ) {
                            Text("$unreadCount", color = White)
                        }
                    }
                }
            ) {
                IconButton(
                    onClick = { showNotificationsSheet = true },
                    modifier = Modifier
                        .size(44.dp)
                        .shadow(elevation = 2.dp, shape = CircleShape)
                        .clip(CircleShape)
                        .background(White)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Notifications,
                        contentDescription = "Notifications",
                        tint = Teal500
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Stats Grid (2x2) — mirrors iOS PharmacyDashboardView
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // WhatsApp Clicks (green — matches iOS message.fill card)
            StatCard(
                icon = Icons.Filled.Email, // Email stands in for message.fill
                iconBackgroundColor = Color(0xFF25D366), // WhatsApp green
                value = "${pharmacy?.whatsappClicks ?: 0}",
                label = "WhatsApp Clicks",
                percentageChange = "",
                isPositive = true,
                modifier = Modifier.weight(1f)
            )
            // Subscription status
            val isPremium = pharmacy?.isPremium == true
            StatCard(
                icon = if (isPremium) Icons.Filled.Star else Icons.Filled.Person,
                iconBackgroundColor = if (isPremium) PurpleAccent else Teal500,
                value = pharmacy?.subscriptionPlan ?: "Free",
                label = "Subscription",
                percentageChange = "",
                isPositive = true,
                modifier = Modifier.weight(1f)
            )
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Profile Views
            StatCard(
                icon = Icons.Filled.Visibility,
                iconBackgroundColor = BlueAccent,
                value = "${pharmacy?.profileViews ?: 0}",
                label = "Profile Views",
                percentageChange = "",
                isPositive = true,
                modifier = Modifier.weight(1f)
            )
            // Open / Closed status
            val isOpen = pharmacy?.isCurrentlyOpen == true
            StatCard(
                icon = Icons.Filled.Schedule, // clock fill equivalent
                iconBackgroundColor = if (isOpen) SuccessGreen else Color(0xFFEF4444),
                value = if (isOpen) "Open" else "Closed",
                label = "Status",
                percentageChange = "",
                isPositive = isOpen,
                modifier = Modifier.weight(1f)
            )
        }
        
        Spacer(modifier = Modifier.height(80.dp)) // Bottom nav spacing
    }
}
