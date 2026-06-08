/// Application Constants
///
/// Centralized constants for the Blessed Irembo application including
/// colors, dimensions, strings, and configuration values.

import Foundation

enum Constants {
    
    // MARK: - Color Hex Values
    enum Colors {
        static let primaryTeal = "0D9488"
        static let textPrimary = "111827"
        static let textSecondary = "4B5563"
        static let backgroundLight = "F9FAFB"
        static let white = "FFFFFF"
    }
    
    // MARK: - Dimensions
    enum Dimensions {
        static let cornerRadius: CGFloat = 12
        static let buttonHeight: CGFloat = 56
        static let spacing: CGFloat = 16
        static let largeSpacing: CGFloat = 24
        static let padding: CGFloat = 20
    }
    
    // MARK: - Animation
    enum Animation {
        static let pageTransition: Double = 0.3
    }
    
    // MARK: - Onboarding Content
    enum Onboarding {
        static let pages = [
            OnboardingPage(
                titleKey: "onboarding.page1.title",
                descriptionKey: "onboarding.page1.desc",
                systemImage: "map.fill"
            ),
            OnboardingPage(
                titleKey: "onboarding.page2.title",
                descriptionKey: "onboarding.page2.desc",
                systemImage: "location.fill"
            ),
            OnboardingPage(
                titleKey: "onboarding.page3.title",
                descriptionKey: "onboarding.page3.desc",
                systemImage: "phone.fill"
            )
        ]
    }
    
    // MARK: - API Configuration
    enum API {
        static let baseURL = "https://api.blessedirembo.rw"
        static let timeout: TimeInterval = 30
    }
}

/// Onboarding page data model
struct OnboardingPage {
    let titleKey: String
    let descriptionKey: String
    let systemImage: String
}
