# Blessed Irembo - Coding Standards & Guidelines

## Overview

This document defines the coding standards for the Blessed Irembo platform across all development teams (Web, iOS, Android). Following these standards ensures consistency, maintainability, and code quality across the entire codebase.

## Core Principles

### 1. Code Quality
- Write production-level code from the start
- Prioritize readability over cleverness
- Keep functions and components small and focused
- Follow the Single Responsibility Principle

### 2. Documentation
- Write clear, concise comments
- Document WHY, not WHAT (code should be self-explanatory)
- Keep comments up-to-date with code changes
- NO emojis in code or comments

### 3. Consistency
- Follow platform-specific conventions (React for Web, Swift for iOS, Kotlin for Android)
- Use consistent naming conventions within each platform
- Maintain consistent file and folder structure
- Use the same architectural patterns across similar features

## Universal Standards (All Platforms)

### Naming Conventions

#### Variables & Functions
```
Web (TypeScript/JavaScript):
- camelCase for variables and functions
- Example: getUserData(), isPharmacyOpen, currentLocation

iOS (Swift):
- camelCase for variables and functions  
- Example: getUserData(), isPharmacyOpen, currentLocation

Android (Kotlin):
- camelCase for variables and functions
- Example: getUserData(), isPharmacyOpen, currentLocation
```

#### Classes & Components
```
Web (React/TypeScript):
- PascalCase for components
- Example: PharmacyCard, UserProfile, MapView

iOS (Swift):
- PascalCase for classes, structs, protocols
- Example: PharmacyCard, UserProfile, MapViewController

Android (Kotlin):
- PascalCase for classes
- Example: PharmacyCard, UserProfile, MapActivity
```

#### Constants
```
Web:
- UPPER_SNAKE_CASE for true constants
- Example: API_BASE_URL, MAX_RETRY_ATTEMPTS

iOS:
- camelCase or PascalCase (following Swift conventions)
- Example: apiBaseURL, maxRetryAttempts

Android:
- UPPER_SNAKE_CASE for constants
- Example: API_BASE_URL, MAX_RETRY_ATTEMPTS
```

### File Organization

#### Web Application
```
apps/web/blessed_irembo_web/
├── components/
│   ├── layout/         # Header, Footer, Navigation
│   ├── sections/       # Page sections (Hero, Features, etc.)
│   ├── ui/            # Reusable UI components (Button, Card, Input)
│   └── features/      # Feature-specific components
├── app/               # Next.js pages
├── lib/              # Utility functions, helpers
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── services/         # API calls and data fetching
└── constants/        # App constants
```

#### iOS Application
```
apps/ios/
├── Models/           # Data models
├── Views/            # SwiftUI views or UIKit views
├── ViewModels/       # View models (MVVM pattern)
├── Services/         # API services, location services
├── Utilities/        # Helper functions
├── Resources/        # Images, fonts, strings
└── Constants/        # App constants
```

#### Android Application
```
apps/android/
├── data/
│   ├── models/       # Data models
│   ├── repository/   # Repository pattern
│   └── api/          # API services
├── ui/
│   ├── screens/      # Activity/Fragment screens
│   ├── components/   # Reusable UI components
│   └── viewmodels/   # ViewModels (MVVM pattern)
├── utils/            # Utility functions
└── constants/        # App constants
```

### Comment Standards

#### File Headers
Every file should have a clear purpose statement:

```typescript
// Web Example
/**
 * PharmacyCard Component
 * 
 * Displays pharmacy information including name, location, contact details,
 * and availability status. Used in search results and pharmacy lists.
 */

// iOS Example
/// PharmacyCard View
///
/// Displays pharmacy information including name, location, contact details,
/// and availability status. Used in search results and pharmacy lists.

// Android Example
/**
 * PharmacyCard Component
 * 
 * Displays pharmacy information including name, location, contact details,
 * and availability status. Used in search results and pharmacy lists.
 */
```

#### Inline Comments
- Explain complex logic
- Document business rules
- Clarify non-obvious decisions
- NO obvious comments like "increment counter"

```typescript
// Good
// Check if pharmacy is open based on current time and day of week
// considering special holidays defined in the database
if (isPharmacyOpenNow(pharmacy, currentTime, holidays)) {
  // ...
}

// Bad
// Check if pharmacy is open
if (isPharmacyOpenNow(pharmacy, currentTime, holidays)) {
  // ...
}

// Very Bad
i++; // Increment i
```

### Code Formatting

#### Indentation
- Web: 2 spaces (configured in ESLint)
- iOS: 2 or 4 spaces (follow Xcode defaults)
- Android: 4 spaces (Kotlin standard)

#### Line Length
- Maximum 100 characters per line
- Break long lines for readability

#### Blank Lines
- One blank line between functions/methods
- Two blank lines between major sections
- No multiple consecutive blank lines

### Error Handling

#### Web (TypeScript)
```typescript
try {
  const pharmacy = await fetchPharmacyDetails(id);
  return pharmacy;
} catch (error) {
  // Log error with context for debugging
  console.error('Failed to fetch pharmacy details:', { id, error });
  
  // Show user-friendly message
  showErrorToast('Unable to load pharmacy details. Please try again.');
  
  return null;
}
```

