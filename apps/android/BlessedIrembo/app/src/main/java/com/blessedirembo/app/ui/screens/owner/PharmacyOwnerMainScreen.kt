package com.blessedirembo.app.ui.screens.owner

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.AccountCircle
import androidx.compose.material.icons.outlined.CreditCard
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import com.blessedirembo.app.ui.theme.Gray400
import com.blessedirembo.app.ui.theme.Teal50
import com.blessedirembo.app.ui.theme.Teal500
import com.blessedirembo.app.ui.theme.White
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import com.blessedirembo.app.util.t

/**
 * Navigation item for pharmacy owner bottom nav
 */
private data class OwnerNavItem(
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
)

/**
 * Sub-screen enum for the profile section, mirroring iOS NavigationLink hierarchy.
 */
private enum class ProfileSubScreen {
    NONE,
    EDIT_PROFILE,
    OPERATING_HOURS,
    NOTIFICATIONS,
    EDIT_LOCATION
}

/**
 * Main screen for pharmacy owners with bottom navigation.
 * Handles sub-screen stack for Profile tabs (Edit Profile, Operating Hours, Subscription).
 */
@Composable
fun PharmacyOwnerMainScreen(
    onSignOut: () -> Unit,
    modifier: Modifier = Modifier,
    authViewModel: com.blessedirembo.app.auth.AuthViewModel = viewModel(),
    pharmacyViewModel: com.blessedirembo.app.ui.viewmodel.PharmacyViewModel = viewModel()
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var profileSubScreen by remember { mutableStateOf(ProfileSubScreen.NONE) }
    
    val pharmacy by pharmacyViewModel.ownerPharmacy.collectAsState()

    LaunchedEffect(Unit) {
        val uid = authViewModel.currentUser?.uid
        if (uid != null) {
            pharmacyViewModel.loadPharmacyByOwnerId(uid)
        }
    }
    
    // Default to true to prevent flickering while loading
    val hasValidSubscription = pharmacy?.hasValidSubscription ?: true

    // Navigate back from any sub-screen when back is pressed
    BackHandler(enabled = profileSubScreen != ProfileSubScreen.NONE) {
        profileSubScreen = ProfileSubScreen.NONE
    }

    val navItems = listOf(
        OwnerNavItem("Home",         Icons.Filled.Home,          Icons.Outlined.Home),
        OwnerNavItem("Analytics",    Icons.Filled.BarChart,      Icons.Outlined.BarChart),
        OwnerNavItem("Profile",      Icons.Filled.AccountCircle, Icons.Outlined.AccountCircle),
        OwnerNavItem("Subscription", Icons.Filled.CreditCard,    Icons.Outlined.CreditCard)
    )

    // Hide bottom nav when in sub-screens
    val showBottomBar = profileSubScreen == ProfileSubScreen.NONE

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(containerColor = White) {
                    navItems.forEachIndexed { index, item ->
                        NavigationBarItem(
                            selected = selectedTab == index,
                            onClick = {
                                selectedTab = index
                                profileSubScreen = ProfileSubScreen.NONE
                            },
                            icon = {
                                Icon(
                                    imageVector = if (selectedTab == index) item.selectedIcon else item.unselectedIcon,
                                    contentDescription = item.label
                                )
                            },
                            label = { Text(item.label) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Teal500,
                                selectedTextColor = Teal500,
                                unselectedIconColor = Gray400,
                                unselectedTextColor = Gray400,
                                indicatorColor = Teal50
                            )
                        )
                    }
                }
            }
        },
        containerColor = White,
        modifier = modifier
    ) { paddingValues ->
        when {
            // ── Profile sub-screens ──────────────────────────────────────────
            profileSubScreen == ProfileSubScreen.EDIT_PROFILE ->
                PharmacyEditProfileScreen(
                    onBackClick = { profileSubScreen = ProfileSubScreen.NONE }
                )

            profileSubScreen == ProfileSubScreen.OPERATING_HOURS ->
                EditOperatingHoursScreen(
                    onBackClick = { profileSubScreen = ProfileSubScreen.NONE }
                )

            profileSubScreen == ProfileSubScreen.NOTIFICATIONS ->
                PharmacyNotificationSettingsScreen(
                    onBackClick = { profileSubScreen = ProfileSubScreen.NONE }
                )

            profileSubScreen == ProfileSubScreen.EDIT_LOCATION ->
                EditLocationScreen(
                    onBackClick = { profileSubScreen = ProfileSubScreen.NONE }
                )

            // ── Main tab destinations ────────────────────────────────────────
            else -> when (selectedTab) {
                0 -> if (hasValidSubscription) {
                    PharmacyOwnerDashboardScreen(
                        modifier = Modifier.padding(bottom = paddingValues.calculateBottomPadding())
                    )
                } else {
                    ExpiredSubscriptionView(modifier = Modifier.padding(bottom = paddingValues.calculateBottomPadding()))
                }
                1 -> if (hasValidSubscription) {
                    AnalyticsScreen(modifier = Modifier.padding(bottom = paddingValues.calculateBottomPadding()))
                } else {
                    ExpiredSubscriptionView(modifier = Modifier.padding(bottom = paddingValues.calculateBottomPadding()))
                }
                2 -> PharmacyOwnerProfileScreen(
                    onEditProfileClick    = { profileSubScreen = ProfileSubScreen.EDIT_PROFILE },
                    onOperatingHoursClick = { profileSubScreen = ProfileSubScreen.OPERATING_HOURS },
                    onLocationClick       = { profileSubScreen = ProfileSubScreen.EDIT_LOCATION },
                    onSubscriptionClick   = { selectedTab = 3 }, // Jump to Subscription tab — mirrors iOS
                    onNotificationsClick  = { profileSubScreen = ProfileSubScreen.NOTIFICATIONS },
                    onSignOutClick        = onSignOut,
                    modifier = Modifier.padding(bottom = paddingValues.calculateBottomPadding())
                )
                3 -> SubscriptionScreen(
                    onBackClick = { selectedTab = 0 }, // Go back to home if they press back (though it's a tab now)
                    modifier = Modifier.padding(bottom = paddingValues.calculateBottomPadding())
                )
                else -> Unit
            }
        }
    }
}
