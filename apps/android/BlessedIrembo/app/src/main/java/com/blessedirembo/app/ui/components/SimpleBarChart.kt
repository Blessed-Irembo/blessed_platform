package com.blessedirembo.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.Teal500

/**
 * Simple bar chart for analytics
 */
@Composable
fun SimpleBarChart(
    title: String,
    data: List<Float>,
    barColor: Color = Teal500,
    modifier: Modifier = Modifier,
    maxHeight: Dp = 120.dp
) {
    val maxValue = data.maxOrNull() ?: 1f
    
    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = Gray900
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(maxHeight)
                .padding(horizontal = 8.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.Bottom
        ) {
            data.forEach { value ->
                val barHeight = (value / maxValue) * maxHeight.value
                Box(
                    modifier = Modifier
                        .width(24.dp)
                        .height(barHeight.dp.coerceAtLeast(4.dp))
                        .clip(RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp))
                        .background(barColor)
                )
            }
        }
    }
}

/**
 * Dual color bar chart for variation
 */
@Composable
fun DualBarChart(
    title: String,
    data: List<Float>,
    primaryColor: Color,
    secondaryColor: Color,
    modifier: Modifier = Modifier,
    maxHeight: Dp = 120.dp
) {
    val maxValue = data.maxOrNull() ?: 1f
    
    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = Gray900
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(maxHeight)
                .padding(horizontal = 8.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.Bottom
        ) {
            data.forEachIndexed { index, value ->
                val barHeight = (value / maxValue) * maxHeight.value
                val color = if (index % 2 == 0) primaryColor else secondaryColor
                Box(
                    modifier = Modifier
                        .width(24.dp)
                        .height(barHeight.dp.coerceAtLeast(4.dp))
                        .clip(RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp))
                        .background(color)
                )
            }
        }
    }
}
