package com.blessedirembo.app

import androidx.compose.runtime.Composable
import androidx.navigation.compose.rememberNavController
import com.blessedirembo.app.navigation.NavGraph
import com.blessedirembo.app.ui.theme.BlessedIremboTheme

/**
 * Root composable for the Blessed Irembo app
 * Sets up the theme and navigation
 */
@Composable
fun BlessedIremboApp() {
    BlessedIremboTheme {
        val navController = rememberNavController()
        NavGraph(navController = navController)
    }
}
