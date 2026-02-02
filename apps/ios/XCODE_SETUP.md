# Xcode Project Setup Guide

## Quick Start (Without Xcode Project File)

Since we created the Swift files without an Xcode project, you'll need to create one:

### Option 1: Create New Project in Xcode

1. **Open Xcode**

   - Launch Xcode 15+

2. **Create New Project**

   - File → New → Project
   - Select "iOS" → "App"
   - Click "Next"

3. **Configure Project**

   - **Product Name**: `BlessedIrembo`
   - **Team**: Select your team
   - **Organization Identifier**: `rw.blessedirembo` (or your domain)
   - **Interface**: SwiftUI
   - **Language**: Swift
   - **Storage**: None
   - **Include Tests**: Optional
   - Click "Next"

4. **Save Location**

   - Navigate to: `blessed_platform/apps/ios/`
   - Click "Create"

5. **Add Existing Files**

   - Delete the default `ContentView.swift` and `BlessedIremboApp.swift`
   - Drag all folders from `BlessedIrembo/` into Xcode project navigator:
     - App/
     - Models/
     - ViewModels/
     - Views/
     - Utilities/
   - Check "Copy items if needed"
   - Select "Create groups"
   - Click "Finish"

6. **Add Logo Assets**
   - Open `Assets.xcassets`
   - Drag `logo1.png` and `logo2.png` into Assets
   - Ensure names are exactly "logo1" and "logo2"

### Option 2: Use Command Line (Advanced)

```bash
cd apps/ios

# Create Xcode project using SwiftPM
swift package init --type executable --name BlessedIrembo

# Then open in Xcode and configure as above
```

---

## Post-Setup Configuration

### 1. Set Deployment Target

- Select project in navigator
- Under "Deployment Info"
- Set minimum to **iOS 15.0**

### 2. Configure Info.plist (if needed)

Add these keys if using location services later:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to find nearby pharmacies</string>
```

### 3. App Icons (Optional for now)

- Add app icons to `Assets.xcassets/AppIcon`
- Use 1024x1024 icon for all sizes

---

## File Organization in Xcode

Your project navigator should look like:

```
BlessedIrembo
├── App
│   ├── BlessedIremboApp.swift
│   └── AppState.swift
├── Models
│   ├── User.swift
│   └── Pharmacy.swift
├── ViewModels
│   ├── OnboardingViewModel.swift
│   └── AuthViewModel.swift
├── Views
│   ├── Components
│   │   ├── PrimaryButton.swift
│   │   ├── SecondaryButton.swift
│   │   ├── CustomTextField.swift
│   │   └── Logo.swift
│   ├── Splash
│   │   └── SplashView.swift
│   ├── Onboarding
│   │   ├── OnboardingContainerView.swift
│   │   ├── OnboardingPageView.swift
│   │   └── PageIndicator.swift
│   ├── RoleSelection
│   │   └── RoleSelectionView.swift
│   └── Auth
│       ├── SignInView.swift
│       ├── SignUpUserView.swift
│       └── SignUpPharmacyView.swift
├── Utilities
│   ├── Constants.swift
│   ├── ColorExtension.swift
│   └── UserDefaultsKeys.swift
└── Assets.xcassets
    ├── logo1
    └── logo2
```

---

## Build & Run

1. **Select Target**

   - Choose iPhone 15 simulator (or any device)

2. **Build**

   - Press ⌘B or Product → Build

3. **Run**

   - Press ⌘R or Product → Run

4. **Test Flow**
   - Splash screen appears
   - Onboarding shows (3 pages)
   - Role selection appears
   - Try signing up/in

---

## Troubleshooting

### "Cannot find type in scope" errors

**Solution**: Make sure all files are added to the target

- Select file in navigator
- Check "Target Membership" in File Inspector (⌥⌘1)
- Ensure "BlessedIrembo" is checked

### Logo not showing

**Solution**: Verify logo names

- Logo file must be named exactly "logo1" (not "logo1.png")
- Check in Assets.xcassets

### Build fails with linker errors

**Solution**: Clean build folder

- Product → Clean Build Folder (⇧⌘K)
- Rebuild (⌘B)

### Simulator issues

**Solution**: Reset simulator

- Simulator → Device → Erase All Content and Settings

---

## Next Steps After Setup

1. **Run Initial Build** - Verify everything compiles
2. **Test Onboarding** - Complete full flow
3. **Reset and Test Again** - Clear onboarding to test again
4. **Add Backend Integration** - Connect to real API
5. **Add Main Features** - Build pharmacy search, map, etc.

---

## Tips

- Use **Live Preview** for faster development (Canvas button in Xcode)
- Enable **Debug Preview** to test ViewModels
- Use **Instruments** to profile performance
- Test on physical device for real performance

---

**Need Help?**

- Check Xcode documentation
- Review project README.md
- Contact development team
