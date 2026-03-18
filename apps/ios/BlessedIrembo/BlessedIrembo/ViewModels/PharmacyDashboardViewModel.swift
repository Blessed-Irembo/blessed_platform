/// Pharmacy Dashboard ViewModel
///
/// Handles fetching inquiries and analytics data for a Pharmacy from Firestore.

import SwiftUI
import Combine
import FirebaseFirestore

class PharmacyDashboardViewModel: ObservableObject {
    @Published var inquiries: [Inquiry] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    // Quick statistics
    @Published var totalInquiries: Int = 0
    @Published var unreadInquiries: Int = 0
    
    private let db = FirebaseManager.shared.firestore
    private var listeners = Set<AnyCancellable>()
    private var inquiriesListener: ListenerRegistration?
    
    deinit {
        inquiriesListener?.remove()
    }
    
    /// Observe inquiries for a specific pharmacy ID
    func fetchInquiries(for pharmacyId: String) {
        isLoading = true
        errorMessage = nil
        
        inquiriesListener?.remove()
        
        inquiriesListener = db.collection("inquiries")
            .whereField("pharmacyId", isEqualTo: pharmacyId)
            .order(by: "createdAt", descending: true)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self = self else { return }
                self.isLoading = false
                
                if let error = error {
                    self.errorMessage = "Failed to fetch inquiries: \(error.localizedDescription)"
                    return
                }
                
                guard let documents = snapshot?.documents else { return }
                
                let fetched: [Inquiry] = documents.compactMap { doc in
                    let data = doc.data()
                    
                    let timestamp = data["createdAt"] as? Timestamp
                    let date = timestamp?.dateValue() ?? Date()
                    
                    return Inquiry(
                        id: doc.documentID,
                        pharmacyId: data["pharmacyId"] as? String ?? "",
                        userName: data["userName"] as? String ?? "Unknown",
                        userEmail: data["userEmail"] as? String ?? "",
                        userPhone: data["userPhone"] as? String ?? "",
                        message: data["message"] as? String ?? "",
                        createdAt: date,
                        isRead: data["isRead"] as? Bool ?? false
                    )
                }
                
                DispatchQueue.main.async {
                    self.inquiries = fetched
                    self.totalInquiries = fetched.count
                    self.unreadInquiries = fetched.filter { !$0.isRead }.count
                }
            }
    }
    
    /// Mark an inquiry as read
    func markAsRead(inquiryId: String) {
        db.collection("inquiries").document(inquiryId).updateData([
            "isRead": true
        ]) { error in
            if let error = error {
                print("Error updating inquiry: \(error)")
            }
        }
    }
}
