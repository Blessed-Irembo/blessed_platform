package com.blessedirembo.app.navigation

import android.content.Intent
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.blessedirembo.app.auth.AuthState
import com.blessedirembo.app.auth.AuthViewModel
import com.blessedirembo.app.auth.FirebaseAuthManager
import com.blessedirembo.app.data.model.UserRole
import com.blessedirembo.app.ui.screens.FindPharmaciesScreen
import com.blessedirembo.app.ui.screens.GuestSignInPromptScreen
import com.blessedirembo.app.ui.screens.HomeScreen

import com.blessedirembo.app.ui.screens.PharmacyDetailScreen
import com.blessedirembo.app.ui.screens.PharmacyRegistrationScreen
import com.blessedirembo.app.ui.screens.ProfileScreen
import com.blessedirembo.app.ui.screens.SignInScreen
import com.blessedirembo.app.ui.screens.SplashScreen
import com.blessedirembo.app.ui.screens.UserSignUpScreen
import com.blessedirembo.app.ui.screens.WelcomeScreen
import com.blessedirembo.app.ui.screens.owner.PharmacyOwnerMainScreen

/**
 * Navigation routes for the Blessed Irembo app
 */
sealed class Screen(val route: String) {
    data object Splash : Screen("splash")

    data object Welcome : Screen("welcome")
    data object UserSignUp : Screen("user_signup")
    data object PharmacyRegistration : Screen("pharmacy_registration")
    data object Home : Screen("home")
    data object SignIn : Screen("sign_in")
    data object Profile : Screen("profile")
    data object EditProfile : Screen("edit_profile")
    data object FindPharmacies : Screen("find_pharmacies")
    data object UserNotificationSettings : Screen("user_notification_settings")
    data object UserPrivacySettings : Screen("user_privacy_settings")
    data object UserLocationSettings : Screen("user_location_settings")
    data object UserAppearanceSettings : Screen("user_appearance_settings")
    data object PharmacyDetail : Screen("pharmacy_detail/{pharmacyId}") {
        fun createRoute(pharmacyId: String) = "pharmacy_detail/$pharmacyId"
    }
    // Pharmacy Owner Routes
    data object PharmacyOwnerMain : Screen("pharmacy_owner_main")

    // ── Guest routes ──────────────────────────────────────────────────────────
    data object GuestHome : Screen("guest_home")
    data object GuestFindPharmacies : Screen("guest_find_pharmacies")
    data object GuestSignInPrompt : Screen("guest_sign_in_prompt")
}

/**
 * Helper: navigate to the correct home based on role.
 */
private fun NavHostController.navigateToHome(role: String) {
    val destination = if (role == UserRole.PHARMACY_OWNER) {
        Screen.PharmacyOwnerMain.route
    } else {
        Screen.Home.route
    }
    navigate(destination) {
        popUpTo(0) { inclusive = true } // Clear entire back stack
    }
}

/**
 * Navigation graph configuration.
 * Supports:
 *  - Splash → role-aware auto-login check
 *  - Sign In → routes to User Home or Pharmacy Owner Dashboard based on Firestore role
 *  - Sign Up (User)  → saves role=USER, routes to HomeScreen
 *  - Sign Up (Owner) → saves role=PHARMACY_OWNER, routes to PharmacyOwnerMainScreen
 */
