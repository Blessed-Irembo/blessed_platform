/// Inquiry Model
///
/// Represents a message sent from a user to a pharmacy.

import Foundation

struct Inquiry: Codable, Identifiable {
    let id: String
    let pharmacyId: String
    let userName: String
    let userEmail: String
    let userPhone: String
    let message: String
    let createdAt: Date
    var isRead: Bool
    
    init(id: String = UUID().uuidString,
         pharmacyId: String,
         userName: String,
         userEmail: String,
         userPhone: String,
         message: String,
         createdAt: Date = Date(),
         isRead: Bool = false) {
        self.id = id
        self.pharmacyId = pharmacyId
        self.userName = userName
        self.userEmail = userEmail
        self.userPhone = userPhone
        self.message = message
        self.createdAt = createdAt
        self.isRead = isRead
    }
    
    var initials: String {
        let components = userName.split(separator: " ")
        if components.count >= 2 {
            if let first = components.first?.first, let last = components.last?.first {
                return String(first) + String(last)
            }
        } else if let first = userName.first {
            return String(first)
        }
        return "??"
    }
    
    var timeAgoString: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: createdAt, relativeTo: Date())
    }
}
