package com.blessedirembo.app.ui.screens

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
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
    var startAnimation by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (startAnimation) 1.2f else 0.8f,
        animationSpec = tween(durationMillis = 1000, easing = FastOutSlowInEasing),
        label = "scale"
    )
    val opacity by animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0f,
        animationSpec = tween(durationMillis = 1000),
        label = "opacity"
    )

    LaunchedEffect(key1 = true) {
        startAnimation = true
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
            modifier = Modifier
                .size(100.dp)
                .scale(scale)
                .alpha(opacity)
        )

        Spacer(modifier = Modifier.height(32.dp))

        // App Name
        Text(
            text = "Blessed Irembo",
            style = MaterialTheme.typography.headlineLarge,
            color = White,
            fontWeight = FontWeight.Bold,
            fontSize = 32.sp,
            modifier = Modifier.alpha(opacity)
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Tagline
        Text(
            text = "Find Pharmacies Across Rwanda",
            style = MaterialTheme.typography.bodyLarge,
            color = White.copy(alpha = 0.9f),
            textAlign = TextAlign.Center,
            modifier = Modifier.alpha(opacity)
        )
    }
}
