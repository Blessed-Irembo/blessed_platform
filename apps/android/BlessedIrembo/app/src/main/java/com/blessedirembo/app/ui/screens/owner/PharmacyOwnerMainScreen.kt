package com.blessedirembo.app.ui.screens.owner

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Message
import androidx.compose.material.icons.outlined.Person
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
    SUBSCRIPTION
}

/**
 * Main screen for pharmacy owners with bottom navigation.
 * Handles sub-screen stack for Profile tabs (Edit Profile, Operating Hours, Subscription).
 */
@Composable
fun PharmacyOwnerMainScreen(
    onSignOut: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var profileSubScreen by remember { mutableStateOf(ProfileSubScreen.NONE) }

    // Navigate back from any sub-screen when back is pressed
    BackHandler(enabled = profileSubScreen != ProfileSubScreen.NONE) {
        profileSubScreen = ProfileSubScreen.NONE
    }

    val navItems = listOf(
        OwnerNavItem("Home",     Icons.Filled.Home,    Icons.Outlined.Home),
        OwnerNavItem("Inquiries",Icons.Filled.Message, Icons.Outlined.Message),
        OwnerNavItem("Analytics",Icons.Filled.BarChart,Icons.Outlined.BarChart),
        OwnerNavItem("Profile",  Icons.Filled.Person,  Icons.Outlined.Person)
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

            profileSubScreen == ProfileSubScreen.SUBSCRIPTION ->
                SubscriptionScreen(
                    onBackClick = { profileSubScreen = ProfileSubScreen.NONE },
                    modifier = Modifier.padding(paddingValues)
                )

            // ── Main tab destinations ────────────────────────────────────────
            else -> when (selectedTab) {
                0 -> PharmacyOwnerDashboardScreen(
                    onViewAllInquiriesClick = { selectedTab = 1 },
                    modifier = Modifier.padding(paddingValues)
                )
                1 -> InquiriesScreen(modifier = Modifier.padding(paddingValues))
                2 -> AnalyticsScreen(modifier = Modifier.padding(paddingValues))
                3 -> PharmacyOwnerProfileScreen(
                    onEditProfileClick   = { profileSubScreen = ProfileSubScreen.EDIT_PROFILE },
                    onOperatingHoursClick = { profileSubScreen = ProfileSubScreen.OPERATING_HOURS },
                    onSubscriptionClick  = { profileSubScreen = ProfileSubScreen.SUBSCRIPTION },
                    onSignOutClick       = onSignOut,
                    modifier = Modifier.padding(paddingValues)
                )
                else -> Unit
            }
        }
    }
}
