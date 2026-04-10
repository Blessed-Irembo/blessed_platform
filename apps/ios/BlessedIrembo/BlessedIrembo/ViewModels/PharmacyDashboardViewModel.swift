/// Pharmacy Dashboard ViewModel
///
/// Keeps pharmacy engagement metrics (whatsappClicks, rating, reviewCount)
/// in sync via a real-time Firestore snapshot listener.
///
/// This mirrors the web platform's `usePharmacyData` pattern:
///   - On `startListening(for:)` → attaches a real-time listener
///   - Every Firestore write (WhatsApp click, new review) triggers an update
///   - Call `stopListening()` when the view disappears to avoid leaks

import SwiftUI
import Combine
import FirebaseFirestore

class PharmacyDashboardViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?

    // Engagement metrics — kept live via Firestore listener
    @Published var whatsappClicks: Int = 0
    @Published var profileViews: Int = 0
    @Published var isPremium: Bool = false
    @Published var subscriptionPlan: String = "Free"

    private let db = FirebaseManager.shared.firestore
    private var listener: ListenerRegistration?

    deinit { stopListening() }

    // MARK: - Real-time Listener

    /// Attach a Firestore snapshot listener for the given pharmacy document.
    /// Data automatically refreshes whenever whatsappClicks, rating, or
    /// reviewCount change in Firestore — no manual refresh needed.
    func startListening(for pharmacyId: String) {
        guard !pharmacyId.isEmpty else { return }
        stopListening()

        isLoading = true
        errorMessage = nil

        listener = db.collection("pharmacies")
            .document(pharmacyId)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self = self else { return }

                self.isLoading = false

                if let error = error {
                    self.errorMessage = "Failed to load metrics: \(error.localizedDescription)"
                    return
                }

                guard let data = snapshot?.data() else { return }

                DispatchQueue.main.async {
                    self.whatsappClicks  = data["whatsappClicks"]  as? Int    ?? 0
                    self.profileViews    = data["profileViews"]    as? Int    ?? 0
                    self.isPremium       = data["isPremium"]        as? Bool   ?? false
                    self.subscriptionPlan = data["subscriptionPlan"] as? String ?? (self.isPremium ? "Premium" : "Free")
                }
            }
    }

    /// Detach the listener — call from `onDisappear` to free resources.
    func stopListening() {
        listener?.remove()
        listener = nil
    }
}
