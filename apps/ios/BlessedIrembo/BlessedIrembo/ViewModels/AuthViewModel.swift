/// Authentication ViewModel
///
/// Manages authentication state, form validation, and Firebase Auth calls
/// for user and pharmacy sign up and sign in.
///
/// Changes in this version:
///  - Phone number is now the PRIMARY field for user sign-up (email is optional)
///  - `signIn` accepts either email OR phone number (phone → email lookup)
///  - `verifyLicenseNumber` checks the `licensed_pharmacies` Firestore collection
///  - Pharmacy sign-up marks the license as registered after creation

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
    
    // MARK: - License Verification
    
    @Published var licenseStatus: LicenseCheckStatus = .idle
    @Published var licensedPharmacyName: String = ""
    
    enum LicenseCheckStatus {
        case idle, checking, valid, alreadyTaken, invalid
    }
    
    private var licenseDebounceTask: DispatchWorkItem?
    
    /// Debounced real-time license verification (600 ms delay, mirrors the web).
    func checkLicense(_ number: String) {
        licenseDebounceTask?.cancel()
        let trimmed = number.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            licenseStatus = .idle
            licensedPharmacyName = ""
            return
        }
        licenseStatus = .checking
        let work = DispatchWorkItem { [weak self] in
            FirebaseManager.shared.verifyLicenseNumber(trimmed) { result in
                DispatchQueue.main.async {
                    switch result {
                    case .valid(let name):
                        self?.licenseStatus = .valid
                        self?.licensedPharmacyName = name
                    case .alreadyTaken(let name):
                        self?.licenseStatus = .alreadyTaken
                        self?.licensedPharmacyName = name
                    case .invalid:
                        self?.licenseStatus = .invalid
                        self?.licensedPharmacyName = ""
                    }
                }
            }
        }
        licenseDebounceTask = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6, execute: work)
    }
    
    // MARK: - Sign Up User
    
    /// Phone number is required. Email is optional but validated if provided.
    func signUpUser(
        fullName: String,
        phoneNumber: String,
        email: String,
        password: String,
        confirmPassword: String,
        acceptedTerms: Bool,
        completion: @escaping (Result<User, Error>) -> Void
    ) {
        guard !fullName.isEmpty else { return showValidationError("Please enter your full name") }
        guard User.isValidPhoneNumber(phoneNumber) else { return showValidationError("Please enter a valid Rwandan phone number (+250...)") }
        // Email is optional — only validate format if something was entered
        if !email.isEmpty {
            guard User.isValidEmail(email) else { return showValidationError("Please enter a valid email address") }
        }
        guard password.count >= 6 else { return showValidationError("Password must be at least 6 characters") }
        guard password == confirmPassword else { return showValidationError("Passwords do not match") }
        guard acceptedTerms else { return showValidationError("Please accept the terms and conditions") }
        
        // Firebase Auth requires an email. If user skips email, generate a
        // synthetic one from the phone number so the Auth account is still valid.
        let normalizedPhone = User.normalizePhoneNumber(phoneNumber)
        let loginEmail = email.isEmpty
            ? "\(normalizedPhone.replacingOccurrences(of: "+", with: ""))@blessed-irembo.app"
            : email
        
        isLoading = true
        errorMessage = nil
        
        auth.createUser(withEmail: loginEmail, password: password) { [weak self] result, error in
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
            
            let userData: [String: Any] = [
                "fullName": fullName,
                "email": loginEmail,
                "phoneNumber": normalizedPhone,
                "role": "user",
                "createdAt": FieldValue.serverTimestamp()
            ]
            
            self.db.collection("users").document(uid).setData(userData) { error in
                if let error = error {
                    try? Auth.auth().signOut()
                    DispatchQueue.main.async {
                        self.isLoading = false
                        self.showValidationError("Profile save failed: \(error.localizedDescription)")
                        completion(.failure(error))
                    }
                    return
                }
                
                self.db.collection("phone_to_email").document(normalizedPhone).setData(["email": loginEmail])
                
                DispatchQueue.main.async {
                    self.isLoading = false
                    let user = User(
                        id: uid,
                        fullName: fullName,
                        email: loginEmail,
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
        phoneNumber: String,
        email: String,
        licenseNumber: String,
        address: String,
        latitude: Double,
        longitude: Double,
        is24Hours: Bool,
        operatingDays: [String],
        openTime: String,
        closeTime: String,
        password: String,
        confirmPassword: String,
        completion: @escaping (Result<Pharmacy, Error>) -> Void
    ) {
        // Guard: license must have passed verification
        guard licenseStatus == .valid else {
            if licenseStatus == .alreadyTaken {
                return showValidationError("This pharmacy is already registered. Please sign in instead.")
            }
            return showValidationError("Please enter a valid Rwanda NPC council registration number")
        }
        guard !pharmacyName.isEmpty else { return showValidationError("Please enter pharmacy name") }
        guard !ownerName.isEmpty else { return showValidationError("Please enter owner name") }
        guard User.isValidPhoneNumber(phoneNumber) else { return showValidationError("Please enter a valid phone number") }
        guard User.isValidEmail(email) else { return showValidationError("Please enter a valid email address") }
        guard !address.isEmpty else { return showValidationError("Please enter pharmacy address") }
        guard latitude != 0.0 && longitude != 0.0 else { return showValidationError("Please select your location via GPS or enter coordinates") }
        guard password.count >= 6 else { return showValidationError("Password must be at least 6 characters") }
        guard password == confirmPassword else { return showValidationError("Passwords do not match") }
        
        isLoading = true
        errorMessage = nil
        
        let normalizedPhone = User.normalizePhoneNumber(phoneNumber)
        let normalizedLicense = licenseNumber.uppercased().trimmingCharacters(in: .whitespacesAndNewlines)
        
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
            
            let pharmacyData: [String: Any] = [
                "name": pharmacyName,
                "ownerName": ownerName,
                "email": email,
                "phoneNumber": normalizedPhone,
                "whatsAppNumber": normalizedPhone,
                "registrationNumber": normalizedLicense,
                "address": address,
                "latitude": latitude,
                "longitude": longitude,
                "role": "pharmacy",
                "isVerified": true,    // verified against FDA list
                "isActive": true,
                "rating": 0.0,
                "reviewCount": 0,
                "whatsappClicks": 0,
                "description": "",
                "services": [],
                "operatingHours": [
                    "is24Hours": is24Hours,
                    "days": operatingDays,
                    "openTime": openTime,
                    "closeTime": closeTime
                ] as [String: Any],
                "is24_7": is24Hours,
                "createdAt": FieldValue.serverTimestamp()
            ]
            
            self.db.collection("pharmacies").document(uid).setData(pharmacyData) { error in
                if let error = error {
                    try? Auth.auth().signOut()
                    DispatchQueue.main.async {
                        self.isLoading = false
                        self.showValidationError("Profile save failed: \(error.localizedDescription)")
                        completion(.failure(error))
                    }
                    return
                }
                
                // Mark the license as registered (prevents duplicate sign-ups, same as web)
                let docId = normalizedLicense.replacingOccurrences(of: "/", with: "_")
                FirebaseManager.shared.licensedPharmaciesCollection
                    .document(docId)
                    .updateData(["isRegistered": true, "registeredUid": uid]) { _ in }
                
                // Add phone-to-email mapping
                self.db.collection("phone_to_email").document(normalizedPhone).setData(["email": email])
                
                DispatchQueue.main.async {
                    self.isLoading = false
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
                        isVerified: true
                    )
                    completion(.success(pharmacy))
                }
            }
        }
    }
    
    // MARK: - Sign In (email OR phone number)
    
    func signIn(
        identifier: String,
        password: String,
        rememberMe: Bool,
        completion: @escaping (Result<(user: User?, pharmacy: Pharmacy?), Error>) -> Void
    ) {
        let trimmed = identifier.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return showValidationError("Please enter your email or phone number") }
        guard !password.isEmpty else { return showValidationError("Please enter your password") }
        
        isLoading = true
        errorMessage = nil
        
        // If the identifier contains '@' it's an email; otherwise resolve phone → email
        if trimmed.contains("@") {
            performSignIn(email: trimmed, password: password, rememberMe: rememberMe, completion: completion)
        } else {
            // Phone-number path: look up the matching email in Firestore first
            FirebaseManager.shared.fetchEmailByPhone(phone: trimmed) { [weak self] result in
                guard let self = self else { return }
                switch result {
                case .success(let email):
                    self.performSignIn(email: email, password: password, rememberMe: rememberMe, completion: completion)
                case .failure:
                    DispatchQueue.main.async {
                        self.isLoading = false
                        self.showValidationError("No account found with this phone number.")
                    }
                }
            }
        }
    }
    
    private func performSignIn(
        email: String,
        password: String,
        rememberMe: Bool,
        completion: @escaping (Result<(user: User?, pharmacy: Pharmacy?), Error>) -> Void
    ) {
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
                            licenseNumber: data["registrationNumber"] as? String ?? data["licenseNumber"] as? String ?? "",
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
                        // Fallback: create a user doc if missing
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
    
    // MARK: - Helpers
    
    private func showValidationError(_ message: String) {
        errorMessage = message
        showError = true
    }
    
    private func friendlyAuthError(_ error: Error) -> String {
        let nsError = error as NSError
        let code = AuthErrorCode(rawValue: nsError.code)
        switch code {
        case .emailAlreadyInUse:
            return "This email is already in use. Try signing in instead."
        case .invalidEmail:
            return "Please enter a valid email address."
        case .weakPassword:
            return "Password is too weak. Use at least 6 characters."
        case .wrongPassword, .invalidCredential:
            return "Incorrect email or password. Please try again."
        case .userNotFound:
            return "No account found. Please check your details or sign up."
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
