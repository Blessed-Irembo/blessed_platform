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
        GMSServices.provideAPIKey("AIzaSyA86lpmNQ37J9gnZGvwSJl2tw9fYsnnYss")
    }
    
    var body: some Scene {
        WindowGroup {
            // Inject AppState at the very top so ALL descendant views,
            // including NavigationLink destinations, receive it automatically.
            ContentRootView()
                .environmentObject(appState)
        }
    }
}

/// Root switcher that drives the main navigation flow.
/// Kept separate from BlessedIremboApp so @EnvironmentObject is available.
private struct ContentRootView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        NavigationStack(path: $appState.navigationPath) {
            ZStack {
                if appState.isLoading {
                    ZStack {
                        Color(.systemBackground)
                            .ignoresSafeArea()
                        ProgressView()
                            .scaleEffect(1.2)
                            .tint(.primaryTeal)
                    }
                    .transition(.opacity)
                } else if !appState.hasCompletedOnboarding {
                    OnboardingContainerView()
                        .transition(.opacity)
                } else if !appState.isAuthenticated && !appState.isGuest {
                    RoleSelectionView()
                        .transition(.opacity)
                } else if appState.isGuest {
                    UserMainView()
                        .transition(.opacity)
                } else if appState.currentUser != nil {
                    UserMainView()
                        .transition(.opacity)
                } else if appState.currentPharmacy != nil {
                    PharmacyMainView()
                        .transition(.opacity)
                } else {
                    Text("Main App")
                        .font(.title)
                        .foregroundColor(Color.textPrimary)
                        .transition(.opacity)
                }
            }
            .animation(.easeInOut(duration: 0.35), value: appState.isLoading)
            .animation(.easeInOut(duration: 0.35), value: appState.isAuthenticated)
            .animation(.easeInOut(duration: 0.35), value: appState.hasCompletedOnboarding)
        }
        .id(appState.isAuthenticated ? (appState.currentUser?.id ?? appState.currentPharmacy?.id ?? "auth") : "guest")
    }
}
