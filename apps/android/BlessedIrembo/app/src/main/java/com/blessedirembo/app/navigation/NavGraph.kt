package com.blessedirembo.app.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.blessedirembo.app.ui.screens.FindPharmaciesScreen
import com.blessedirembo.app.ui.screens.HomeScreen
import com.blessedirembo.app.ui.screens.PharmacyDetailScreen
import com.blessedirembo.app.ui.screens.PharmacyRegistrationScreen
import com.blessedirembo.app.ui.screens.ProfileScreen
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
    data object FindPharmacies : Screen("find_pharmacies")
    data object PharmacyDetail : Screen("pharmacy_detail/{pharmacyId}") {
        fun createRoute(pharmacyId: String) = "pharmacy_detail/$pharmacyId"
    }
    // Pharmacy Owner Routes
    data object PharmacyOwnerMain : Screen("pharmacy_owner_main")
}

/**
 * Navigation graph configuration
 * Defines all screen destinations and navigation flows
 */
@Composable
fun NavGraph(
    navController: NavHostController,
    startDestination: String = Screen.Splash.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // Splash Screen
        composable(route = Screen.Splash.route) {
            SplashScreen(
                onNavigateToWelcome = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        // Welcome/Role Selection Screen
        composable(route = Screen.Welcome.route) {
            WelcomeScreen(
                onLookingForPharmacy = {
                    navController.navigate(Screen.UserSignUp.route)
                },
                onOwnPharmacy = {
                    navController.navigate(Screen.PharmacyRegistration.route)
                },
                onSignIn = {
                    // TODO: Navigate to sign in screen
                    // For now, navigate to home as placeholder
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                }
            )
        }

        // User Sign Up Screen
        composable(route = Screen.UserSignUp.route) {
            UserSignUpScreen(
                onBackClick = {
                    navController.popBackStack()
                },
                onSignUpClick = {
                    // TODO: Handle sign up logic
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                },
                onSignInClick = {
                    // Navigate to Home for now (sign in placeholder)
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                }
            )
        }

        // Pharmacy Registration Screen
        composable(route = Screen.PharmacyRegistration.route) {
            PharmacyRegistrationScreen(
                onBackClick = {
                    navController.popBackStack()
                },
                onRegisterClick = {
                    // Navigate to Pharmacy Owner Dashboard
                    navController.navigate(Screen.PharmacyOwnerMain.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                },
                onSignInClick = {
                    // Navigate to Pharmacy Owner Dashboard for now
                    navController.navigate(Screen.PharmacyOwnerMain.route) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                }
            )
        }

        // Home Screen (for users looking for pharmacies)
        composable(route = Screen.Home.route) {
            HomeScreen(
                onOpenMap = {
                    navController.navigate(Screen.FindPharmacies.route)
                },
                onNavigateToProfile = {
                    navController.navigate(Screen.Profile.route)
                }
            )
        }
        
        // Profile Screen
        composable(route = Screen.Profile.route) {
            ProfileScreen(
                onBackClick = {
                    navController.popBackStack()
                },
                onLogoutClick = {
                    // Navigate back to Welcome screen on logout
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                }
            )
        }
        
        // Find Pharmacies Screen
        composable(route = Screen.FindPharmacies.route) {
            FindPharmaciesScreen(
                onBackClick = {
                    navController.popBackStack()
                },
                onPharmacyClick = { pharmacyId ->
                    navController.navigate(Screen.PharmacyDetail.createRoute(pharmacyId))
                }
            )
        }
        
        // Pharmacy Detail Screen
        composable(
            route = Screen.PharmacyDetail.route,
            arguments = listOf(
                navArgument("pharmacyId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val pharmacyId = backStackEntry.arguments?.getString("pharmacyId") ?: ""
            PharmacyDetailScreen(
                pharmacyId = pharmacyId,
                onBackClick = {
                    navController.popBackStack()
                },
                onShareClick = {
                    // TODO: Implement share functionality
                }
            )
        }
        
        // Pharmacy Owner Main Screen (with bottom navigation)
        composable(route = Screen.PharmacyOwnerMain.route) {
            PharmacyOwnerMainScreen(
                onSignOut = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(Screen.PharmacyOwnerMain.route) { inclusive = true }
                    }
                }
            )
        }
    }
}
