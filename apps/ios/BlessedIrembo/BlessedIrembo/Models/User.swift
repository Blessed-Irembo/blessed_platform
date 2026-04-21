/// User Model
///
/// Represents a user in the Blessed Irembo application with
/// validation and Codable conformance for API integration.

import Foundation

struct User: Codable, Identifiable {
    let id: String
    var fullName: String
    var email: String
    var phoneNumber: String
    var createdAt: Date
    
    init(
        id: String = UUID().uuidString,
        fullName: String,
        email: String,
        phoneNumber: String,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.fullName = fullName
        self.email = email
        self.phoneNumber = phoneNumber
        self.createdAt = createdAt
    }
}

// MARK: - Validation

extension User {
    
    /// Validate email format
    static func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format:"SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }
    
    /// Validate phone number (Rwandan format)
    static func isValidPhoneNumber(_ phone: String) -> Bool {
        // Normalize first (removes spaces, adds +250) then validate length
        let normalized = normalizePhoneNumber(phone)
        let phoneRegex = "^\\+250[0-9]{9}$"
        let phonePredicate = NSPredicate(format:"SELF MATCHES %@", phoneRegex)
        return phonePredicate.evaluate(with: normalized)
    }
    
    /// Normalize phone number to +250 format
    static func normalizePhoneNumber(_ phone: String) -> String {
        var cleaned = phone.replacingOccurrences(of: "[^0-9]", with: "", options: .regularExpression)
        
        // Remove leading 0 if the user typed 078...
        if cleaned.hasPrefix("0") {
            cleaned.removeFirst()
        }
        
        if cleaned.hasPrefix("250") {
            return "+\(cleaned)"
        }
        return "+250\(cleaned)"
    }
}
