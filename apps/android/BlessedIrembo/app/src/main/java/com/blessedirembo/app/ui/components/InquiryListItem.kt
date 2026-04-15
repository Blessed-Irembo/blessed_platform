package com.blessedirembo.app.ui.components

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.blessedirembo.app.ui.theme.Gray400
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900

/**
 * Data class for inquiry information
 */
data class InquiryInfo(
    val id: String,
    val senderName: String,
    val message: String,
    val timeAgo: String,
    val isRead: Boolean = false
)

/**
 * Inquiry list item component
 * Shows avatar initials, sender name, message preview, and time
 */
@Composable
fun InquiryListItem(
    inquiry: InquiryInfo,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.Top
    ) {
        // Avatar with initials
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(Gray400.copy(alpha = 0.3f)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = getInitials(inquiry.senderName),
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Medium,
                color = Gray500
            )
        }
        
        Spacer(modifier = Modifier.width(16.dp))
        
        // Name, time, and message
        Column(modifier = Modifier.weight(1f)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Text(
                    text = inquiry.senderName,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = if (!inquiry.isRead) FontWeight.SemiBold else FontWeight.Medium,
                    color = Gray900
                )
                Text(
                    text = inquiry.timeAgo,
                    style = MaterialTheme.typography.bodySmall,
                    color = Gray500
                )
            }
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = inquiry.message,
                style = MaterialTheme.typography.bodyMedium,
                color = Gray500,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

/**
 * Get initials from a name
 */
private fun getInitials(name: String): String {
    val parts = name.trim().split(" ")
    return when {
        parts.size >= 2 -> "${parts[0].firstOrNull() ?: ""}${parts[1].firstOrNull() ?: ""}"
        parts.isNotEmpty() -> parts[0].take(2)
        else -> "?"
    }.uppercase()
}
