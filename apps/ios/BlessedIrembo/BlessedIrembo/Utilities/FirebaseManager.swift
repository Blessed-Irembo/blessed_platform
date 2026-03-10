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
}

/// Discriminated role union returned by `fetchUserRole`
enum UserRole {
    case user([String: Any])
    case pharmacy([String: Any])
}
