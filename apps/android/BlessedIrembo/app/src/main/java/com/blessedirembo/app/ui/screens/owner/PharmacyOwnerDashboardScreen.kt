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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Help
import androidx.compose.material.icons.filled.Inventory
import androidx.compose.material.icons.filled.ChatBubble
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
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
import com.blessedirembo.app.ui.components.InquiryInfo
import com.blessedirembo.app.ui.components.InquiryListItem
import com.blessedirembo.app.ui.components.QuickActionButton
import com.blessedirembo.app.ui.components.StatCard
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.SuccessGreen
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.ui.viewmodel.InquiryViewModel
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Color palette for dashboard elements
val BlueAccent = Color(0xFF3B82F6)
val OrangeAccent = Color(0xFFF97316)
val PurpleAccent = Color(0xFFA855F7)

/**
 * Pharmacy Owner Dashboard Screen
 * Main screen with stats, quick actions, and recent inquiries
 */
@Composable
fun PharmacyOwnerDashboardScreen(
    onNotificationClick: () -> Unit = {},
    onLogSaleClick: () -> Unit = {},
    onUpdateStockClick: () -> Unit = {},
    onAddPromotionClick: () -> Unit = {},
    onSupportClick: () -> Unit = {},
    onViewAllInquiriesClick: () -> Unit = {},
    onInquiryClick: (String) -> Unit = {},
    modifier: Modifier = Modifier,
    inquiryViewModel: InquiryViewModel = viewModel(),
    authViewModel: com.blessedirembo.app.auth.AuthViewModel = viewModel(),
    pharmacyViewModel: com.blessedirembo.app.ui.viewmodel.PharmacyViewModel = viewModel()
) {
    val scrollState = rememberScrollState()
    val allInquiries by inquiryViewModel.inquiries.collectAsState()
    val unreadCount = inquiryViewModel.unreadCount
    val pharmacy by pharmacyViewModel.ownerPharmacy.collectAsState()

    LaunchedEffect(Unit) {
        val uid = authViewModel.currentUser?.uid
        if (uid != null) {
            pharmacyViewModel.loadPharmacyByOwnerId(uid)
        }
    }

    // Subscribe to real-time inquiries for this pharmacy once loaded
    LaunchedEffect(pharmacy?.id) {
        pharmacy?.id?.let { id ->
            if (id.isNotBlank()) {
                inquiryViewModel.observeInquiries(id)
            }
        }
    }

    // Show the 3 most recent inquiries on the dashboard
    val recentInquiries = allInquiries.take(3).map { inquiry ->
        InquiryInfo(
            id = inquiry.id,
            senderName = inquiry.senderName,
            message = inquiry.message,
            timeAgo = formatDashboardTimestamp(inquiry.timestamp),
            isRead = inquiry.isRead
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
                    text = pharmacy?.name ?: "Pharmacy Name",
                    style = MaterialTheme.typography.titleMedium,
                    color = Gray500,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
            
            // Notification bell with badge
            BadgedBox(
                badge = {
                    Badge(
                        containerColor = Color.Red,
                        modifier = Modifier.size(8.dp)
                    ) { }
                }
            ) {
                IconButton(
                    onClick = onNotificationClick,
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
                icon = Icons.Filled.ChatBubble,
                iconBackgroundColor = Color(0xFF25D366), // WhatsApp green
                value = "${pharmacy?.whatsappClicks ?: 0}",
                label = "WhatsApp Clicks",
                percentageChange = "",
                isPositive = true,
                modifier = Modifier.weight(1f)
            )
            // Subscription status
            StatCard(
                icon = if (pharmacy?.isPremium == true) Icons.Filled.Star else Icons.Filled.People,
                iconBackgroundColor = if (pharmacy?.isPremium == true) PurpleAccent else Teal500,
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
                icon = Icons.Filled.People,
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
                icon = Icons.Filled.Star, // clock fill equivalent
                iconBackgroundColor = if (isOpen) SuccessGreen else Color(0xFFEF4444),
                value = if (isOpen) "Open" else "Closed",
                label = "Status",
                percentageChange = "",
                isPositive = isOpen,
                modifier = Modifier.weight(1f)
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Recent Inquiries
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Recent Inquiries",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = Gray900
            )
            Text(
                text = "View All",
                style = MaterialTheme.typography.bodyMedium,
                color = Teal500,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.clickable(onClick = onViewAllInquiriesClick)
            )
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = White),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            Column {
                recentInquiries.forEachIndexed { index, inquiry ->
                    InquiryListItem(
                        inquiry = inquiry,
                        onClick = { onInquiryClick(inquiry.id) }
                    )
                    if (index < recentInquiries.lastIndex) {
                        HorizontalDivider(
                            color = Gray100,
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(80.dp)) // Bottom nav spacing
    }
}

/** Format a Firestore timestamp for the dashboard card's recent inquiries. */
private fun formatDashboardTimestamp(date: java.util.Date?): String {
    if (date == null) return "just now"
    val diff = System.currentTimeMillis() - date.time
    return when {
        diff < 60_000 -> "just now"
        diff < 3_600_000 -> "${diff / 60_000}m ago"
        diff < 86_400_000 -> "${diff / 3_600_000}h ago"
        else -> "${diff / 86_400_000}d ago"
    }
}
