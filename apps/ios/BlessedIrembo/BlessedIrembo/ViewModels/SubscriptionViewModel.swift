/// Subscription ViewModel
///
/// Manages all subscription logic for the pharmacy:
///   - Calculating free trial / premium / expired status from Firestore data
///   - Listening for pending subscription requests in real-time
///   - Submitting payment intent to Firestore
///   - Uploading receipt images to Firebase Storage
///   - Cancelling a pending request

import SwiftUI
import Combine
import FirebaseFirestore
import FirebaseStorage

@MainActor
class SubscriptionViewModel: ObservableObject {

    // MARK: - Published State

    @Published var status: SubscriptionStatus = .unknown
    @Published var pendingRequest: SubscriptionRequest? = nil
    @Published var isLoading = false
    @Published var isUploading = false
    @Published var uploadProgress: Double = 0.0
    @Published var errorMessage: String? = nil
    @Published var successMessage: String? = nil

    private let db = FirebaseManager.shared.firestore
    private var requestListener: ListenerRegistration?

    deinit {
        requestListener?.remove()
    }

    // MARK: - Status Calculation
    // Mirrors the web logic exactly: subscriptionEndDate → Premium,
    // no endDate + within 90 days of createdAt → Free Trial, else Expired

    func calculateStatus(pharmacy: Pharmacy) {
        let now = Date()
        
        // Check administrative activation first
        if !pharmacy.isActive {
            status = .expired
            return
        }

        if let endDate = pharmacy.subscriptionEndDate {
            // Has a paid subscription
            if endDate > now {
                status = .premium(expiresOn: endDate)
            } else {
                status = .expired
            }
        } else {
            // No paid subscription — check 90-day free trial
            let trialEnd = Calendar.current.date(byAdding: .day, value: 90, to: pharmacy.createdAt) ?? pharmacy.createdAt
            if trialEnd > now {
                let daysRemaining = Calendar.current.dateComponents([.day], from: now, to: trialEnd).day ?? 0
                status = .freeTrial(daysRemaining: max(daysRemaining, 0))
            } else {
                status = .expired
            }
        }
    }

    // MARK: - Real-time Pending Request Listener

    func startPendingRequestListener(pharmacyId: String) {
        requestListener?.remove()

        let query = db.collection("subscription_requests")
            .whereField("pharmacyId", isEqualTo: pharmacyId)
            .whereField("status", isEqualTo: "pending")

        requestListener = query.addSnapshotListener { [weak self] snapshot, error in
            guard let self = self else { return }
            Task { @MainActor in
                if let error = error {
                    print("[SubscriptionVM] Listener error: \(error.localizedDescription)")
                    return
                }
                // Take the most recent pending request (should usually be 0 or 1)
                if let doc = snapshot?.documents.first {
                    self.pendingRequest = SubscriptionRequest(id: doc.documentID, data: doc.data())
                } else {
                    self.pendingRequest = nil
                }
            }
        }
    }

    func stopListener() {
        requestListener?.remove()
        requestListener = nil
    }

    // MARK: - Submit Intent to Pay

    func submitIntent(plan: SubscriptionPlan, pharmacy: Pharmacy) async {
        isLoading = true
        errorMessage = nil

        let data: [String: Any] = [
            "pharmacyId": pharmacy.id,
            "pharmacyName": pharmacy.name,
            "planId": plan.id,
            "amount": plan.amount,
            "status": "pending",
            "receiptUrl": "",
            "createdAt": FieldValue.serverTimestamp()
        ]

        do {
            try await db.collection("subscription_requests").addDocument(data: data)
            successMessage = "Payment intent submitted! Our team will review it shortly."
        } catch {
            errorMessage = "Failed to submit intent: \(error.localizedDescription)"
        }

        isLoading = false
    }

    // MARK: - Cancel Pending Request

    func cancelRequest() async {
        guard let request = pendingRequest else { return }
        isLoading = true
        errorMessage = nil

        do {
            try await db.collection("subscription_requests").document(request.id).updateData([
                "status": "cancelled"
            ])
            // The real-time listener will auto-clear pendingRequest
        } catch {
            errorMessage = "Failed to cancel request: \(error.localizedDescription)"
        }

        isLoading = false
    }

    // MARK: - Upload Receipt
    // Requires FirebaseStorage to be added to the Xcode project.
    // Steps:
    //   1. In Xcode: File → Add Package Dependencies
    //   2. Search: https://github.com/firebase/firebase-ios-sdk
    //   3. Add product: FirebaseStorage to your app target
    //   4. Uncomment the `import FirebaseStorage` at the top of this file
    //   5. Uncomment the upload code below

    func uploadReceipt(imageData: Data, pharmacy: Pharmacy) async {
        guard let request = pendingRequest else {
            errorMessage = "No pending request found."
            return
        }

        isUploading = true
        errorMessage = nil

        let timestamp = Int(Date().timeIntervalSince1970)
        let path = "receipts/\(pharmacy.id)_\(timestamp)_receipt.jpg"
        let storageRef = Storage.storage().reference().child(path)
        let metadata = StorageMetadata()
        metadata.contentType = "image/jpeg"

        do {
            _ = try await storageRef.putDataAsync(imageData, metadata: metadata) { progress in
                if let progress = progress {
                    Task { @MainActor in
                        self.uploadProgress = progress.fractionCompleted
                    }
                }
            }
            let downloadURL = try await storageRef.downloadURL()

            // Update the request document with the receipt URL
            try await db.collection("subscription_requests").document(request.id).updateData([
                "receiptUrl": downloadURL.absoluteString
            ])
            successMessage = "Receipt uploaded successfully! The admin can now see your payment proof."
            
            // Notify admins
            await NotificationViewModel.sendNotification(
                recipientId: "ADMIN",
                title: "New Receipt Uploaded",
                message: "Pharmacy \(pharmacy.name) uploaded a payment receipt.",
                type: "subscription",
                actionUrl: "/dashboard/subscriptions"
            )
        } catch {
            errorMessage = "Upload failed: \(error.localizedDescription)"
        }

        isUploading = false
        uploadProgress = 0
    }

    // MARK: - Helpers

    func clearMessages() {
        errorMessage = nil
        successMessage = nil
    }
}
