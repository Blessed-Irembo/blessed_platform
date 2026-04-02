/// Authentication ViewModel
///
/// Manages authentication state, form validation, and Firebase Auth calls
/// for user and pharmacy sign up and sign in.

import SwiftUI
import Combine
import FirebaseAuth
import FirebaseFirestore

class AuthViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var showError = false
    @Published var resetEmailSent = false
    
    private let db = FirebaseManager.shared.firestore
    private let auth = FirebaseManager.shared.auth
    
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
        guard !fullName.isEmpty else { return showValidationError("Please enter your full name") }
        guard User.isValidEmail(email) else { return showValidationError("Please enter a valid email address") }
        guard User.isValidPhoneNumber(phoneNumber) else { return showValidationError("Please enter a valid phone number") }
        guard password.count >= 8 else { return showValidationError("Password must be at least 8 characters") }
        guard password == confirmPassword else { return showValidationError("Passwords do not match") }
        guard acceptedTerms else { return showValidationError("Please accept the terms and conditions") }
        
        isLoading = true
        errorMessage = nil
        
        // Create Firebase Auth account
        auth.createUser(withEmail: email, password: password) { [weak self] result, error in
            guard let self = self else { return }
            
            if let error = error {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.showValidationError(self.friendlyAuthError(error))
                }
                return
            }
            
            guard let uid = result?.user.uid else {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.showValidationError("Sign up failed. Please try again.")
                }
                return
            }
            
            let normalizedPhone = User.normalizePhoneNumber(phoneNumber)
            
            // Write user profile to Firestore
            let userData: [String: Any] = [
                "fullName": fullName,
                "email": email,
                "phoneNumber": normalizedPhone,
                "role": "user",
                "createdAt": FieldValue.serverTimestamp()
            ]
            
            self.db.collection("users").document(uid).setData(userData) { error in
                DispatchQueue.main.async {
                    self.isLoading = false
                    if let error = error {
                        self.showValidationError("Profile save failed: \(error.localizedDescription)")
                        return
                    }
                    let user = User(
                        id: uid,
                        fullName: fullName,
                        email: email,
                        phoneNumber: normalizedPhone
                    )
                    completion(.success(user))
                }
            }
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
        guard !pharmacyName.isEmpty else { return showValidationError("Please enter pharmacy name") }
        guard !ownerName.isEmpty else { return showValidationError("Please enter owner name") }
        guard User.isValidEmail(email) else { return showValidationError("Please enter a valid email address") }
        guard User.isValidPhoneNumber(phoneNumber) else { return showValidationError("Please enter a valid phone number") }
        guard Pharmacy.isValidLicenseNumber(licenseNumber) else { return showValidationError("Please enter a valid license number") }
        guard !address.isEmpty else { return showValidationError("Please enter pharmacy address") }
        guard password.count >= 8 else { return showValidationError("Password must be at least 8 characters") }
        guard password == confirmPassword else { return showValidationError("Passwords do not match") }
        
        isLoading = true
        errorMessage = nil
        
        // Create Firebase Auth account
        auth.createUser(withEmail: email, password: password) { [weak self] result, error in
            guard let self = self else { return }
            
            if let error = error {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.showValidationError(self.friendlyAuthError(error))
                }
                return
            }
            
            guard let uid = result?.user.uid else {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.showValidationError("Registration failed. Please try again.")
                }
                return
            }
            
            let normalizedPhone = User.normalizePhoneNumber(phoneNumber)
            let normalizedLicense = licenseNumber.uppercased()
            
            // Write pharmacy profile to Firestore
            let pharmacyData: [String: Any] = [
                "name": pharmacyName,
                "ownerName": ownerName,
                "email": email,
                "phoneNumber": normalizedPhone,
                "licenseNumber": normalizedLicense,
                "address": address,
                "latitude": latitude,
                "longitude": longitude,
                "role": "pharmacy",
                "isVerified": false,
                "rating": 0.0,
                "reviewCount": 0,
                "description": "",
                "services": [],
                "operatingHours": [
                    "is24Hours": false,
                    "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    "openTime": "08:00",
                    "closeTime": "20:00"
                ] as [String: Any],
                "createdAt": FieldValue.serverTimestamp()
            ]
            
            self.db.collection("pharmacies").document(uid).setData(pharmacyData) { error in
                DispatchQueue.main.async {
                    self.isLoading = false
                    if let error = error {
                        self.showValidationError("Profile save failed: \(error.localizedDescription)")
                        return
                    }
                    let pharmacy = Pharmacy(
                        id: uid,
                        name: pharmacyName,
                        ownerName: ownerName,
                        email: email,
                        phoneNumber: normalizedPhone,
                        licenseNumber: normalizedLicense,
                        address: address,
                        latitude: latitude,
                        longitude: longitude,
                        isVerified: false
                    )
                    completion(.success(pharmacy))
                }
            }
        }
    }
    
    // MARK: - Sign In
    
    func signIn(
        email: String,
        password: String,
        rememberMe: Bool,
        completion: @escaping (Result<(user: User?, pharmacy: Pharmacy?), Error>) -> Void
    ) {
        guard !email.isEmpty else { return showValidationError("Please enter an email address") }
        guard !password.isEmpty else { return showValidationError("Please enter your password") }
        
        isLoading = true
        errorMessage = nil
        
        auth.signIn(withEmail: email, password: password) { [weak self] result, error in
            guard let self = self else { return }
            
            if let error = error {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.showValidationError(self.friendlyAuthError(error))
                }
                return
            }
            
            guard let uid = result?.user.uid else {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.showValidationError("Sign in failed. Please try again.")
                }
                return
            }
            
            if rememberMe {
                UserDefaults.standard.set(email, forKey: UserDefaultsKeys.rememberedEmail)
            }
            
            // Fetch user role from Firestore
            FirebaseManager.shared.fetchUserRole(uid: uid) { role in
                DispatchQueue.main.async {
                    self.isLoading = false
                    switch role {
                    case .user(let data):
                        let user = User(
                            id: uid,
                            fullName: data["fullName"] as? String ?? "",
                            email: email,
                            phoneNumber: data["phoneNumber"] as? String ?? ""
                        )
                        completion(.success((user: user, pharmacy: nil)))
                        
                    case .pharmacy(let data):
                        // Decode the structured operatingHours map
                        var oh = OperatingHours()
                        if let ohMap = data["operatingHours"] as? [String: Any] {
                            oh = OperatingHours(
                                is24Hours: ohMap["is24Hours"] as? Bool ?? false,
                                days: ohMap["days"] as? [String] ?? [],
                                openTime: ohMap["openTime"] as? String ?? "",
                                closeTime: ohMap["closeTime"] as? String ?? ""
                            )
                        }
                        let pharmacy = Pharmacy(
                            id: uid,
                            name: data["name"] as? String ?? "",
                            ownerName: data["ownerName"] as? String ?? "",
                            email: email,
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
                            services: data["services"] as? [String] ?? [],
                            operatingHours: oh
                        )
                        completion(.success((user: nil, pharmacy: pharmacy)))
                        
                    case nil:
                        // No Firestore document — account was likely created via the web app.
                        // Treat as a regular user and create the document for future logins.
                        let userData: [String: Any] = [
                            "fullName": result?.user.displayName ?? "",
                            "email": email,
                            "phoneNumber": "",
                            "role": "user",
                            "createdAt": FieldValue.serverTimestamp()
                        ]
                        FirebaseManager.shared.usersCollection.document(uid).setData(userData)
                        
                        let user = User(
                            id: uid,
                            fullName: result?.user.displayName ?? "",
                            email: email,
                            phoneNumber: ""
                        )
                        completion(.success((user: user, pharmacy: nil)))
                    }
                }
            }
        }
    }
    
    // MARK: - Reset Password
    
    func resetPassword(email: String) {
        guard User.isValidEmail(email) else {
            showValidationError("Please enter a valid email address")
            return
        }
        isLoading = true
        auth.sendPasswordReset(withEmail: email) { [weak self] error in
            DispatchQueue.main.async {
                self?.isLoading = false
                if let error = error {
                    self?.showValidationError(self?.friendlyAuthError(error) ?? error.localizedDescription)
                } else {
                    self?.resetEmailSent = true
                    self?.errorMessage = nil
                }
            }
        }
    }
    
    // MARK: - Helper Methods
    
    private func showValidationError(_ message: String) {
        errorMessage = message
        showError = true
    }
    
    /// Translate Firebase error codes to clear user-facing messages
    private func friendlyAuthError(_ error: Error) -> String {
        let nsError = error as NSError
        let code = AuthErrorCode(rawValue: nsError.code)
        switch code {
        case .emailAlreadyInUse:
            return "This email is already in use. Try signing in instead."
        case .invalidEmail:
            return "Please enter a valid email address."
        case .weakPassword:
            return "Password is too weak. Use at least 8 characters."
        case .wrongPassword, .invalidCredential:
            return "Incorrect email or password. Please try again."
        case .userNotFound:
            return "No account found with this email. Please sign up."
        case .userDisabled:
            return "This account has been disabled. Contact support."
        case .networkError:
            return "Network error. Check your connection and try again."
        case .tooManyRequests:
            return "Too many attempts. Please wait a moment and try again."
        default:
            return error.localizedDescription
        }
    }
}
