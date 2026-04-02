/// Pharmacy Dashboard ViewModel
///
/// Handles fetching analytics data for a pharmacy from Firestore.
/// Inquiries logic has been removed — users contact pharmacies via WhatsApp.

import SwiftUI
import Combine
import FirebaseFirestore

class PharmacyDashboardViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?

    // WhatsApp engagement stats fetched from Firestore
    @Published var totalWhatsappClicks: Int = 0

    private let db = FirebaseManager.shared.firestore
    private var listeners = Set<AnyCancellable>()

    /// Fetch pharmacy-level stats from Firestore for the given pharmacy doc ID.
    func fetchStats(for pharmacyId: String) {
        isLoading = true
        errorMessage = nil

        db.collection("pharmacies").document(pharmacyId).getDocument { [weak self] snapshot, error in
            guard let self = self else { return }
            self.isLoading = false

            if let error = error {
                self.errorMessage = "Failed to load stats: \(error.localizedDescription)"
                return
            }

            guard let data = snapshot?.data() else { return }

            DispatchQueue.main.async {
                self.totalWhatsappClicks = data["whatsappClicks"] as? Int ?? 0
            }
        }
    }
}
