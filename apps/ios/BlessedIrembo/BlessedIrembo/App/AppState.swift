/// App State Management
///
/// Observable class managing global application state including
/// authentication, onboarding completion, and navigation.

import SwiftUI
import Combine
import FirebaseAuth
import FirebaseFirestore

class AppState: ObservableObject {
    @Published var isLoading = true
    @Published var hasCompletedOnboarding = false
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var currentPharmacy: Pharmacy?
    @Published var navigationPath = NavigationPath()
    
    private var authHandle: AuthStateDidChangeListenerHandle?
    
    init() {
        // Load onboarding state first
        hasCompletedOnboarding = UserDefaults.standard.bool(
            forKey: UserDefaultsKeys.hasCompletedOnboarding
        )
        
        // Splash: show for at least 2 seconds while Firebase resolves auth
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            self?.isLoading = false
        }
        
        // Attach Firebase auth state listener
        attachAuthListener()
    }
    
    deinit {
        if let handle = authHandle {
            Auth.auth().removeStateDidChangeListener(handle)
        }
    }
    
    // MARK: - Firebase Auth Listener
    
    private func attachAuthListener() {
        authHandle = Auth.auth().addStateDidChangeListener { [weak self] _, firebaseUser in
            guard let self = self else { return }
            
            if let firebaseUser = firebaseUser {
                // User is signed in — fetch their role from Firestore
                FirebaseManager.shared.fetchUserRole(uid: firebaseUser.uid) { role in
                    DispatchQueue.main.async {
                        switch role {
                        case .user(let data):
                            self.currentPharmacy = nil
                            self.currentUser = User(
                                id: firebaseUser.uid,
                                fullName: data["fullName"] as? String ?? "",
                                email: firebaseUser.email ?? "",
                                phoneNumber: data["phoneNumber"] as? String ?? ""
                            )
                            self.isAuthenticated = true
                            self.navigationPath = NavigationPath()
                        case .pharmacy(let data):
                            self.currentUser = nil
                            // Decode structured operatingHours map
                            var oh = OperatingHours()
                            if let ohMap = data["operatingHours"] as? [String: Any] {
                                oh = OperatingHours(
                                    is24Hours: ohMap["is24Hours"] as? Bool ?? false,
                                    days: ohMap["days"] as? [String] ?? [],
                                    openTime: ohMap["openTime"] as? String ?? "",
                                    closeTime: ohMap["closeTime"] as? String ?? ""
                                )
                            }
                            self.currentPharmacy = Pharmacy(
                                id: firebaseUser.uid,
                                name: data["name"] as? String ?? "",
                                ownerName: data["ownerName"] as? String ?? "",
                                email: firebaseUser.email ?? "",
                                phoneNumber: data["phoneNumber"] as? String ?? "",
                                whatsAppNumber: data["whatsAppNumber"] as? String ?? data["phoneNumber"] as? String ?? "",
                                licenseNumber: data["licenseNumber"] as? String ?? "",
                                address: data["address"] as? String ?? "",
                                district: data["district"] as? String ?? "",
                                latitude: data["latitude"] as? Double ?? -1.9536,
                                longitude: data["longitude"] as? Double ?? 30.0606,
                                isVerified: data["isVerified"] as? Bool ?? false,
                                is24_7: data["is24_7"] as? Bool ?? oh.is24Hours,
                                isPremium: data["isPremium"] as? Bool ?? false,
                                rating: data["rating"] as? Double ?? 0.0,
                                reviewCount: data["reviewCount"] as? Int ?? 0,
                                whatsappClicks: data["whatsappClicks"] as? Int ?? 0,
                                description: data["description"] as? String ?? "",
                                operatingHours: oh
                            )
                            self.isAuthenticated = true
                            self.navigationPath = NavigationPath()
                        case nil:
                            // Firestore doc missing; sign out to be safe
                            try? Auth.auth().signOut()
                            self.clearAuthState()
                        }
                    }
                }
            } else {
                // Signed out
                DispatchQueue.main.async {
                    self.clearAuthState()
                }
            }
        }
    }
    
    private func clearAuthState() {
        currentUser = nil
        currentPharmacy = nil
        isAuthenticated = false
    }
    
    // MARK: - Onboarding
    
    /// Mark onboarding as completed
    func completeOnboarding() {
        hasCompletedOnboarding = true
        UserDefaults.standard.set(true, forKey: UserDefaultsKeys.hasCompletedOnboarding)
    }
    
    // MARK: - Manual sign-in helpers (still used by views post sign-in)
    
    /// Called after successful Firebase signIn when role is already known by AuthViewModel
    func signIn(user: User) {
        currentUser = user
        isAuthenticated = true
        navigationPath = NavigationPath()
    }
    
    func signIn(pharmacy: Pharmacy) {
        currentPharmacy = pharmacy
        isAuthenticated = true
        navigationPath = NavigationPath()
    }
    
    // MARK: - Sign Out
    
    func signOut() {
        do {
            try Auth.auth().signOut()
            // clearAuthState() will be called by the auth listener
        } catch {
            print("Sign out error: \(error.localizedDescription)")
            clearAuthState()
        }
    }
    
    // MARK: - Dev helpers
    
    func resetOnboarding() {
        hasCompletedOnboarding = false
        UserDefaults.standard.set(false, forKey: UserDefaultsKeys.hasCompletedOnboarding)
    }
}
