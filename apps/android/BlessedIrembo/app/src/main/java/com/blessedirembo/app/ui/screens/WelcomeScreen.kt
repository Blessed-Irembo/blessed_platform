package com.blessedirembo.app.ui.screens

import androidx.compose.foundation.Image
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.LocalPharmacy
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import com.blessedirembo.app.R
import com.blessedirembo.app.ui.components.FloatingLanguageSwitcher
import com.blessedirembo.app.ui.components.RoleSelectionCard
import com.blessedirembo.app.ui.theme.Gray500
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.util.t

/**
 * Welcome Screen
 * Displays role selection options for users and pharmacy owners
 */
@Composable
fun WelcomeScreen(
    onLookingForPharmacy: () -> Unit,
    onOwnPharmacy: () -> Unit,
    onSignIn: () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 24.dp)
            .padding(top = 80.dp, bottom = 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Logo
        Image(
            painter = painterResource(id = R.drawable.logo1),
            contentDescription = "Blessed Irembo Logo",
            modifier = Modifier.size(64.dp)
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Welcome Title
        Text(
            text = t("role.welcome"),
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Subtitle
        Text(
            text = t("role.subtitle"),
            style = MaterialTheme.typography.bodyLarge,
            color = Gray500
        )

        Spacer(modifier = Modifier.height(48.dp))

        // Role Selection Cards
        Column(
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Looking for pharmacy option
            RoleSelectionCard(
                title = t("role.userTitle"),
                description = t("role.userDesc"),
                icon = Icons.Outlined.Person,
                onClick = onLookingForPharmacy
            )

            // Pharmacy owner option
            RoleSelectionCard(
                title = t("role.pharmacyTitle"),
                description = t("role.pharmacyDesc"),
                icon = Icons.Outlined.LocalPharmacy,
                onClick = onOwnPharmacy
            )
        }

        Spacer(modifier = Modifier.weight(1f))

        // Sign In Link
        Row(
            horizontalArrangement = Arrangement.Center
        ) {
            Text(
                text = buildAnnotatedString {
                    append(t("role.alreadyAccount") + " ")
                    withStyle(
                        style = SpanStyle(
                            color = Teal500,
                            fontWeight = FontWeight.SemiBold
                        )
                    ) {
                        append(t("role.signIn"))
                    }
                },
                style = MaterialTheme.typography.bodyMedium,
                color = Gray500,
                modifier = Modifier.clickable(onClick = onSignIn)
            )
        }
    }

    // Floating language switcher — top-end overlay, mirrors iOS FloatingLanguageSwitcher
    FloatingLanguageSwitcher(
        modifier = Modifier
            .align(Alignment.TopEnd)
            .padding(top = 32.dp, end = 16.dp)
    )
    } // end Box
}
