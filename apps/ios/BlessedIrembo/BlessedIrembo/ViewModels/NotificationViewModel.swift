import Foundation
import Combine
import FirebaseFirestore

@MainActor
class NotificationViewModel: ObservableObject {
    @Published var notifications: [AppNotification] = []
    
    var unreadCount: Int {
        notifications.filter { !$0.isRead }.count
    }
    
    private let db = FirebaseManager.shared.firestore
    private var listenerRegistration: ListenerRegistration?
    
    deinit {
        listenerRegistration?.remove()
    }
    
    func startListening(for recipientId: String) {
        listenerRegistration?.remove()
        
        let query = db.collection("notifications")
            .whereField("recipientId", isEqualTo: recipientId)
        
        listenerRegistration = query.addSnapshotListener { [weak self] snapshot, error in
            guard let self = self else { return }
            
            if let error = error {
                print("Error listening for notifications: \(error.localizedDescription)")
                return
            }
            
            guard let documents = snapshot?.documents else { return }
            
            var fetched: [AppNotification] = []
            for doc in documents {
                let data = doc.data()
                
                let notif = AppNotification(
                    id: doc.documentID,
                    recipientId: data["recipientId"] as? String ?? "",
                    title: data["title"] as? String ?? "",
                    message: data["message"] as? String ?? "",
                    type: data["type"] as? String ?? "system",
                    isRead: data["isRead"] as? Bool ?? false,
                    createdAt: (data["createdAt"] as? Timestamp)?.dateValue() ?? Date(),
                    actionUrl: data["actionUrl"] as? String
                )
                fetched.append(notif)
            }
            
            // Sort client-side to avoid needing a composite index in Firestore immediately
            fetched.sort { $0.createdAt > $1.createdAt }
            
            self.notifications = fetched
        }
    }
    
    func stopListening() {
        listenerRegistration?.remove()
        listenerRegistration = nil
    }
    
    func markAsRead(notificationId: String) async {
        do {
            try await db.collection("notifications").document(notificationId).updateData([
                "isRead": true
            ])
        } catch {
            print("Failed to mark notification as read: \(error.localizedDescription)")
        }
    }
    
    /// Utility function to send a notification (e.g. from the app to the Admin)
    static func sendNotification(recipientId: String, title: String, message: String, type: String = "system", actionUrl: String? = nil) async {
        let db = FirebaseManager.shared.firestore
        var data: [String: Any] = [
            "recipientId": recipientId,
            "title": title,
            "message": message,
            "type": type,
            "isRead": false,
            "createdAt": FieldValue.serverTimestamp()
        ]
        if let actionUrl = actionUrl {
            data["actionUrl"] = actionUrl
        }
        
        do {
            try await db.collection("notifications").addDocument(data: data)
        } catch {
            print("Failed to send notification: \(error.localizedDescription)")
        }
    }
}
