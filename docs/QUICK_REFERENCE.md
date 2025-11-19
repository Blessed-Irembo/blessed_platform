# Quick Reference Card - Blessed Irembo Development

## For New Developers: Start Here

### First Time Setup
1. Read `README.md` in project root
2. Read `docs/CODING_STANDARDS.md`
3. Read `docs/AI_PROMPTS.md`
4. Setup your development environment
5. Clone repository and install dependencies

### Before You Code
- [ ] Understand the feature requirements
- [ ] Check if similar code exists
- [ ] Review coding standards for your platform
- [ ] Use appropriate AI prompt template

### While Coding
- [ ] Follow naming conventions
- [ ] Write clear comments (NO emojis)
- [ ] Handle errors properly
- [ ] Test as you go
- [ ] Commit regularly with good messages

### Before Pull Request
- [ ] Code follows standards
- [ ] No console.log/print statements
- [ ] No commented-out code
- [ ] Tests pass
- [ ] Code is formatted
- [ ] Documentation updated

---

## Quick AI Prompt (Copy & Paste)

### Web Development
```
Create a [ComponentName] for Blessed Irembo web app (Next.js 16, React 19, TypeScript, Tailwind CSS). 

Requirements:
- Production-level code
- Follow docs/CODING_STANDARDS.md
- No emojis in code/comments
- Responsive and accessible
- Clear comments explaining WHY

Purpose: [Describe what it does]
Props: [List props with types]
```

### iOS Development
```
Create a [ViewName] for Blessed Irembo iOS app (SwiftUI, MVVM).

Requirements:
- Production-level Swift code
- Follow docs/CODING_STANDARDS.md
- No emojis in comments
- Adaptive layout, accessible
- Clear documentation

Purpose: [Describe what it does]
Properties: [List with types]
```

### Android Development
```
Create a [ComposableName] for Blessed Irembo Android app (Kotlin, Jetpack Compose, Material3).

Requirements:
- Production-level Kotlin code
- Follow docs/CODING_STANDARDS.md
- No emojis in comments
- Responsive and accessible
- Clear KDoc documentation

Purpose: [Describe what it does]
Parameters: [List with types]
```

---

## Code Standards Cheat Sheet

### Naming Conventions

| Type | Web | iOS | Android |
|------|-----|-----|---------|
| Variables | camelCase | camelCase | camelCase |
| Functions | camelCase | camelCase | camelCase |
| Components/Classes | PascalCase | PascalCase | PascalCase |
| Constants | UPPER_SNAKE_CASE | camelCase | UPPER_SNAKE_CASE |
| Files | PascalCase.tsx | PascalCase.swift | PascalCase.kt |

### File Organization

**Web:**
```
components/
  layout/      # Header, Footer
  sections/    # Hero, Features
  ui/          # Button, Card
  features/    # Feature-specific
```

**iOS:**
```
Views/         # SwiftUI views
ViewModels/    # MVVM ViewModels
Services/      # API, Location
Models/        # Data models
```

**Android:**
```
ui/
  screens/     # Activities/Fragments
  components/  # Reusable composables
  viewmodels/  # ViewModels
data/
  models/      # Data models
  repository/  # Repositories
```

### Comment Examples

**Good:**
```typescript
// Calculate pharmacy availability based on current time and special holidays
// Business rule: Pharmacies closed on public holidays show as unavailable
const isAvailable = checkAvailability(pharmacy, currentTime, holidays);
```

**Bad:**
```typescript
// Check if available
const isAvailable = checkAvailability(pharmacy, currentTime, holidays);
```

**Very Bad:**
```typescript
// 😊 Check if pharmacy is open
const isAvailable = checkAvailability(pharmacy, currentTime, holidays);
```

---

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Formatting
- **refactor**: Code restructuring
- **test**: Tests
- **chore**: Maintenance

### Examples
```
feat(web): add pharmacy search with filters

Implemented search functionality allowing users to filter
pharmacies by name, location, and availability status.

Closes #123
```

```
fix(ios): correct timezone in availability check

Fixed bug where pharmacy hours used wrong timezone.
Now uses user's local timezone for accurate availability.

Fixes #456
```

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Teal | #0D9488 | Buttons, links, highlights |
| Gray 900 | #111827 | Primary text |
| Gray 600 | #4B5563 | Secondary text |
| Gray 50 | #F9FAFB | Backgrounds |
| White | #FFFFFF | Cards, surfaces |

### Tailwind (Web)
```tsx
className="bg-teal-600 text-white hover:bg-teal-700"
```

### SwiftUI (iOS)
```swift
.foregroundColor(Color(hex: "0D9488"))
```

### Compose (Android)
```kotlin
backgroundColor = Color(0xFF0D9488)
```

---

## Common Patterns

### Loading State

**Web:**
```typescript
const [isLoading, setIsLoading] = useState(false);

if (isLoading) return <LoadingSpinner />;
```

**iOS:**
```swift
@State private var isLoading = false

if isLoading {
    ProgressView()
}
```

**Android:**
```kotlin
var isLoading by remember { mutableStateOf(false) }

if (isLoading) {
    CircularProgressIndicator()
}
```

### Error Handling

**Web:**
```typescript
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error('Fetch failed:', { context, error });
  showErrorToast('Unable to load data');
  return null;
}
```

**iOS:**
```swift
do {
  let data = try await fetchData()
  return data
} catch {
  print("Fetch failed: \(error)")
  showErrorAlert("Unable to load data")
  return nil
}
```

**Android:**
```kotlin
try {
  val data = fetchData()
  return data
} catch (e: Exception) {
  Log.e(TAG, "Fetch failed", e)
  showErrorSnackbar("Unable to load data")
  return null
}
```

---

## Code Review Checklist

Before requesting review:
- [ ] Code follows platform conventions
- [ ] No emojis in code/comments
- [ ] Clear, helpful comments
- [ ] Error handling implemented
- [ ] No hardcoded values
- [ ] Responsive/adaptive design
- [ ] Accessibility considered
- [ ] Tests written/updated
- [ ] Documentation updated

When reviewing:
- [ ] Check adherence to standards
- [ ] Verify logic correctness
- [ ] Test functionality
- [ ] Suggest improvements kindly
- [ ] Approve or request changes

---

## Getting Help

### Documentation
1. `docs/CODING_STANDARDS.md` - Detailed standards
2. `docs/AI_PROMPTS.md` - AI assistant prompts
3. `docs/COLLABORATION_GUIDE.md` - Team workflow
4. Platform README - Setup instructions

### Ask Team
1. Check documentation first
2. Search Slack/Teams history
3. Ask in team chat
4. Pair with teammate
5. Bring to team meeting

### Useful Commands

**Web:**
```bash
cd apps/web/blessed_irembo_web
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
```

**iOS:**
```bash
cd apps/ios
open BlessedIrembo.xcodeproj  # Open in Xcode
```

**Android:**
```bash
cd apps/android
./gradlew build      # Build project
./gradlew test       # Run tests
```

---

## Remember

**The Three Rules:**
1. **No Emojis** in code or comments
2. **Production Quality** from day one
3. **Clear Comments** explain WHY, not WHAT

**When In Doubt:**
- Check the standards document
- Look at existing similar code
- Ask the team
- Use AI prompts as templates

---

**Keep This Card Handy!**

Print or bookmark this page for quick reference while coding.

---

**Last Updated**: November 19, 2025