#### iOS (Swift)
```swift
do {
  let pharmacy = try await fetchPharmacyDetails(id: id)
  return pharmacy
} catch {
  // Log error with context for debugging
  print("Failed to fetch pharmacy details: \(id), error: \(error)")
  
  // Show user-friendly message
  showErrorAlert("Unable to load pharmacy details. Please try again.")
  
  return nil
}
```

#### Android (Kotlin)
```kotlin
try {
  val pharmacy = fetchPharmacyDetails(id)
  return pharmacy
} catch (e: Exception) {
  // Log error with context for debugging
  Log.e(TAG, "Failed to fetch pharmacy details: $id", e)
  
  // Show user-friendly message
  showErrorSnackbar("Unable to load pharmacy details. Please try again.")
  
  return null
}
```

## Platform-Specific Standards

### Web (React/TypeScript/Next.js)

#### Component Structure
```typescript
import { useState } from 'react';
import type { Pharmacy } from '@/types';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  onSelect?: (id: string) => void;
}

/**
 * PharmacyCard Component
 * 
 * Displays pharmacy information in a card format.
 */
export default function PharmacyCard({ pharmacy, onSelect }: PharmacyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    onSelect?.(pharmacy.id);
  };

  return (
    <div onClick={handleClick}>
      {/* Component JSX */}
    </div>
  );
}
```

#### Hooks Usage
- Use built-in hooks appropriately
- Create custom hooks for reusable logic
- Prefix custom hooks with 'use'

```typescript
// Custom hook example
function usePharmacySearch(location: Location) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Hook logic...

  return { pharmacies, isLoading };
}
```

### iOS (Swift/SwiftUI)

#### View Structure
```swift
import SwiftUI

/// PharmacyCard View
///
/// Displays pharmacy information in a card format.
struct PharmacyCard: View {
    let pharmacy: Pharmacy
    var onSelect: ((String) -> Void)?
    
    @State private var isExpanded = false
    
    var body: some View {
        VStack {
            // View content
        }
        .onTapGesture {
            isExpanded.toggle()
            onSelect?(pharmacy.id)
        }
    }
}
```

#### Property Wrappers
- Use @State for local view state
- Use @Binding for parent-child communication
- Use @ObservedObject for ViewModels
- Use @EnvironmentObject for shared state

### Android (Kotlin/Jetpack Compose)

#### Composable Structure
```kotlin
import androidx.compose.runtime.*

/**
 * PharmacyCard Composable
 * 
 * Displays pharmacy information in a card format.
 */
@Composable
fun PharmacyCard(
    pharmacy: Pharmacy,
    onSelect: ((String) -> Unit)? = null
) {
    var isExpanded by remember { mutableStateOf(false) }
    
    Card(
        modifier = Modifier.clickable {
            isExpanded = !isExpanded
            onSelect?.invoke(pharmacy.id)
        }
    ) {
        // Composable content
    }
}
```

## Git Commit Standards

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes

### Examples
```
feat(web): add pharmacy search with map integration

Implemented pharmacy search functionality with Google Maps API.
Users can now search by location and view results on interactive map.

Closes #123

---

fix(ios): correct pharmacy availability calculation

Fixed bug where pharmacy hours were calculated in wrong timezone.
Now properly uses user's local timezone for availability check.

Fixes #456

---

docs(readme): update setup instructions for Android app

Added detailed steps for configuring Google Maps API key
and Firebase setup for Android development.
```

## Code Review Checklist

Before submitting code for review, ensure:

- [ ] Code follows platform-specific naming conventions
- [ ] All functions/methods have clear purposes
- [ ] Complex logic is commented
- [ ] No emojis in code or comments
- [ ] Error handling is implemented
- [ ] No console.log/print statements (use proper logging)
- [ ] No commented-out code
- [ ] File is properly formatted
- [ ] TypeScript/Swift/Kotlin types are defined
- [ ] No hardcoded values (use constants)
- [ ] Responsive design (Web) / Adaptive layout (Mobile)
- [ ] Accessibility considerations included

## Testing Standards

### Web
- Unit tests for utilities and helpers
- Component tests for UI components
- Integration tests for API calls
- E2E tests for critical user flows

### iOS
- Unit tests for ViewModels and business logic
- UI tests for critical user flows
- Test on multiple device sizes

### Android
- Unit tests for ViewModels and repositories
- UI tests for critical user flows
- Test on multiple device sizes and API levels

## Performance Standards

### Web
- Lazy load images and components
- Minimize bundle size
- Use React.memo for expensive components
- Debounce user input

### iOS
- Lazy load images
- Use proper list virtualization
- Minimize main thread work
- Cache network responses

### Android
- Use LazyColumn for lists
- Optimize image loading with Coil/Glide
- Use proper lifecycle awareness
- Cache network responses

## Security Standards

### All Platforms
- Never hardcode API keys or secrets
- Use environment variables
- Validate all user input
- Sanitize data before display
- Use HTTPS for all network calls
- Implement proper authentication
- Follow principle of least privilege

## Accessibility Standards

### Web
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Sufficient color contrast
- Responsive text sizing

### iOS
- VoiceOver support
- Dynamic Type support
- Sufficient color contrast
- Haptic feedback

### Android
- TalkBack support
- Content descriptions
- Sufficient color contrast
- Touch target sizes (48dp minimum)

## Questions or Updates?

This is a living document. If you have questions or suggestions for improvements, please:

1. Discuss in team meetings
2. Submit a pull request with proposed changes
3. Tag @team-leads for review

---

**Last Updated**: November 19, 2025
**Version**: 1.0.0
