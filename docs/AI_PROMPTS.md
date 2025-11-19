# Development Prompts for AI-Assisted Coding

## Overview

These prompts are designed to help AI coding assistants (like GitHub Copilot, ChatGPT, Claude, etc.) generate code that follows Blessed Irembo's coding standards. Use these prompts as starting points and customize them for specific features.

## How to Use These Prompts

1. Copy the relevant prompt for your platform
2. Replace the placeholder text (in [brackets]) with your specific requirements
3. Paste into your AI assistant
4. Review and adjust the generated code to match our standards

---

## Web Development Prompts (React/TypeScript/Next.js)

### Creating a New Component

```
Create a production-level React component for the Blessed Irembo web application following these requirements:

Component Name: [ComponentName]
Purpose: [Brief description of what the component does]
Location: apps/web/blessed_irembo_web/components/[folder]/[ComponentName].tsx

Requirements:
- Use TypeScript with proper type definitions
- Follow Next.js 16 and React 19 best practices
- Use Tailwind CSS for styling (no inline styles)
- Include comprehensive JSDoc comments (no emojis)
- Make it fully responsive (mobile-first design)
- Include proper accessibility attributes
- Use semantic HTML elements
- Handle loading and error states
- Props interface should be clearly defined

Props needed:
[List the props with types]

Behavior:
[Describe how the component should work]

Styling:
- Use teal (#0D9488) as primary color
- Follow existing design patterns from Header and Footer components
- Maintain consistent spacing and typography

Code Standards:
- 2 space indentation
- Clear, concise comments explaining WHY not WHAT
- No emojis in code or comments
- Max line length: 100 characters
- Use descriptive variable names
```

### Creating an API Service

```
Create a production-level API service function for the Blessed Irembo web application:

Service Name: [serviceName]
Purpose: [What data does this fetch/mutate]
Location: apps/web/blessed_irembo_web/services/[serviceName].ts

Requirements:
- Use TypeScript with proper return types
- Include error handling with try-catch
- Add loading states where appropriate
- Use fetch or axios (specify preference)
- Include proper JSDoc documentation
- Handle network errors gracefully
- Return user-friendly error messages
- Use environment variables for API endpoints

API Details:
- Endpoint: [URL endpoint]
- Method: [GET/POST/PUT/DELETE]
- Request body: [describe payload if applicable]
- Response type: [describe expected response]

Error Handling:
- Log errors with context for debugging
- Show user-friendly messages
- Don't expose sensitive error details to users

Code Standards:
- Follow Blessed Irembo coding standards
- No emojis in comments
- Clear, production-ready code
```

### Creating a Custom Hook

```
Create a custom React hook for the Blessed Irembo web application:

Hook Name: use[HookName]
Purpose: [What reusable logic does this hook encapsulate]
Location: apps/web/blessed_irembo_web/hooks/use[HookName].ts

Requirements:
- Use TypeScript with proper types
- Follow React hooks best practices
- Include cleanup in useEffect if needed
- Handle edge cases
- Add comprehensive JSDoc comments
- Return object with clear, descriptive keys

Hook Logic:
[Describe what the hook should do]

Parameters:
[List parameters with types]

Return Value:
[Describe what the hook returns]

Code Standards:
- Follow Blessed Irembo coding standards
- No emojis
- Production-level code quality
```

---

## iOS Development Prompts (Swift/SwiftUI)

### Creating a SwiftUI View

```
Create a production-level SwiftUI view for the Blessed Irembo iOS application:

View Name: [ViewName]
Purpose: [Brief description of the view]
Location: apps/ios/Views/[ViewName].swift

Requirements:
- Use SwiftUI with iOS 15+ compatibility
- Follow MVVM architecture pattern
- Include comprehensive documentation comments
- Make it adaptive for different device sizes
- Include proper accessibility labels
- Handle loading and error states
- Use @State, @Binding, @ObservedObject appropriately

Properties:
[List properties with types]

Layout:
[Describe the view layout]

Behavior:
[Describe interactions and state changes]

Styling:
- Use teal (Color(hex: "0D9488")) as primary color
- Follow iOS Human Interface Guidelines
- Maintain consistent spacing and typography

Code Standards:
- Clear, concise comments (no emojis)
- Follow Swift naming conventions
- Production-ready code
- Handle edge cases
```