@Composable
fun NavGraph(
    navController: NavHostController,
    startDestination: String = Screen.Splash.route
) {
    // Shared AuthViewModel so Splash, SignIn, SignUp all share the same instance
    val authViewModel: AuthViewModel = viewModel()

    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {

        // ── Splash Screen ──────────────────────────────────────────────────────
        composable(route = Screen.Splash.route) {
            var checked by remember { mutableStateOf(false) }

            // After splash animation, check if user is already signed in
            SplashScreen(
                onNavigateToWelcome = {
                    if (!checked) {
                        checked = true
                        if (FirebaseAuthManager.isSignedIn) {
                            // Resolve role before navigating
                            authViewModel.getCurrentUserRole { role ->
                                navController.navigateToHome(role ?: UserRole.USER)
                            }
                        } else {
                            navController.navigate(Screen.Welcome.route) {
                                popUpTo(Screen.Splash.route) { inclusive = true }
                            }
                        }
                    }
                }
            )
        }



        // ── Welcome / Role Selection Screen ────────────────────────────────────
        composable(route = Screen.Welcome.route) {
            WelcomeScreen(
                onLookingForPharmacy = {
                    navController.navigate(Screen.UserSignUp.route)
                },
                onOwnPharmacy = {
                    navController.navigate(Screen.PharmacyRegistration.route)
                },
                onSignIn = {
                    navController.navigate(Screen.SignIn.route)
                },
                onBrowseAsGuest = {
                    navController.navigate(Screen.GuestHome.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                }
            )
        }

        // ── Sign In Screen ─────────────────────────────────────────────────────
        composable(route = Screen.SignIn.route) {
            SignInScreen(
                onBackClick = { navController.popBackStack() },
                onSignInSuccess = { role ->
                    navController.navigateToHome(role)
                },
                onNavigateToSignUp = { navController.popBackStack() },
                authViewModel = authViewModel
            )
        }

        // ── User Sign Up Screen ────────────────────────────────────────────────
        composable(route = Screen.UserSignUp.route) {
            UserSignUpScreen(
                onBackClick = { navController.popBackStack() },
                onSignUpSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                },
                onSignInClick = {
                    navController.navigate(Screen.SignIn.route) {
                        popUpTo(Screen.Welcome.route)
                    }
                },
                authViewModel = authViewModel
            )
        }

        // ── Pharmacy Registration Screen ────────────────────────────────────────
        composable(route = Screen.PharmacyRegistration.route) {
            PharmacyRegistrationScreen(
                onBackClick = { navController.popBackStack() },
                onRegisterClick = {
                    navController.navigate(Screen.PharmacyOwnerMain.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                },
                onSignInClick = {
                    navController.navigate(Screen.SignIn.route) {
                        popUpTo(Screen.Welcome.route)
                    }
                },
                authViewModel = authViewModel
            )
        }

        // ── Home Screen (user looking for pharmacies) ──────────────────────────
        composable(route = Screen.Home.route) {
            HomeScreen(
                onOpenMap = { navController.navigate(Screen.FindPharmacies.route) },
                onNavigateToProfile = { navController.navigate(Screen.Profile.route) }
            )
        }

        // ── Profile Screen ─────────────────────────────────────────────────────
        composable(route = Screen.Profile.route) {
            ProfileScreen(
                onBackClick = { navController.popBackStack() },
                onLogoutClick = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                },
                onEditClick = { navController.navigate(Screen.EditProfile.route) },
                onNotificationsClick = { navController.navigate(Screen.UserNotificationSettings.route) },
                onPrivacyClick = { navController.navigate(Screen.UserPrivacySettings.route) },
                onLocationClick = { navController.navigate(Screen.UserLocationSettings.route) },
                onAppearanceClick = { navController.navigate(Screen.UserAppearanceSettings.route) },
                authViewModel = authViewModel
            )
        }

        // ── User Settings Screens ──────────────────────────────────────────────
        composable(route = Screen.UserNotificationSettings.route) {
            com.blessedirembo.app.ui.screens.UserNotificationSettingsScreen(
                onBackClick = { navController.popBackStack() }
            )
        }
        composable(route = Screen.UserPrivacySettings.route) {
            com.blessedirembo.app.ui.screens.UserPrivacySettingsScreen(
                onBackClick = { navController.popBackStack() }
            )
        }
        composable(route = Screen.UserLocationSettings.route) {
            com.blessedirembo.app.ui.screens.UserLocationSettingsScreen(
                onBackClick = { navController.popBackStack() }
            )
        }
        composable(route = Screen.UserAppearanceSettings.route) {
            com.blessedirembo.app.ui.screens.UserAppearanceSettingsScreen(
                onBackClick = { navController.popBackStack() }
            )
        }

        // ── Edit Profile Screen ────────────────────────────────────────────────
        composable(route = Screen.EditProfile.route) {
            com.blessedirembo.app.ui.screens.EditProfileScreen(
                onBackClick = { navController.popBackStack() },
                authViewModel = authViewModel
            )
        }

        // ── Find Pharmacies Screen (authenticated user) ─────────────────────
        composable(route = Screen.FindPharmacies.route) {
            FindPharmaciesScreen(
                onBackClick = { navController.popBackStack() },
                onPharmacyClick = { pharmacyId ->
                    navController.navigate(Screen.PharmacyDetail.createRoute(pharmacyId))
                }
            )
        }

        // ── Guest Home Screen ─────────────────────────────────────────────────
        composable(route = Screen.GuestHome.route) {
            HomeScreen(
                isGuest = true,
                onOpenMap = { navController.navigate(Screen.GuestFindPharmacies.route) },
                onNavigateToProfile = { /* not used when isGuest=true */ },
                onSignInRequired = { navController.navigate(Screen.GuestSignInPrompt.route) }
            )
        }

        // ── Guest Find Pharmacies Screen ──────────────────────────────────────
        composable(route = Screen.GuestFindPharmacies.route) {
            FindPharmaciesScreen(
                isGuest = true,
                onBackClick = { navController.popBackStack() },
                onPharmacyClick = { /* gated — never called for guests */ },
                onSignInRequired = { navController.navigate(Screen.GuestSignInPrompt.route) }
            )
        }

        // ── Guest Sign-In Prompt Screen ───────────────────────────────────────
        composable(route = Screen.GuestSignInPrompt.route) {
            GuestSignInPromptScreen(
                onSignInClick = {
                    navController.navigate(Screen.SignIn.route) {
                        popUpTo(Screen.GuestHome.route) { inclusive = true }
                    }
                },
                onCreateAccountClick = {
                    navController.navigate(Screen.UserSignUp.route) {
                        popUpTo(Screen.GuestHome.route) { inclusive = true }
                    }
                },
                onContinueBrowsing = { navController.popBackStack() }
            )
        }

        // ── Pharmacy Detail Screen ─────────────────────────────────────────────
        composable(
            route = Screen.PharmacyDetail.route,
            arguments = listOf(navArgument("pharmacyId") { type = NavType.StringType })
        ) { backStackEntry ->
            val pharmacyId = backStackEntry.arguments?.getString("pharmacyId") ?: ""
            val context = LocalContext.current
            PharmacyDetailScreen(
                pharmacyId = pharmacyId,
                onBackClick = { navController.popBackStack() },
                onShareClick = {
                    val shareUrl = "https://www.blessedirembo.com/pharmacy/$pharmacyId"
                    val shareText = "Find this pharmacy on Blessed Irembo:\n$shareUrl"
                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"
                        putExtra(Intent.EXTRA_TEXT, shareText)
                    }
                    context.startActivity(Intent.createChooser(shareIntent, "Share Pharmacy"))
                }
            )
        }

        // ── Pharmacy Owner Main Screen (with bottom navigation) ────────────────
        composable(route = Screen.PharmacyOwnerMain.route) {
            PharmacyOwnerMainScreen(
                onSignOut = {
                    authViewModel.signOut()
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(Screen.PharmacyOwnerMain.route) { inclusive = true }
                    }
                },
                authViewModel = authViewModel
            )
        }
    }
}
