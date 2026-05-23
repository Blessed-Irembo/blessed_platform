/// Supported Languages
///
/// Enum defining the supported languages in the Blessed Irembo application.
/// Provides helper properties for display names and system integration.

import Foundation

enum Language: String, CaseIterable, Identifiable {
    case english = "en"
    case kinyarwanda = "rw"
    
    var id: String { self.rawValue }
    
    var code: String { self.rawValue }
    
    var displayName: String {
        switch self {
        case .english: return "EN"
        case .kinyarwanda: return "RW"
        }
    }
    
    var fullName: String {
        switch self {
        case .english: return "English"
        case .kinyarwanda: return "Kinyarwanda"
        }
    }
}