### Creating a ViewModel

```
Create a ViewModel for the Blessed Irembo iOS application:

ViewModel Name: [ViewModelName]
Purpose: [What business logic does this handle]
Location: apps/ios/ViewModels/[ViewModelName].swift

Requirements:
- Conform to ObservableObject protocol
- Use @Published for state properties
- Include error handling
- Use async/await for network calls
- Add comprehensive documentation
- Follow MVVM pattern strictly

Properties:
[List @Published properties]

Methods:
[Describe main methods and their responsibilities]

API Integration:
[Describe any API calls this ViewModel handles]

Code Standards:
- Follow Blessed Irembo coding standards
- No emojis in comments
- Production-level Swift code
- Proper error handling
```

### Creating a Service

```
Create an API service for the Blessed Irembo iOS application:

Service Name: [ServiceName]
Purpose: [What data operations does this service handle]
Location: apps/ios/Services/[ServiceName].swift

Requirements:
- Use async/await for asynchronous operations
- Include proper error handling with custom error types
- Use URLSession or Alamofire (specify preference)
- Add comprehensive documentation
- Return strongly-typed models
- Handle network errors gracefully

API Details:
- Endpoint: [URL endpoint]
- Method: [GET/POST/PUT/DELETE]
- Request model: [describe if applicable]
- Response model: [describe expected model]

Code Standards:
- Follow Blessed Irembo coding standards
- Production-ready code
- No emojis
- Clear error messages
```

---

## Android Development Prompts (Kotlin/Jetpack Compose)

### Creating a Composable

```
Create a production-level Composable for the Blessed Irembo Android application:

Composable Name: [ComposableName]
Purpose: [Brief description of the composable]
Location: apps/android/ui/components/[ComposableName].kt

Requirements:
- Use Jetpack Compose with Material3
- Follow MVVM architecture pattern
- Include KDoc documentation
- Make it adaptive for different screen sizes
- Include proper content descriptions for accessibility
- Handle loading and error states
- Use remember and mutableStateOf appropriately

Parameters:
[List parameters with types]

Layout:
[Describe the composable layout]

Behavior:
[Describe interactions and state changes]

Styling:
- Use teal (Color(0xFF0D9488)) as primary color
- Follow Material Design 3 guidelines
- Maintain consistent spacing and typography

Code Standards:
- 4 space indentation
- Clear, concise comments (no emojis)
- Follow Kotlin naming conventions
- Production-ready code
```

### Creating a ViewModel

```
Create a ViewModel for the Blessed Irembo Android application:

ViewModel Name: [ViewModelName]
Purpose: [What business logic does this handle]
Location: apps/android/ui/viewmodels/[ViewModelName].kt

Requirements:
- Extend ViewModel class
- Use StateFlow or LiveData for state
- Include error handling
- Use Coroutines for async operations
- Add comprehensive KDoc documentation
- Follow MVVM pattern

State Properties:
[List state properties with types]

Methods:
[Describe main methods and responsibilities]

Repository Integration:
[Describe any repository calls]

Code Standards:
- Follow Blessed Irembo coding standards
- No emojis in comments
- Production-level Kotlin code
- Proper coroutine scoping
```

### Creating a Repository

```
Create a Repository for the Blessed Irembo Android application:

Repository Name: [RepositoryName]
Purpose: [What data operations does this repository handle]
Location: apps/android/data/repository/[RepositoryName].kt

Requirements:
- Follow Repository pattern
- Use Kotlin Coroutines for async operations
- Include proper error handling
- Use Retrofit for API calls (or specify alternative)
- Add comprehensive KDoc documentation
- Cache data when appropriate
- Return Result<T> or similar wrapper

Data Sources:
- Remote: [describe API endpoints]
- Local: [describe any local caching]

Methods:
[Describe main methods]

Code Standards:
- Follow Blessed Irembo coding standards
- Production-ready code
- No emojis
- Handle all error cases
```

