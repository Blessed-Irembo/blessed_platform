package com.blessedirembo.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blessedirembo.app.ui.theme.Gray400
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.SuccessGreen
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White

/**
 * Data class representing a pharmacy for display
 */
data class PharmacyInfo(
    val id: String,
    val name: String,
    val distance: String,
    val rating: Float,
    val reviewCount: Int,
    val address: String,
    val isOpen: Boolean,
    val isVerified: Boolean = true,
    val latitude: Double = -1.9441, // Default to Kigali center if not provided
    val longitude: Double = 30.0619
)

/**
 * Pharmacy list item component
 * Shows pharmacy icon, name, distance, rating, address, and status
 */
@Composable
fun PharmacyListItem(
    pharmacy: PharmacyInfo,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 12.dp, horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Pharmacy icon badge
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Teal500),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Filled.MedicalServices,
                contentDescription = null,
                tint = White,
                modifier = Modifier.size(24.dp)
            )
        }
        
        Spacer(modifier = Modifier.width(12.dp))
        
        // Pharmacy info
        Column(modifier = Modifier.weight(1f)) {
            // Name with verified badge
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = pharmacy.name,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.SemiBold,
                    color = Gray900,
                    maxLines = 1
                )
                if (pharmacy.isVerified) {
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.Filled.CheckCircle,
                        contentDescription = "Verified",
                        tint = Teal500,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
            
            // Distance and rating
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = 2.dp)
            ) {
                Text(
                    text = "↗ ${pharmacy.distance}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Gray500
                )
                Spacer(modifier = Modifier.width(12.dp))
                Icon(
                    imageVector = Icons.Filled.Star,
                    contentDescription = null,
                    tint = OrangeRating,
                    modifier = Modifier.size(14.dp)
                )
                Text(
                    text = " ${pharmacy.rating} (${pharmacy.reviewCount})",
                    style = MaterialTheme.typography.bodySmall,
                    color = Gray500
                )
            }
            
            // Address
            Text(
                text = pharmacy.address,
                style = MaterialTheme.typography.bodySmall,
                color = Gray500,
                modifier = Modifier.padding(top = 2.dp)
            )
            
            // Open status
            Text(
                text = if (pharmacy.isOpen) "Open now" else "Closed",
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.Medium,
                color = if (pharmacy.isOpen) SuccessGreen else Color.Red,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
        
        // Chevron
        Icon(
            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = "View details",
            tint = Gray400,
            modifier = Modifier.size(24.dp)
        )
    }
}
