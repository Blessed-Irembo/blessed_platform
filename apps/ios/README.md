# Blessed Irembo iOS Application

## Overview

Native iOS application for Blessed Irembo pharmacy locator platform, built with SwiftUI following MVVM architecture and the project's coding standards.

## Features

### ✅ Implemented

- **Splash Screen** - Animated logo with 2-second display
- **Onboarding Flow** - 3 swipeable pages with skip/next navigation
- **Role Selection** - Choose between User or Pharmacy signup
- **User Sign Up** - Full name, email, phone, password with validation
- **Pharmacy Sign Up** - Business info, license number, address with validation
- **Sign In** - Universal login with remember me functionality
- **Form Validation** - Email, phone number, and password validation
- **State Management** - Centralized app state with UserDefaults persistence

### 📱 User Flow

1. **First Launch**: Splash → Onboarding (3 pages) → Role Selection → Sign Up/In
2. **Subsequent Launches**: Splash → Role Selection → Sign Up/In (onboarding skipped)
3. **After Sign In**: Main app (coming soon)

## Technical Stack

- **Language**: Swift
- **UI Framework**: SwiftUI
- **Architecture**: MVVM (Model-View-ViewModel)
- **Minimum iOS**: 15.0+
- **Dependencies**: None (pure Swift/SwiftUI)

## Project Structure

```
BlessedIrembo/
├── App/
│   ├── BlessedIremboApp.swift          # App entry point
│   └── AppState.swift                   # Global state management
├── Models/
│   ├── User.swift                       # User data model
│   └── Pharmacy.swift                   # Pharmacy data model
├── ViewModels/
│   ├── OnboardingViewModel.swift        # Onboarding logic
│   └── AuthViewModel.swift              # Authentication logic
├── Views/
│   ├── Components/                      # Reusable UI components
│   │   ├── PrimaryButton.swift
│   │   ├── SecondaryButton.swift
│   │   ├── CustomTextField.swift
│   │   └── Logo.swift
│   ├── Splash/
│   │   └── SplashView.swift            # Splash screen
│   ├── Onboarding/
│   │   ├── OnboardingContainerView.swift
│   │   ├── OnboardingPageView.swift
│   │   └── PageIndicator.swift
│   ├── RoleSelection/
│   │   └── RoleSelectionView.swift     # User vs Pharmacy choice
│   └── Auth/
│       ├── SignUpUserView.swift
│       ├── SignUpPharmacyView.swift
│       └── SignInView.swift
└── Utilities/
    ├── Constants.swift                  # App constants
    ├── ColorExtension.swift             # Color utilities
    └── UserDefaultsKeys.swift           # Storage constants
```

## Design System

### Colors (Matching Web App)

- **Primary Teal**: `#0D9488`
- **Text Primary**: `#111827`
- **Text Secondary**: `#4B5563`
- **Background Light**: `#F9FAFB`

### Typography

- **Titles**: System Bold, 28-32pt
- **Body**: System Regular, 16pt
- **Captions**: System Regular, 12-14pt

### Components

- **Corner Radius**: 12pt
- **Button Height**: 56pt
- **Spacing**: 16pt standard, 24pt large
- **Padding**: 20pt

## Getting Started

### Prerequisites

- Xcode 15.0 or later
- macOS Ventura or later
- iOS 15.0+ deployment target

### Setup

1. **Open Project in Xcode**

   ```bash
   cd apps/ios
   open BlessedIrembo.xcodeproj
   ```

2. **Add Logo Assets**

   - Drag `logo1.png` and `logo2.png` to Assets.xcassets
   - Ensure images are named "logo1" and "logo2"

3. **Configure Signing**

   - Select BlessedIrembo target
   - Go to "Signing & Capabilities"
   - Select your development team

4. **Build and Run**
   - Select target device/simulator
   - Press ⌘R or click Run

### Development Tips

```swift
// Reset onboarding for testing
let appState = AppState()
appState.resetOnboarding()

// Test different user flows
// 1. Fresh install → Full onboarding
// 2. Returning user → Skip to role selection
```

## Validation Rules

### Email

- Must be valid email format
- Example: `user@example.com`

