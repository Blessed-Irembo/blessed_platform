package com.blessedirembo.app.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blessedirembo.app.R
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import kotlinx.coroutines.delay

/**
 * Splash Screen
 * Displays the app logo, name, and tagline on a teal background
 * Auto-navigates to welcome screen after a delay
 */
@Composable
fun SplashScreen(
    onNavigateToWelcome: () -> Unit
) {
    // Auto-navigate after 2.5 seconds
    LaunchedEffect(key1 = true) {
        delay(2500L)
        onNavigateToWelcome()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Teal500),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Logo
        Image(
            painter = painterResource(id = R.drawable.logo1),
            contentDescription = "Blessed Irembo Logo",
            modifier = Modifier.size(80.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        // App Name
        Text(
            text = "Blessed Irembo",
            style = MaterialTheme.typography.headlineLarge,
            color = White,
            fontWeight = FontWeight.Bold,
            fontSize = 32.sp
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Tagline
        Text(
            text = "Find Pharmacies Across Rwanda",
            style = MaterialTheme.typography.bodyLarge,
            color = White.copy(alpha = 0.9f),
            textAlign = TextAlign.Center
        )
    }
}
