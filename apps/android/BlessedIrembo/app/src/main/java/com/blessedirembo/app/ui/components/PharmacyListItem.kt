package com.blessedirembo.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocalPharmacy
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blessedirembo.app.ui.theme.Gray400
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.OrangeRating
import com.blessedirembo.app.ui.theme.SuccessGreen
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White

// Verified badge icon – mirrors iOS "checkmark.seal.fill"
private val VerifiedIcon = Icons.Filled.CheckCircle

/**
 * Pharmacy list card — mirrors iOS PharmacyListCard exactly:
 *
 *  ┌────────────────────────────────────────────┐
 *  │  ┌──────┐  Name  ✓verified                │
 *  │  │ logo │  📍 distance  ⭐ 4.5 (12)        │
 *  │  │ icon │  123 Kigali St.                  │
 *  │  └──────┘  🟢 Open now                  ›  │
 *  └────────────────────────────────────────────┘
 *
 * Selected state: teal border glow (matches iOS .stroke overlay).
 */
@Composable
fun PharmacyListItem(
    pharmacy: PharmacyInfo,
    onClick: () -> Unit,
    isSelected: Boolean = false,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .then(
                if (isSelected) Modifier.border(2.dp, Teal500.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                else Modifier
            ),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(
            defaultElevation = if (isSelected) 6.dp else 2.dp
        )
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // ── Pharmacy icon with gradient background — mirrors iOS LinearGradient
            Box(
                modifier = Modifier
                    .size(70.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(
                        Brush.linearGradient(
                            colors = listOf(
                                Teal500.copy(alpha = 0.10f),
                                Teal500.copy(alpha = 0.05f)
                            )
                        )
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.LocalPharmacy,
                    contentDescription = null,
                    tint = Teal500,
                    modifier = Modifier.size(32.dp)
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            // ── Pharmacy details
            Column(modifier = Modifier.weight(1f)) {

                // Name + verified seal — mirrors iOS HStack with checkmark.seal.fill
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = pharmacy.name,
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.SemiBold,
                        color = Gray900,
                        maxLines = 1,
                        modifier = Modifier.weight(1f, fill = false)
                    )
                    if (pharmacy.isVerified) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            imageVector = VerifiedIcon,
                            contentDescription = "Verified",
                            tint = Teal500,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                // Distance + rating row — mirrors iOS HStack(spacing: 12)
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Distance
                    Icon(
                        imageVector = Icons.Filled.LocationOn,
                        contentDescription = null,
                        tint = Teal500,
                        modifier = Modifier.size(12.dp)
                    )
                    Spacer(modifier = Modifier.width(2.dp))
                    Text(
                        text = pharmacy.distance,
                        style = MaterialTheme.typography.bodySmall,
                        color = Gray500,
                        fontSize = 11.sp
                    )

                    if (pharmacy.reviewCount > 0) {
                        Spacer(modifier = Modifier.width(12.dp))
                        Icon(
                            imageVector = Icons.Filled.Star,
                            contentDescription = null,
                            tint = OrangeRating,
                            modifier = Modifier.size(11.dp)
                        )
                        Spacer(modifier = Modifier.width(2.dp))
                        Text(
                            text = "${pharmacy.rating}",
                            style = MaterialTheme.typography.bodySmall,
                            color = Gray500,
                            fontSize = 11.sp
                        )
                        Text(
                            text = " (${pharmacy.reviewCount})",
                            style = MaterialTheme.typography.bodySmall,
                            color = Gray500,
                            fontSize = 11.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(2.dp))

                // Address
                Text(
                    text = pharmacy.address,
                    style = MaterialTheme.typography.bodySmall,
                    color = Gray500,
                    maxLines = 1,
                    fontSize = 11.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Open / Closed status with dot — mirrors iOS Circle().fill(Color.green)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(RoundedCornerShape(50))
                            .background(if (pharmacy.isOpen) SuccessGreen else Color(0xFFEF4444))
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (pharmacy.isOpen) "Open now" else "Closed",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Medium,
                        color = if (pharmacy.isOpen) SuccessGreen else Color(0xFFEF4444),
                        fontSize = 11.sp
                    )
                }
            }

            // Chevron — mirrors iOS chevron.right
            Icon(
                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = "View details",
                tint = Gray400.copy(alpha = 0.6f),
                modifier = Modifier.size(20.dp)
            )
        }
    }
}
