package com.blessedirembo.app.ui.screens

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blessedirembo.app.R
import com.blessedirembo.app.ui.theme.Gray400
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Gray900
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import com.blessedirembo.app.util.t

/**
 * GuestSignInPromptScreen
 *
 * Shown when a guest user tries to access gated content:
 *   • Pharmacy Detail page
 *   • Profile tab
 *
 * Mirrors the iOS auth-gate behaviour: a beautiful full-screen
 * prompt with Sign In + Create Account CTAs and a "Continue Browsing"
 * dismiss link to go back to the map.
 */
@Composable
fun GuestSignInPromptScreen(
    onSignInClick: () -> Unit,
    onCreateAccountClick: () -> Unit,
    onContinueBrowsing: () -> Unit
) {
    var animateIn by remember { mutableStateOf(false) }

    val scale by animateFloatAsState(
        targetValue = if (animateIn) 1f else 0.85f,
        animationSpec = tween(durationMillis = 500, easing = FastOutSlowInEasing),
        label = "scale"
    )
    val alpha by animateFloatAsState(
        targetValue = if (animateIn) 1f else 0f,
        animationSpec = tween(durationMillis = 500),
        label = "alpha"
    )

    LaunchedEffect(Unit) { animateIn = true }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(White),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {

            // ── Animated logo + lock badge ───────────────────────────────────
            Box(
                modifier = Modifier
                    .scale(scale)
                    .alpha(alpha),
                contentAlignment = Alignment.Center
            ) {
                // Soft teal background circle
                Box(
                    modifier = Modifier
                        .size(160.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.radialGradient(
                                listOf(
                                    Teal500.copy(alpha = 0.12f),
                                    Teal500.copy(alpha = 0.04f)
                                )
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.logo2),
                        contentDescription = "Blessed Irembo",
                        modifier = Modifier.size(110.dp)
                    )
                }

                // Lock badge — bottom-end of the circle
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Teal500)
                        .align(Alignment.BottomEnd),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.Lock,
                        contentDescription = null,
                        tint = White,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(36.dp))

            // ── Title ────────────────────────────────────────────────────────
            Text(
                text = t("guest.signInTitle"),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = Gray900,
                textAlign = TextAlign.Center,
                modifier = Modifier.alpha(alpha)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // ── Subtitle ─────────────────────────────────────────────────────
            Text(
                text = t("guest.signInSubtitle"),
                style = MaterialTheme.typography.bodyMedium,
                color = Gray500,
                textAlign = TextAlign.Center,
                lineHeight = 22.sp,
                modifier = Modifier.alpha(alpha)
            )

            Spacer(modifier = Modifier.height(40.dp))

            // ── Sign In button (primary teal) ─────────────────────────────────
            Button(
                onClick = onSignInClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp)
                    .alpha(alpha),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Teal500,
                    contentColor = White
                )
            ) {
                Text(
                    text = t("guest.signInButton"),
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // ── Create Account button (outlined) ──────────────────────────────
            OutlinedButton(
                onClick = onCreateAccountClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp)
                    .alpha(alpha),
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, Teal500),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Teal500)
            ) {
                Text(
                    text = t("guest.createAccount"),
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 16.sp
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ── Divider with OR ──────────────────────────────────────────────
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.alpha(alpha)
            ) {
                HorizontalDivider(
                    modifier = Modifier.weight(1f),
                    color = Gray400.copy(alpha = 0.3f)
                )
                Text(
                    text = "  ${t("common.or")}  ",
                    style = MaterialTheme.typography.bodySmall,
                    color = Gray400
                )
                HorizontalDivider(
                    modifier = Modifier.weight(1f),
                    color = Gray400.copy(alpha = 0.3f)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Continue browsing link ────────────────────────────────────────
            Text(
                text = t("guest.continueBrowsing"),
                style = MaterialTheme.typography.bodyMedium,
                color = Teal500,
                fontWeight = FontWeight.Medium,
                modifier = Modifier
                    .alpha(alpha)
                    .clickable(onClick = onContinueBrowsing)
            )
        }
    }
}
