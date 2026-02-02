package com.blessedirembo.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

/**
 * Blessed Irembo Theme
 * Light theme with teal primary colors for the pharmacy finder app
 */

private val LightColorScheme = lightColorScheme(
    // Primary colors
    primary = Teal500,
    onPrimary = White,
    primaryContainer = Teal100,
    onPrimaryContainer = Teal700,

    // Secondary colors (using teal variants)
    secondary = Teal600,
    onSecondary = White,
    secondaryContainer = Teal50,
    onSecondaryContainer = Teal700,

    // Tertiary colors
    tertiary = Teal700,
    onTertiary = White,
    tertiaryContainer = Teal100,
    onTertiaryContainer = Teal700,

    // Background & Surface
    background = White,
    onBackground = Gray900,
    surface = White,
    onSurface = Gray900,
    surfaceVariant = Gray100,
    onSurfaceVariant = Gray600,

    // Outline
    outline = Gray300,
    outlineVariant = Gray200,

    // Error colors
    error = ErrorRed,
    onError = White,
    errorContainer = Color(0xFFFEE2E2),
    onErrorContainer = Color(0xFF991B1B)
)

@Composable
fun BlessedIremboTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    // Currently only supporting light theme to match the provided designs
    val colorScheme = LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = BlessedIremboTypography,
        content = content
    )
}
