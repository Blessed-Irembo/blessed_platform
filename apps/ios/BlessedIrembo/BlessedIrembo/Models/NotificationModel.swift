import Foundation
import FirebaseFirestore

struct AppNotification: Identifiable {
    let id: String
    var recipientId: String
    var title: String
    var message: String
    var type: String      // "subscription", "system", "alert"
    var isRead: Bool
    var createdAt: Date
    var actionUrl: String?

    init(id: String = UUID().uuidString,
         recipientId: String,
         title: String,
         message: String,
         type: String = "system",
         isRead: Bool = false,
         createdAt: Date = Date(),
         actionUrl: String? = nil) {
        self.id = id
        self.recipientId = recipientId
        self.title = title
        self.message = message
        self.type = type
        self.isRead = isRead
        self.createdAt = createdAt
        self.actionUrl = actionUrl
    }
}
