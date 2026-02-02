/// Authentication ViewModel
///
/// Manages authentication state, form validation, and API calls
/// for user and pharmacy sign up and sign in.

import SwiftUI
import Combine

class AuthViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var showError = false
    
    // MARK: - Sign Up User
    
    func signUpUser(
        fullName: String,
        email: String,
        phoneNumber: String,
        password: String,
        confirmPassword: String,
        acceptedTerms: Bool,
        completion: @escaping (Result<User, Error>) -> Void
    ) {
        // Validate inputs
        guard !fullName.isEmpty else {
            showValidationError("Please enter your full name")
            return
        }
        
        guard User.isValidEmail(email) else {
            showValidationError("Please enter a valid email address")
            return
        }
        
        guard User.isValidPhoneNumber(phoneNumber) else {
            showValidationError("Please enter a valid phone number")
            return
        }
       
        guard password.count >= 8 else {
            showValidationError("Password must be at least 8 characters")
            return
        }
        
        guard password == confirmPassword else {
            showValidationError("Passwords do not match")
            return
        }
        
        guard acceptedTerms else {
            showValidationError("Please accept the terms and conditions")
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        // Simulate API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            self.isLoading = false
            
            // Create user
            let user = User(
                fullName: fullName,
                email: email,
                phoneNumber: User.normalizePhoneNumber(phoneNumber)
            )
            
            completion(.success(user))
        }
    }
    
    // MARK: - Sign Up Pharmacy
    
    func signUpPharmacy(
        pharmacyName: String,
        ownerName: String,
        email: String,
        phoneNumber: String,
        licenseNumber: String,
        address: String,
        latitude: Double,
        longitude: Double,
        password: String,
        confirmPassword: String,
        completion: @escaping (Result<Pharmacy, Error>) -> Void
    ) {
        // Validate inputs
        guard !pharmacyName.isEmpty else {
            showValidationError("Please enter pharmacy name")
            return
        }
        
        guard !ownerName.isEmpty else {
            showValidationError("Please enter owner name")
            return
        }
        
        guard User.isValidEmail(email) else {
            showValidationError("Please enter a valid email address")
            return
        }
        
        guard User.isValidPhoneNumber(phoneNumber) else {
            showValidationError("Please enter a valid phone number")
            return
        }
        
        guard Pharmacy.isValidLicenseNumber(licenseNumber) else {
            showValidationError("Please enter a valid license number")
            return
        }
        
        guard !address.isEmpty else {
            showValidationError("Please enter pharmacy address")
            return
        }
        
        guard password.count >= 8 else {
            showValidationError("Password must be at least 8 characters")
            return
        }
        
        guard password == confirmPassword else {
            showValidationError("Passwords do not match")
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        // Simulate API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            self.isLoading = false
            
            // Create pharmacy
            let pharmacy = Pharmacy(
                name: pharmacyName,
                ownerName: ownerName,
                email: email,
                phoneNumber: User.normalizePhoneNumber(phoneNumber),
                licenseNumber: licenseNumber.uppercased(),
                address: address,
                latitude: latitude,
                longitude: longitude
            )
            
            completion(.success(pharmacy))
        }
    }
    
    // MARK: - Sign In
    
    func signIn(
        email: String,
        password: String,
        rememberMe: Bool,
        completion: @escaping (Result<(user: User?, pharmacy: Pharmacy?), Error>) -> Void
    ) {
        // Only validate email format - password can be anything for demo
        guard !email.isEmpty else {
            showValidationError("Please enter an email address")
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        // Simulate API call with short delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.isLoading = false
            
            if email.lowercased().contains("pharmacy") {
                // Sign in as pharmacy if email contains "pharmacy"
                let pharmacy = Pharmacy(
                    id: "demo-pharmacy-001",
                    name: "Demo Pharmacy",
                    ownerName: "Jane Smith",
                    email: email,
                    phoneNumber: "+250788000002",
                    licenseNumber: "DEMO-PH-001",
                    address: "Kigali City Center",
                    latitude: -1.9536,
                    longitude: 30.0606,
                    isVerified: true,
                    rating: 4.8,
                    reviewCount: 100,
                    description: "Demo pharmacy for testing purposes",
                    services: ["Prescription Medications", "Health Consultations"],
                    operatingHours: "Mon-Sun: 24 Hours"
                )
                
                if rememberMe {
                    UserDefaults.standard.set(email, forKey: UserDefaultsKeys.rememberedEmail)
                }
                
                print("DEBUG: Signing in as PHARMACY")
                completion(.success((user: nil, pharmacy: pharmacy)))
            } else {
                // Sign in as user for any other email
                let user = User(
                    fullName: "Demo User",
                    email: email,
                    phoneNumber: "+250788123456"
                )
                
                if rememberMe {
                    UserDefaults.standard.set(email, forKey: UserDefaultsKeys.rememberedEmail)
                }
                
                print("DEBUG: Signing in as USER")
                completion(.success((user: user, pharmacy: nil)))
            }
        }
    }
    
    // MARK: - Helper Methods
    
    private func showValidationError(_ message: String) {
        errorMessage = message
        showError = true
    }
}
