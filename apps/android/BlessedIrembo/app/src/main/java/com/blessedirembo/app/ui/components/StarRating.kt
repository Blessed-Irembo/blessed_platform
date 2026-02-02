package com.blessedirembo.app.ui.components

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarHalf
import androidx.compose.material.icons.outlined.StarOutline
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

// Orange color for star ratings
val OrangeRating = Color(0xFFF59E0B)
val GrayEmpty = Color(0xFFD1D5DB)

/**
 * Star rating display component
 * Shows filled, half, and empty stars based on rating value
 */
@Composable
fun StarRating(
    rating: Float,
    modifier: Modifier = Modifier,
    maxStars: Int = 5,
    starSize: Dp = 18.dp,
    filledColor: Color = OrangeRating,
    emptyColor: Color = GrayEmpty
) {
    Row(modifier = modifier) {
        for (i in 1..maxStars) {
            val icon = when {
                i <= rating -> Icons.Filled.Star
                i - 0.5f <= rating -> @Suppress("DEPRECATION") Icons.Filled.StarHalf
                else -> Icons.Outlined.StarOutline
            }
            val tint = when {
                i <= rating -> filledColor
                i - 0.5f <= rating -> filledColor
                else -> emptyColor
            }
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = tint,
                modifier = Modifier.size(starSize)
            )
        }
    }
}
