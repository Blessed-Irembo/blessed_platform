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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.blessedirembo.app.ui.components.DualBarChart
import com.blessedirembo.app.ui.components.SimpleBarChart
import com.blessedirembo.app.ui.components.StatCardSmall
import com.blessedirembo.app.ui.theme.Gray100
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White

// Analytics color palette
val TealLight = Color(0xFF99E0DB)
val MagentaChart = Color(0xFFD946EF)

/**
 * Analytics Screen for pharmacy owners
 * Shows stats cards and charts
 */
@Composable
fun AnalyticsScreen(
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    
    // Sample chart data
    val profileViewsData = remember { listOf(65f, 40f, 45f, 80f, 55f, 90f, 85f) }
    val inquiriesData = remember { listOf(70f, 25f, 45f, 55f, 40f, 50f, 85f) }
    
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Gray100)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Stats Grid
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCardSmall(
                title = "Total Visits",
                value = "3,450",
                percentageChange = "+15%",
                isPositive = true,
                modifier = Modifier.weight(1f)
            )
            StatCardSmall(
                title = "Impressions",
                value = "12.5k",
                percentageChange = "+8%",
                isPositive = true,
                modifier = Modifier.weight(1f)
            )
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCardSmall(
                title = "Click Rate",
                value = "4.2%",
                percentageChange = "-1%",
                isPositive = false,
                modifier = Modifier.weight(1f)
            )
            StatCardSmall(
                title = "Avg Time",
                value = "1m 30s",
                percentageChange = "+12%",
                isPositive = true,
                modifier = Modifier.weight(1f)
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Profile Views Chart
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = White),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            DualBarChart(
                title = "Profile Views",
                data = profileViewsData,
                primaryColor = TealLight,
                secondaryColor = Teal500,
                modifier = Modifier.padding(16.dp)
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Inquiries Over Time Chart
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = White),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            SimpleBarChart(
                title = "Inquiries Over Time",
                data = inquiriesData,
                barColor = MagentaChart,
                modifier = Modifier.padding(16.dp)
            )
        }
        
        Spacer(modifier = Modifier.height(80.dp)) // Bottom nav spacing
    }
}