### Phone Number (Rwanda)

- Format: `+250XXXXXXXXX` or `250XXXXXXXXX`
- Automatically normalized to `+250` format

### Password

- Minimum 8 characters
- Must match confirmation

### Pharmacy License

- Alphanumeric with hyphens
- 5-50 characters
- Automatically uppercased
- Example: `RX-12345-A`

## State Management

### App State

```swift
@EnvironmentObject var appState: AppState

// States
appState.isLoading           // Splash screen active
appState.hasCompletedOnboarding  // Onboarding done
appState.isAuthenticated     // User signed in
appState.currentUser         // Signed in user
appState.currentPharmacy     // Signed in pharmacy

// Actions
appState.completeOnboarding()
appState.signIn(user: user)
appState.signIn(pharmacy: pharmacy)
appState.signOut()
```

### Persistence

- **Onboarding Completion**: Stored in UserDefaults
- **Remember Me Email**: Stored in UserDefaults
- **Authentication Token**: Will be stored securely (Keychain)

## Next Steps

### Immediate (Coming Soon)

1. **Main App Interface**

   - Home screen with pharmacy search
   - Map integration with Google Maps
   - Pharmacy list and detail views
   - User profile screen

2. **Backend Integration**

   - Replace mock API calls with real endpoints
   - Implement authentication tokens
   - Add error handling for network issues

3. **Additional Features**
   - Location services integration
   - Push notifications
   - Pharmacy ratings & reviews
   - In-app messaging

### Future Enhancements

- Biometric authentication (Face ID/Touch ID)
- Offline mode with local caching
- Multi-language support (Kinyarwanda, French)
- Accessibility improvements
- Dark mode support

## Coding Standards

### Followed Conventions

✅ **No emojis** in code or comments  
✅ **MVVM architecture** strictly followed  
✅ **Clear documentation** with purpose explanations  
✅ **Consistent naming** (camelCase for variables, PascalCase for types)  
✅ **Production-level code** from the start  
✅ **Proper error handling** in ViewModels  
✅ **Validation** for all user inputs  
✅ **Reusable components** for consistency

### Example Code Pattern

```swift
/// Component Title
///
/// Clear documentation explaining purpose and usage.
/// No obvious comments, focus on WHY not WHAT.

import SwiftUI

struct MyView: View {
    // State and environment
    @StateObject private var viewModel = MyViewModel()
    @EnvironmentObject var appState: AppState

    var body: some View {
        // UI implementation
    }

    // MARK: - Private Methods

    private func handleAction() {
        // Business logic delegated to ViewModel
    }
}
```

## Testing

### Manual Testing Checklist

- [ ] Splash screen displays correctly
- [ ] Onboarding pages swipe smoothly
- [ ] Skip button navigates to last page
- [ ] Onboarding completion persists
- [ ] Role cards navigate correctly
- [ ] User signup validation works
- [ ] Pharmacy signup validation works
- [ ] Sign in remembers email
- [ ] Password visibility toggle works
- [ ] Navigation back button works

### Test Accounts

For demo/testing purposes:

- **User Email**: `demo@example.com`
- **Password**: `password123`

## Known Limitations

- **API Integration**: Currently using mock data
- **Geolocation**: Pharmacy signup uses hardcoded Kigali coordinates
- **Image Assets**: Onboarding uses SF Symbols instead of custom illustrations
- **Authentication**: No actual backend validation yet

## Contributing

1. Follow the coding standards in `docs/CODING_STANDARDS.md`
2. Use AI prompts from `docs/AI_PROMPTS.md`
3. Test on multiple device sizes before committing
4. Update this README if adding new features

## Resources

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui/)
- [MVVM Pattern Guide](https://www.hackingwithswift.com/books/ios-swiftui/introducing-mvvm-into-your-swiftui-project)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Project Coding Standards](../../docs/CODING_STANDARDS.md)

## Support

For questions or issues:

- Check project documentation in `/docs`
- Contact development team
- Review coding standards

---

**Built with ❤️ for Rwanda's healthcare access**

**Version**: 1.0.0  
**Last Updated**: December 15, 2024  
**Platform**: iOS 15.0+
