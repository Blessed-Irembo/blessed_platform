/// UserDefaults Keys
///
/// Centralized keys for UserDefaults storage to maintain consistency
/// and avoid typos throughout the application.

import Foundation

enum UserDefaultsKeys {
    static let hasCompletedOnboarding = "hasCompletedOnboarding"
    static let isAuthenticated = "isAuthenticated"
    static let userToken = "userToken"
    static let userType = "userType" // "user" or "pharmacy"
    static let rememberedEmail = "rememberedEmail"
    static let selectedLanguage = "selectedLanguage"
}
