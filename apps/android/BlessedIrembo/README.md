# Blessed Irembo Android App

A Kotlin Android application for finding pharmacies across Rwanda, built with Jetpack Compose and Material Design 3.

## Features

- 🏥 Find pharmacies near you
- 📱 Modern Jetpack Compose UI
- 🎨 Material Design 3 theming
- 📍 Location-based pharmacy search (coming soon)
- 👤 User and Pharmacy owner registration

## Tech Stack

- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Navigation**: Navigation Compose
- **Design System**: Material Design 3
- **Architecture**: MVVM (ViewModel)
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)

## Project Structure

```
app/src/main/java/com/blessedirembo/app/
├── MainActivity.kt           # App entry point
├── BlessedIremboApp.kt       # Root composable
├── navigation/
│   └── NavGraph.kt           # Navigation configuration
├── ui/
│   ├── theme/
│   │   ├── Color.kt          # Color palette
│   │   ├── Theme.kt          # Material theme
│   │   └── Type.kt           # Typography
│   ├── components/
│   │   ├── CustomTextField.kt
│   │   ├── PrimaryButton.kt
│   │   └── RoleSelectionCard.kt
│   └── screens/
│       ├── SplashScreen.kt
│       ├── WelcomeScreen.kt
│       ├── UserSignUpScreen.kt
│       ├── PharmacyRegistrationScreen.kt
│       └── HomeScreen.kt
```

## Getting Started

### Prerequisites

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17 or later
- Android SDK 34

### Build & Run

1. Open the project in Android Studio
2. Sync Gradle files
3. Run on an emulator or physical device

```bash
./gradlew assembleDebug
```

## Screens

| Screen | Description |
|--------|-------------|
| Splash | App logo and branding on teal background |
| Welcome | Role selection (user vs pharmacy owner) |
| Sign Up | User registration form |
| Register | Pharmacy owner registration form |
| Home | Pharmacy finder with map access |

## License

Part of the Blessed Platform project.
