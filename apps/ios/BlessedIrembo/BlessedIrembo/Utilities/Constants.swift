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
        static let splashDuration: Double = 2.0
        static let pageTransition: Double = 0.3
    }
    
    // MARK: - Onboarding Content
    enum Onboarding {
        static let pages = [
            OnboardingPage(
                title: "Welcome to Blessed Irembo",
                description: "Find trusted pharmacies anywhere in Rwanda. Access medication and healthcare services with ease.",
                systemImage: "map.fill"
            ),
            OnboardingPage(
                title: "Discover Nearby Pharmacies",
                description: "Search by location, check availability, and find the nearest pharmacy to you in seconds.",
                systemImage: "location.fill"
            ),
            OnboardingPage(
                title: "Connect Instantly",
                description: "Get in touch with pharmacies directly. Share your needs and receive prompt responses.",
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
    let title: String
    let description: String
    let systemImage: String
}
