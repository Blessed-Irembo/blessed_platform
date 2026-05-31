package com.blessedirembo.app.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blessedirembo.app.util.Language
import com.blessedirembo.app.util.LanguageManager

/**
 * FloatingLanguageSwitcher
 *
 * A premium glassmorphic pill toggle that allows instant switching between
 * English (EN) and Kinyarwanda (RW). Mirrors iOS FloatingLanguageSwitcher.swift exactly.
 *
 * Place it as an overlay in key screens (Onboarding, RoleSelection, SignIn, etc.)
 * using a Box with alignment = Alignment.TopEnd.
 */
@Composable
fun FloatingLanguageSwitcher(
    modifier: Modifier = Modifier
) {
    val selectedLanguage by LanguageManager.selectedLanguage.collectAsState()

    Row(
        modifier = modifier
            .shadow(
                elevation = 4.dp,
                shape = RoundedCornerShape(50.dp),
                ambientColor = Color.Black.copy(alpha = 0.06f),
                spotColor = Color.Black.copy(alpha = 0.06f)
            )
            .clip(RoundedCornerShape(50.dp))
            .background(Color.White.copy(alpha = 0.92f))
            .padding(horizontal = 10.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // EN pill segment
        LanguagePill(
            label = Language.ENGLISH.displayName,
            isSelected = selectedLanguage == Language.ENGLISH,
            onClick = {
                if (selectedLanguage != Language.ENGLISH) LanguageManager.toggleLanguage()
            }
        )

        // Separator
        Text(
            text = "|",
            fontSize = 13.sp,
            fontWeight = FontWeight.Light,
            color = Color.Gray.copy(alpha = 0.3f),
            modifier = Modifier.padding(horizontal = 2.dp)
        )

        // RW pill segment
        LanguagePill(
            label = Language.KINYARWANDA.displayName,
            isSelected = selectedLanguage == Language.KINYARWANDA,
            onClick = {
                if (selectedLanguage != Language.KINYARWANDA) LanguageManager.toggleLanguage()
            }
        )
    }
}

@Composable
private fun LanguagePill(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val tealColor = Color(0xFF0B8C8C)

    val textColor by animateColorAsState(
        targetValue = if (isSelected) tealColor else Color.Gray.copy(alpha = 0.7f),
        animationSpec = spring(),
        label = "LanguagePill_textColor"
    )
    val bgColor by animateColorAsState(
        targetValue = if (isSelected) tealColor.copy(alpha = 0.12f) else Color.Transparent,
        animationSpec = spring(),
        label = "LanguagePill_bgColor"
    )

    Text(
        text = label,
        fontSize = 13.sp,
        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
        color = textColor,
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .clickable(onClick = onClick)
            .padding(horizontal = 6.dp, vertical = 4.dp)
    )
}
