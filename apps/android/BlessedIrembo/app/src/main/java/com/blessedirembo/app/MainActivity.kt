package com.blessedirembo.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.view.WindowCompat
import com.blessedirembo.app.analytics.AnalyticsManager

/**
 * Main Activity for Blessed Irembo
 * Entry point for the Android application
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize analytics (must happen before any screen loads)
        AnalyticsManager.init(this)

        // Enable edge-to-edge display
        enableEdgeToEdge()
        WindowCompat.setDecorFitsSystemWindows(window, false)

        setContent {
            BlessedIremboApp()
        }
    }
}
