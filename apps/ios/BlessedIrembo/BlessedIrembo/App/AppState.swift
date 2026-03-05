/// App State Management
///
/// Observable class managing global application state including
/// authentication, onboarding completion, and navigation.

import SwiftUI
import Combine

class AppState: ObservableObject {
    @Published var isLoading = true
    @Published var hasCompletedOnboarding = false
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var currentPharmacy: Pharmacy?
    @Published var navigationPath = NavigationPath()
    
    init() {
        loadAppState()
        
        // Simulate splash screen delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            self.isLoading = false
        }
    }
    
    /// Load persisted app state from UserDefaults
    private func loadAppState() {
        hasCompletedOnboarding = UserDefaults.standard.bool(
            forKey: UserDefaultsKeys.hasCompletedOnboarding
        )
    }
    
    /// Mark onboarding as completed
    func completeOnboarding() {
        hasCompletedOnboarding = true
        UserDefaults.standard.set(true, forKey: UserDefaultsKeys.hasCompletedOnboarding)
    }
    
    /// Sign in user
    func signIn(user: User) {
        currentUser = user
        isAuthenticated = true
        // Clear navigation path to return to root, which will now show UserMainView
        navigationPath = NavigationPath()
    }
    
    /// Sign in pharmacy
    func signIn(pharmacy: Pharmacy) {
        currentPharmacy = pharmacy
        isAuthenticated = true
        // Clear navigation path to return to root, which will now show PharmacyMainView
        navigationPath = NavigationPath()
    }
    
    /// Sign out
    func signOut() {
        currentUser = nil
        currentPharmacy = nil
        isAuthenticated = false
    }
    
    /// Reset app state (for testing)
    func resetOnboarding() {
        hasCompletedOnboarding = false
        UserDefaults.standard.set(false, forKey: UserDefaultsKeys.hasCompletedOnboarding)
    }
}
