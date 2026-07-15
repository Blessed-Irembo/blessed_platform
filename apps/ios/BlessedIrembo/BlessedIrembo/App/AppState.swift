/// App State Management
///
/// Observable class managing global application state including
/// authentication, onboarding completion, and navigation.
///
/// The pharmacy document is kept in sync via a real-time Firestore
/// snapshot listener so metrics (whatsappClicks, rating, reviewCount)
/// are always up to date — matching the web platform behaviour.

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
    @Published var selectedLanguage: Language = .english
    @Published var isRegistering = false
    @Published var isGuest = false

    /// Computed subscription status based on the live currentPharmacy.
    /// Used by PharmacyMainView to gate tab content without needing a ViewModel.
    var subscriptionStatus: SubscriptionStatus {
        guard let pharmacy = currentPharmacy else { return .unknown }
        
        // If the pharmacy is administratively deactivated, treat as expired
        if !pharmacy.isActive {
            return .expired
        }

        let now = Date()
        if let endDate = pharmacy.subscriptionEndDate {
            return endDate > now ? .premium(expiresOn: endDate) : .expired
        }
        let trialEnd = Calendar.current.date(byAdding: .day, value: 90, to: pharmacy.createdAt) ?? pharmacy.createdAt
        if trialEnd > now {
            let days = max(0, Calendar.current.dateComponents([.day], from: now, to: trialEnd).day ?? 0)
            return .freeTrial(daysRemaining: days)
        }
        return .expired
    }

    private var authHandle: AuthStateDidChangeListenerHandle?
    /// Active Firestore real-time listener for the current pharmacy document.
    private var pharmacyListener: ListenerRegistration?

    init() {
        // Load onboarding state first
        hasCompletedOnboarding = UserDefaults.standard.bool(
            forKey: UserDefaultsKeys.hasCompletedOnboarding
        )

        // Load language preference
        if let savedCode = UserDefaults.standard.string(forKey: UserDefaultsKeys.selectedLanguage),
           let lang = Language(rawValue: savedCode) {
            selectedLanguage = lang
        }

        // Initialize loading state: only wait/load if there is a cached active user session to resolve
        isLoading = Auth.auth().currentUser != nil

        // Attach Firebase auth state listener
        attachAuthListener()
    }

    deinit {
        if let handle = authHandle {
            Auth.auth().removeStateDidChangeListener(handle)
        }
        stopPharmacyListener()
    }

    // MARK: - Localization

    /// Dynamically retrieve translation value for a given key in the active language.
    func t(_ key: String) -> String {
        Translations.catalog[selectedLanguage.code]?[key] ?? key
    }

    /// Toggle between English and Kinyarwanda, saving preference to UserDefaults.
    func toggleLanguage() {
        selectedLanguage = (selectedLanguage == .english) ? .kinyarwanda : .english
        UserDefaults.standard.set(selectedLanguage.code, forKey: UserDefaultsKeys.selectedLanguage)
    }

    // MARK: - Firebase Auth Listener

    private func attachAuthListener() {
        authHandle = Auth.auth().addStateDidChangeListener { [weak self] _, firebaseUser in
            guard let self = self else { return }

            if self.isRegistering {
                return
            }

            if let firebaseUser = firebaseUser {
                // If we are already authenticated with a matching UID, ignore this state change to avoid redundant role fetch/accidental sign out
                if self.isAuthenticated && (self.currentUser?.id == firebaseUser.uid || self.currentPharmacy?.id == firebaseUser.uid) {
                    return
                }

                // User is signed in — fetch their role from Firestore
                FirebaseManager.shared.fetchUserRole(uid: firebaseUser.uid) { role in
                    DispatchQueue.main.async {
                        withAnimation(.easeInOut(duration: 0.35)) {
                            switch role {
                            case .user(let data):
                                self.stopPharmacyListener()
                                self.currentPharmacy = nil
                                self.currentUser = User(
                                    id: firebaseUser.uid,
                                    fullName: data["fullName"] as? String ?? "",
                                    email: firebaseUser.email ?? "",
                                    phoneNumber: data["phoneNumber"] as? String ?? ""
                                )
                                self.isAuthenticated = true
                                self.isGuest = false
                                self.navigationPath = NavigationPath()
                                self.isLoading = false

                            case .pharmacy:
                                // Start a real-time listener so all pharmacy metrics
                                // (whatsappClicks, rating, reviewCount) stay in sync.
                                self.currentUser = nil
                                self.startPharmacyListener(uid: firebaseUser.uid, email: firebaseUser.email ?? "")
                                self.isAuthenticated = true
                                self.isGuest = false
                                self.navigationPath = NavigationPath()
                                self.isLoading = false

                            case nil:
                                // Firestore doc missing; sign out to be safe
                                try? Auth.auth().signOut()
                                self.clearAuthState()
                                self.isLoading = false
                            }
                        }
                    }
                }
            } else {
                // Signed out
                DispatchQueue.main.async {
                    withAnimation(.easeInOut(duration: 0.35)) {
                        self.clearAuthState()
                        self.isLoading = false
                    }
                }
            }
        }
    }

    // MARK: - Real-time Pharmacy Listener

    /// Attaches a Firestore snapshot listener for the pharmacy document.
    /// Every time the document changes in Firestore (e.g. a user clicks WhatsApp
    /// on the web or the iOS map, or leaves a review) this handler fires and
    /// updates `currentPharmacy` so the dashboard shows live metrics.
    private func startPharmacyListener(uid: String, email: String) {
        stopPharmacyListener() // cancel any previous listener

        let ref = FirebaseManager.shared.pharmaciesCollection.document(uid)

        pharmacyListener = ref.addSnapshotListener { [weak self] snapshot, error in
            guard let self = self else { return }

            if let error = error {
                print("[AppState] Pharmacy listener error: \(error.localizedDescription)")
                return
            }

            guard let data = snapshot?.data(), !data.isEmpty else { return }

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

            DispatchQueue.main.async {
                // Decode subscriptionEndDate (Firestore Timestamp → Date)
                let subEndDate: Date? = (data["subscriptionEndDate"] as? Timestamp)?.dateValue()

                // Decode createdAt
                let createdDate: Date = (data["createdAt"] as? Timestamp)?.dateValue() ?? Date()

                self.currentPharmacy = Pharmacy(
                    id: uid,
                    name: data["name"] as? String ?? "",
                    ownerName: data["ownerName"] as? String ?? "",
                    email: data["email"] as? String ?? email,
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
                    createdAt: createdDate,
                    subscriptionEndDate: subEndDate,
                    registrationNumber: data["registrationNumber"] as? String ?? "",
                    isActive: data["isActive"] as? Bool ?? true,
                    rating: data["rating"] as? Double ?? 0.0,
                    reviewCount: data["reviewCount"] as? Int ?? 0,
                    whatsappClicks: data["whatsappClicks"] as? Int ?? 0,
                    profileViews: data["profileViews"] as? Int ?? 0,
                    description: data["description"] as? String ?? "",
                    services: data["services"] as? [String] ?? [],
                    operatingHours: oh,
                    imageUrls: data["imageUrls"] as? [String] ?? []
                )
            }
        }
    }

    /// Detaches the active pharmacy Firestore listener.
    private func stopPharmacyListener() {
        pharmacyListener?.remove()
        pharmacyListener = nil
    }

    private func clearAuthState() {
        stopPharmacyListener()
        currentUser = nil
        currentPharmacy = nil
        isAuthenticated = false
        isGuest = false
    }

    // MARK: - Onboarding

    /// Mark onboarding as completed
    func completeOnboarding() {
        withAnimation(.easeInOut(duration: 0.35)) {
            hasCompletedOnboarding = true
        }
        UserDefaults.standard.set(true, forKey: UserDefaultsKeys.hasCompletedOnboarding)
    }

    // MARK: - Manual sign-in helpers (still used by views post sign-in)

    /// Called after successful Firebase signIn when role is already known by AuthViewModel.
    /// For pharmacy users the real-time listener will populate currentPharmacy automatically.
    func signIn(user: User) {
        withAnimation(.easeInOut(duration: 0.35)) {
            currentUser = user
            isAuthenticated = true
            isGuest = false
            navigationPath = NavigationPath()
        }
    }

    func signIn(pharmacy: Pharmacy) {
        // Seed the initial snapshot so the UI loads immediately,
        // then the real-time listener will keep it up to date.
        withAnimation(.easeInOut(duration: 0.35)) {
            currentPharmacy = pharmacy
            isAuthenticated = true
            isGuest = false
            navigationPath = NavigationPath()
        }
        // Start the real-time Firestore listener to keep metrics in sync
        startPharmacyListener(uid: pharmacy.id, email: pharmacy.email)
    }

    // MARK: - Sign Out

    func signOut() {
        do {
            try Auth.auth().signOut()
            // clearAuthState() will be called by the auth listener
        } catch {
            print("Sign out error: \(error.localizedDescription)")
            withAnimation(.easeInOut(duration: 0.35)) {
                clearAuthState()
            }
        }
    }

    // MARK: - Account Deletion

    func deleteAccount(password: String, completion: @escaping (Result<Void, Error>) -> Void) {
        guard let firebaseUser = Auth.auth().currentUser, let email = firebaseUser.email else {
            completion(.failure(NSError(domain: "AppState", code: 401, userInfo: [NSLocalizedDescriptionKey: "No authenticated user"])))
            return
        }

        // 1. Re-authenticate user to permit deletion
        let credential = EmailAuthProvider.credential(withEmail: email, password: password)
        firebaseUser.reauthenticate(with: credential) { [weak self] _, error in
            guard let self = self else { return }
            if let error = error {
                completion(.failure(error))
                return
            }

            let uid = firebaseUser.uid
            let db = FirebaseManager.shared.firestore
            let batch = db.batch()

            // 2. Perform Firestore deletions based on active user role
            if let currentUser = self.currentUser {
                let userRef = FirebaseManager.shared.usersCollection.document(uid)
                batch.deleteDocument(userRef)

                let phone = currentUser.phoneNumber
                if !phone.isEmpty {
                    let phoneRef = db.collection("phone_to_email").document(phone)
                    batch.deleteDocument(phoneRef)
                }

                batch.commit { error in
                    if let error = error {
                        completion(.failure(error))
                        return
                    }
                    
                    firebaseUser.delete { error in
                        if let error = error {
                            completion(.failure(error))
                        } else {
                            DispatchQueue.main.async {
                                self.clearAuthState()
                                completion(.success(()))
                            }
                        }
                    }
                }
            } else if let currentPharmacy = self.currentPharmacy {
                let pharmacyRef = FirebaseManager.shared.pharmaciesCollection.document(uid)
                batch.deleteDocument(pharmacyRef)

                let phone = currentPharmacy.phoneNumber
                if !phone.isEmpty {
                    let phoneRef = db.collection("phone_to_email").document(phone)
                    batch.deleteDocument(phoneRef)
                }

                batch.commit { error in
                    if let error = error {
                        completion(.failure(error))
                        return
                    }

                    firebaseUser.delete { error in
                        if let error = error {
                            completion(.failure(error))
                        } else {
                            DispatchQueue.main.async {
                                self.clearAuthState()
                                completion(.success(()))
                            }
                        }
                    }
                }
            } else {
                // Fallback (e.g. no profile document loaded)
                firebaseUser.delete { error in
                    if let error = error {
                        completion(.failure(error))
                    } else {
                        DispatchQueue.main.async {
                            self.clearAuthState()
                            completion(.success(()))
                        }
                    }
                }
            }
        }
    }

    // MARK: - Dev helpers

    func resetOnboarding() {
        hasCompletedOnboarding = false
        UserDefaults.standard.set(false, forKey: UserDefaultsKeys.hasCompletedOnboarding)
    }
}
