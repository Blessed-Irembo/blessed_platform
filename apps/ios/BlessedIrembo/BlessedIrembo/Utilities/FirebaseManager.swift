/// Firebase Manager
///
/// Singleton that configures Firebase and exposes Auth + Firestore
/// instances for use throughout the app.

import FirebaseCore
import FirebaseAuth
import FirebaseFirestore

class FirebaseManager {
    
    static let shared = FirebaseManager()
    
    let auth: Auth
    let firestore: Firestore
    
    private init() {
        self.auth = Auth.auth()
        self.firestore = Firestore.firestore()
    }
    
    // MARK: - Firestore Collection References
    
    var usersCollection: CollectionReference {
        firestore.collection("users")
    }
    
    var pharmaciesCollection: CollectionReference {
        firestore.collection("pharmacies")
    }
    
    /// The seeded Rwanda FDA licensed pharmacies list.
    /// Document IDs use underscore instead of slash: NPC_A0000
    var licensedPharmaciesCollection: CollectionReference {
        firestore.collection("licensed_pharmacies")
    }
    
    // MARK: - Fetch User Role
    
    /// Fetches the role document for a given Firebase uid.
    /// First checks `users` collection, then `pharmacies`.
    func fetchUserRole(uid: String, completion: @escaping (UserRole?) -> Void) {
        usersCollection.document(uid).getDocument { snapshot, _ in
            if let data = snapshot?.data(), !data.isEmpty {
                completion(.user(data))
                return
            }
            self.pharmaciesCollection.document(uid).getDocument { snapshot, _ in
                if let data = snapshot?.data(), !data.isEmpty {
                    completion(.pharmacy(data))
                } else {
                    completion(nil)
                }
            }
        }
    }
    
    // MARK: - Phone → Email Lookup
    
    /// Looks up a Firebase Auth email from a normalised phone number stored in
    /// either the `users` or `pharmacies` Firestore collection.
    /// Used to support "sign in with phone number" without Firebase Phone Auth.
    func fetchEmailByPhone(
        phone: String,
        completion: @escaping (Result<String, Error>) -> Void
    ) {
        let normalised = User.normalizePhoneNumber(phone)
        
        // Search users collection first
        usersCollection
            .whereField("phoneNumber", isEqualTo: normalised)
            .limit(to: 1)
            .getDocuments { snapshot, error in
                if let error = error {
                    completion(.failure(error))
                    return
                }
                if let doc = snapshot?.documents.first,
                   let email = doc.data()["email"] as? String, !email.isEmpty {
                    completion(.success(email))
                    return
                }
                // Fall back to pharmacies collection
                self.pharmaciesCollection
                    .whereField("phoneNumber", isEqualTo: normalised)
                    .limit(to: 1)
                    .getDocuments { snapshot, error in
                        if let error = error {
                            completion(.failure(error))
                            return
                        }
                        if let doc = snapshot?.documents.first,
                           let email = doc.data()["email"] as? String, !email.isEmpty {
                            completion(.success(email))
                        } else {
                            let err = NSError(
                                domain: "FirebaseManager",
                                code: 404,
                                userInfo: [NSLocalizedDescriptionKey: "No account found with this phone number."]
                            )
                            completion(.failure(err))
                        }
                    }
            }
    }
    
    // MARK: - License Verification
    
    /// Verifies a Rwanda FDA council registration number against the
    /// `licensed_pharmacies` Firestore collection.
    /// - The doc ID is the normalised number with '/' replaced by '_' (e.g. NPC_A0001)
    func verifyLicenseNumber(
        _ rawNumber: String,
        completion: @escaping (LicenseVerificationResult) -> Void
    ) {
        let regNum = rawNumber.uppercased().trimmingCharacters(in: .whitespaces)
        
        // Quick format check: NPC/A followed by 4 digits
        let pattern = "^NPC/A\\d{4}$"
        let predicate = NSPredicate(format: "SELF MATCHES %@", pattern)
        guard predicate.evaluate(with: regNum) else {
            completion(.invalid)
            return
        }
        
        // Firestore uses '_' because '/' is a path separator
        let docId = regNum.replacingOccurrences(of: "/", with: "_")
        licensedPharmaciesCollection.document(docId).getDocument { snapshot, error in
            if let _ = error {
                completion(.invalid)
                return
            }
            guard let data = snapshot?.data() else {
                completion(.invalid)
                return
            }
            let name = data["name"] as? String ?? ""
            let isRegistered = data["isRegistered"] as? Bool ?? false
            if isRegistered {
                completion(.alreadyTaken(name: name))
            } else {
                completion(.valid(name: name))
            }
        }
    }
}

// MARK: - Supporting Types

/// Discriminated role union returned by `fetchUserRole`
enum UserRole {
    case user([String: Any])
    case pharmacy([String: Any])
}

/// Result of checking a Rwanda FDA council registration number
enum LicenseVerificationResult {
    case valid(name: String)
    case alreadyTaken(name: String)
    case invalid
}