---

## Shared Backend Prompts (Node.js/TypeScript)

### Creating an API Endpoint

```
Create a production-level API endpoint for the Blessed Irembo backend:

Endpoint: [HTTP method] /api/[path]
Purpose: [What does this endpoint do]
Location: backend/api/[controller].ts

Requirements:
- Use TypeScript with Express.js
- Include input validation
- Add error handling middleware
- Use async/await for database operations
- Include comprehensive JSDoc comments
- Return consistent response format
- Add authentication/authorization if needed

Request:
- Method: [GET/POST/PUT/DELETE]
- Body/Query params: [describe]
- Headers: [describe if needed]

Response:
- Success: [describe success response]
- Error: [describe error responses]

Database:
[Describe any database operations]

Validation:
[Describe input validation rules]

Code Standards:
- Follow Blessed Irembo coding standards
- No emojis
- Production-ready code
- Proper error handling
```

### Creating a Service Function

```
Create a service function for the Blessed Irembo backend:

Service Name: [serviceName]
Purpose: [What business logic does this handle]
Location: backend/services/[serviceName].ts

Requirements:
- Use TypeScript with proper types
- Include error handling
- Use async/await for async operations
- Add comprehensive JSDoc documentation
- Follow single responsibility principle
- Return strongly-typed results

Function Details:
- Input parameters: [describe]
- Return type: [describe]
- Side effects: [describe any]

Database Operations:
[Describe any database interactions]

Business Logic:
[Describe the core logic]

Code Standards:
- Follow Blessed Irembo coding standards
- No emojis
- Production-level code
- Clear error messages
```

---

## General AI Assistant Configuration

When starting a new coding session, provide this context to your AI assistant:

```
You are helping develop the Blessed Irembo platform, a pharmacy locator application for Rwanda. The platform consists of:
- Web app (Next.js 16, React 19, TypeScript, Tailwind CSS)
- iOS app (Swift, SwiftUI)
- Android app (Kotlin, Jetpack Compose)
- Backend (Node.js, TypeScript, Express)

Key Coding Standards:
1. Write production-level code with clear, concise comments
2. NO emojis in code or comments
3. Follow platform-specific naming conventions
4. Include proper error handling
5. Make code responsive/adaptive
6. Include accessibility features
7. Use TypeScript/Swift/Kotlin types strictly
8. Follow MVVM pattern for mobile apps
9. Use teal (#0D9488) as primary brand color
10. Write self-documenting code with comments explaining WHY

For detailed standards, refer to: docs/CODING_STANDARDS.md

Generate code that is:
- Clean and readable
- Well-documented
- Production-ready
- Following best practices
- Consistent with existing codebase
```

---

## Tips for Effective AI Collaboration

### 1. Be Specific
Instead of: "Create a button"
Use: "Create a reusable Button component with primary and secondary variants, loading state, and icon support"

### 2. Provide Context
Always mention:
- What you're building (feature name)
- Where it fits in the app
- What existing patterns to follow

### 3. Request Standards Compliance
Always add: "Follow Blessed Irembo coding standards from docs/CODING_STANDARDS.md"

### 4. Iterative Refinement
- Start with basic functionality
- Review and test
- Request improvements incrementally
- Don't try to build everything at once

### 5. Ask for Explanations
Request: "Explain your approach and any important decisions made in the code"

---

## Platform-Specific Quick Prompts

### Web (Quick Component)
```
Create a [ComponentName] React component for Blessed Irembo web app. TypeScript, Tailwind CSS, responsive, accessible, production-ready. Follow coding standards in docs/CODING_STANDARDS.md. No emojis.
```

### iOS (Quick View)
```
Create a [ViewName] SwiftUI view for Blessed Irembo iOS app. MVVM pattern, adaptive layout, accessible, production-ready. Follow coding standards. No emojis.
```

### Android (Quick Composable)
```
Create a [ComposableName] Composable for Blessed Irembo Android app. Jetpack Compose, Material3, MVVM pattern, accessible, production-ready. Follow coding standards. No emojis.
```

---

**Last Updated**: November 19, 2025
**Version**: 1.0.0
