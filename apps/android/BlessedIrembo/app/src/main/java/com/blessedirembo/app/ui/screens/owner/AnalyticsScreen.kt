package com.blessedirembo.app.ui.screens.owner

import androidx.compose.foundation.background
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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blessedirembo.app.auth.AuthViewModel
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.SuccessGreen
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.ui.viewmodel.PharmacyViewModel
import com.blessedirembo.app.util.t

private val WhatsAppGreen = Color(0xFF25D366)
private val PurpleIndigo = Color(0xFF4F46E5)
private val BlueColor = Color(0xFF3B82F6)
private val RedColor = Color(0xFFEF4444)

/**
 * Analytics Screen - mirrors iOS PharmacyAnalyticsView exactly
 */
@Composable
fun AnalyticsScreen(
    modifier: Modifier = Modifier,
    authViewModel: AuthViewModel = viewModel(),
    pharmacyViewModel: PharmacyViewModel = viewModel()
) {
    val scrollState = rememberScrollState()
    val pharmacy by pharmacyViewModel.ownerPharmacy.collectAsState()

    LaunchedEffect(Unit) {
        val uid = authViewModel.currentUser?.uid ?: return@LaunchedEffect
        pharmacyViewModel.loadPharmacyByOwnerId(uid)
    }

    val whatsappClicks = pharmacy?.whatsappClicks ?: 0
    val profileViews = pharmacy?.profileViews ?: 0
    val subscriptionPlan = pharmacy?.subscriptionPlan ?: "Free"
    val isPremium = pharmacy?.isPremium == true
    val isOpen = pharmacy?.isCurrentlyOpen == true

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Gray100)
            .verticalScroll(scrollState)
            .statusBarsPadding()
            .padding(16.dp)
    ) {
        // ── Page Header ──────────────────────────────────────────────────────
        Column {
            Text(
                text = t("analytics.title"),
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Gray900
            )
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(5.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(7.dp)
                        .clip(CircleShape)
                        .background(SuccessGreen)
                )
                Text(
                    text = t("analytics.liveData"),
                    style = MaterialTheme.typography.labelSmall,
                    color = Gray500
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // ── Summary Cards (2x2 grid) ─────────────────────────────────────────
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            AnalyticsCard(
                title = t("analytics.whatsappClicks"),
                value = "$whatsappClicks",
                icon = Icons.Filled.Chat,
                color = WhatsAppGreen,
                modifier = Modifier.weight(1f)
            )
            AnalyticsCard(
                title = t("analytics.profileViews"),
                value = "$profileViews",
                icon = Icons.Filled.Visibility,
                color = BlueColor,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            AnalyticsCard(
                title = t("analytics.subscription"),
                value = subscriptionPlan,
                icon = if (isPremium) Icons.Filled.Star else Icons.Filled.Person,
                color = if (isPremium) PurpleIndigo else Teal500,
                modifier = Modifier.weight(1f)
            )
            AnalyticsCard(
                title = t("analytics.status"),
                value = if (isOpen) t("details.openNow") else t("map.closed"),
                icon = Icons.Filled.Schedule,
                color = if (isOpen) SuccessGreen else RedColor,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // ── WhatsApp Engagement Section ──────────────────────────────────────
        Text(
            text = t("analytics.whatsappEngagement"),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = Gray900
        )
        Spacer(modifier = Modifier.height(12.dp))
        EngagementCard(
            icon = Icons.Filled.Chat,
            iconColor = WhatsAppGreen,
            count = whatsappClicks,
            label = t("analytics.totalWhatsapp"),
            description = t("analytics.whatsappDesc")
        )

        Spacer(modifier = Modifier.height(24.dp))

        // ── Profile Views Section ────────────────────────────────────────────
        Text(
            text = t("analytics.profileViews"),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = Gray900
        )
        Spacer(modifier = Modifier.height(12.dp))
        EngagementCard(
            icon = Icons.Filled.Visibility,
            iconColor = BlueColor,
            count = profileViews,
            label = t("analytics.usersOpened"),
            description = t("analytics.profileViewDesc")
        )

        Spacer(modifier = Modifier.height(80.dp))
    }
}

// ── Analytics Card (2x2 grid item) ─────────────────────────────────────────────
@Composable
private fun AnalyticsCard(
    title: String,
    value: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .shadow(elevation = 2.dp, shape = RoundedCornerShape(12.dp), ambientColor = Color.Black.copy(alpha = 0.05f))
            .clip(RoundedCornerShape(12.dp))
            .background(White)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(color.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
        Text(
            text = value,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = Gray900
        )
        Text(
            text = title,
            style = MaterialTheme.typography.labelSmall,
            color = Gray500
        )
    }
}

// ── Engagement Card (WhatsApp / Profile Views detail) ──────────────────────────
@Composable
private fun EngagementCard(
    icon: ImageVector,
    iconColor: Color,
    count: Int,
    label: String,
    description: String
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(elevation = 2.dp, shape = RoundedCornerShape(12.dp), ambientColor = Color.Black.copy(alpha = 0.05f))
            .clip(RoundedCornerShape(12.dp))
            .background(White)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(iconColor.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(24.dp)
                )
            }
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "$count",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    color = Gray900
                )
                Text(
                    text = label,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Gray500
                )
            }
        }

        HorizontalDivider()

        Text(
            text = description,
            style = MaterialTheme.typography.labelSmall,
            color = Gray500
        )
    }
}
