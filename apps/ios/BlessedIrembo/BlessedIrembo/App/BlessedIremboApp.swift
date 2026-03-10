/// App Entry Point
///
/// Main entry point for the Blessed Irembo iOS application.
/// Manages app-wide state and initial navigation flow.

import SwiftUI
import FirebaseCore
import GoogleMaps

@main
struct BlessedIremboApp: App {
    @StateObject private var appState = AppState()
    
    init() {
        // Configure Firebase
        FirebaseApp.configure()
        
        // Configure Google Maps
        GMSServices.provideAPIKey("AIzaSyA-0elDxTyX8mwO5oOsNClv9G-JZPu8BdI")
    }
    
    var body: some Scene {
        WindowGroup {
            NavigationStack(path: $appState.navigationPath) {
                Group {
                    if appState.isLoading {
                        SplashView()
                    } else if !appState.hasCompletedOnboarding {
                        OnboardingContainerView()
                    } else if !appState.isAuthenticated {
                        RoleSelectionView()
                    } else if appState.currentUser != nil {
                        // User signed in - show map
                        UserMainView()
                    } else if appState.currentPharmacy != nil {
                        // Pharmacy signed in
                        PharmacyMainView()
                    } else {
                        // Fallback
                        Text("Main App")
                            .font(.title)
                            .foregroundColor(.textPrimary)
                    }
                }
                .environmentObject(appState)
            }
        }
    }
}
