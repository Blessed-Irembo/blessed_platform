package com.blessedirembo.app.ui.screens.owner

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.blessedirembo.app.auth.FirebaseAuthManager
import com.blessedirembo.app.data.model.InquiryStatus
import com.blessedirembo.app.ui.components.InquiryInfo
import com.blessedirembo.app.ui.components.InquiryListItem
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray300
import com.blessedirembo.app.ui.theme.Gray400
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.ui.viewmodel.InquiryViewModel

/**
 * Inquiries Screen for pharmacy owners
 * Shows search, filter tabs, and real-time inquiry list from Firestore
 */
@Composable
fun InquiriesScreen(
    pharmacyId: String = "",
    onInquiryClick: (String) -> Unit = {},
    modifier: Modifier = Modifier,
    inquiryViewModel: InquiryViewModel = viewModel()
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("All", "Unread", "Replied", "Archived")
    val allInquiries by inquiryViewModel.inquiries.collectAsState()

    // Start observing real-time inquiries for this pharmacy
    LaunchedEffect(pharmacyId) {
        if (pharmacyId.isNotBlank()) {
            inquiryViewModel.observeInquiries(pharmacyId)
        }
    }

    // Filter based on selected tab and search query
    val filteredInquiries = allInquiries
        .filter { inquiry ->
            val matchesTab = when (selectedTab) {
                1 -> !inquiry.isRead
                2 -> inquiry.status == InquiryStatus.REPLIED
                3 -> inquiry.status == InquiryStatus.ARCHIVED
                else -> true
            }
            val matchesSearch = searchQuery.isEmpty() ||
                inquiry.senderName.contains(searchQuery, ignoreCase = true) ||
                inquiry.message.contains(searchQuery, ignoreCase = true)
            matchesTab && matchesSearch
        }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Gray100)
    ) {
        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text(text = "Search inquiries...", color = Gray400) },
            leadingIcon = {
                Icon(imageVector = Icons.Filled.Search, contentDescription = null, tint = Gray400)
            },
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedBorderColor = Gray300,
                focusedBorderColor = Teal500,
                unfocusedContainerColor = White,
                focusedContainerColor = White
            ),
            singleLine = true
        )

        // Filter Tabs
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            tabs.forEachIndexed { index, tab ->
                FilterChip(text = tab, isSelected = selectedTab == index, onClick = { selectedTab = index })
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Inquiry List
        if (filteredInquiries.isEmpty()) {
            // Empty state
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Filled.Inbox,
                        contentDescription = null,
                        tint = Gray300,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("No inquiries yet", style = MaterialTheme.typography.bodyLarge, color = Gray400)
                }
            }
        } else {
            Card(
                modifier = Modifier.fillMaxWidth().weight(1f).padding(horizontal = 16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                LazyColumn {
                    items(filteredInquiries, key = { it.id }) { inquiry ->
                        val uiInquiry = InquiryInfo(
                            id = inquiry.id,
                            senderName = inquiry.senderName,
                            message = inquiry.message,
                            timeAgo = formatTimestamp(inquiry.timestamp),
                            isRead = inquiry.isRead
                        )
                        InquiryListItem(
                            inquiry = uiInquiry,
                            onClick = {
                                if (!inquiry.isRead) inquiryViewModel.markAsRead(inquiry.id)
                                onInquiryClick(inquiry.id)
                            }
                        )
                        if (inquiry != filteredInquiries.last()) {
                            HorizontalDivider(color = Gray100, modifier = Modifier.padding(horizontal = 16.dp))
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(80.dp))
    }
}

/**
 * Format a Firestore timestamp to a human-readable relative time string.
 */
private fun formatTimestamp(date: java.util.Date?): String {
    if (date == null) return "just now"
    val now = System.currentTimeMillis()
    val diff = now - date.time
    return when {
        diff < 60_000 -> "just now"
        diff < 3_600_000 -> "${diff / 60_000}m ago"
        diff < 86_400_000 -> "${diff / 3_600_000}h ago"
        else -> "${diff / 86_400_000}d ago"
    }
}

/**
 * Filter chip component
 */
@Composable
private fun FilterChip(
    text: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val backgroundColor = if (isSelected) Teal500 else White
    val textColor = if (isSelected) White else Gray900
    
    Text(
        text = text,
        style = MaterialTheme.typography.bodyMedium,
        fontWeight = FontWeight.Medium,
        color = textColor,
        modifier = Modifier
            .shadow(
                elevation = if (isSelected) 0.dp else 2.dp, 
                shape = RoundedCornerShape(20.dp),
                spotColor = Color.Black.copy(alpha = 0.05f)
            )
            .clip(RoundedCornerShape(20.dp))
            .background(backgroundColor)
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 8.dp)
    )
}
