package com.blessedirembo.app.ui.screens.owner

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.blessedirembo.app.ui.components.InquiryInfo
import com.blessedirembo.app.ui.components.InquiryListItem
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Gray300
import com.blessedirembo.app.ui.theme.Gray400
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White

/**
 * Inquiries Screen for pharmacy owners
 * Shows search, filter tabs, and inquiry list
 */
@Composable
fun InquiriesScreen(
    onInquiryClick: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("All", "Unread", "Replied", "Archived")
    
    // Sample inquiries
    val inquiries = remember {
        listOf(
            InquiryInfo("1", "John Doe", "Do you have Amoxicillin 500mg in stock?", "2m ago"),
            InquiryInfo("2", "Sarah Smith", "What are your opening hours on Sunday?", "15m ago"),
            InquiryInfo("3", "David N.", "I need a prescription refilled.", "1h ago", isRead = true),
            InquiryInfo("4", "Alice M.", "Do you deliver to Kacyiru?", "2h ago", isRead = true),
            InquiryInfo("5", "Peter K.", "Price for Vitamin C supplements?", "3h ago", isRead = true),
            InquiryInfo("6", "Mary J.", "Is the flu vaccine available?", "1d ago", isRead = true)
        )
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
            placeholder = {
                Text(text = "Search inquiries...", color = Gray400)
            },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Filled.Search,
                    contentDescription = null,
                    tint = Gray400
                )
            },
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
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
                FilterChip(
                    text = tab,
                    isSelected = selectedTab == index,
                    onClick = { selectedTab = index }
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Inquiry List
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .padding(horizontal = 16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = White),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            LazyColumn {
                items(inquiries) { inquiry ->
                    InquiryListItem(
                        inquiry = inquiry,
                        onClick = { onInquiryClick(inquiry.id) }
                    )
                    if (inquiry != inquiries.last()) {
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
    val borderColor = if (isSelected) Teal500 else Gray300
    
    Text(
        text = text,
        style = MaterialTheme.typography.bodyMedium,
        fontWeight = FontWeight.Medium,
        color = textColor,
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(backgroundColor)
            .border(1.dp, borderColor, RoundedCornerShape(20.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 8.dp)
    )
}
