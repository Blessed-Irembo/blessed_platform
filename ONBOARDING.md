# Welcome to Blessed Irembo Development Team!

Welcome! This document will get you started on the Blessed Irembo platform. Please read this carefully before writing any code.

## 🎯 Project Overview

**Blessed Irembo** is a pharmacy locator platform connecting Rwandans with verified pharmacies nationwide. We're building:
- **Web Application** (Next.js, React, TypeScript, Tailwind CSS)
- **iOS Application** (Swift, SwiftUI)
- **Android Application** (Kotlin, Jetpack Compose)
- **Backend API** (Node.js, TypeScript, Express)

## 📋 Getting Started Checklist

### Day 1: Essential Reading (2-3 hours)

- [ ] Read this ONBOARDING.md file completely
- [ ] Read `/docs/README.md` - Documentation overview
- [ ] Read `/docs/CODING_STANDARDS.md` - **CRITICAL: Read your platform sections**
- [ ] Bookmark `/docs/QUICK_REFERENCE.md` - Your daily coding companion
- [ ] Read `/docs/AI_PROMPTS.md` - How to use AI assistants effectively
- [ ] Read project README.md in root directory

### Day 1: Setup Your Environment

**For Web Developers:**
```bash
# Navigate to web app
cd apps/web/blessed_irembo_web

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

**For iOS Developers:**
```bash
# Navigate to iOS app (when development starts)
cd apps/ios

# Open in Xcode
open BlessedIrembo.xcodeproj

# Note: iOS development will begin after web foundation is complete
```

**For Android Developers:**
```bash
# Navigate to Android app (when development starts)
cd apps/android

# Open in Android Studio
# File > Open > Select android folder

# Note: Android development will begin after web foundation is complete
```

**For Backend Developers:**
```bash
# Navigate to backend (when development starts)
cd backend

# Setup will be provided when backend development begins
```

### Day 1: Configure Your Tools

**Configure Your AI Assistant (ChatGPT, Copilot, Claude, etc.):**

Copy and paste this into your AI assistant:

```
You are helping me develop the Blessed Irembo platform, a pharmacy locator application for Rwanda.

My role: [Web/iOS/Android/Backend] Developer

Platform Details:
- Web: Next.js 16, React 19, TypeScript, Tailwind CSS
- iOS: Swift, SwiftUI, MVVM pattern
- Android: Kotlin, Jetpack Compose, Material3
- Backend: Node.js, TypeScript, Express

CRITICAL RULES:
1. NO emojis in code or comments
2. Write production-level code only
3. Follow coding standards in docs/CODING_STANDARDS.md
4. Use prompts from docs/AI_PROMPTS.md as templates
5. Clear, concise comments explaining WHY, not WHAT
6. Proper error handling always
7. Type-safe code (TypeScript/Swift/Kotlin)
8. Responsive/adaptive design
9. Accessibility built-in
10. Follow platform-specific best practices

When generating code:
- Use teal (#0D9488) as primary color
- Follow existing patterns in the codebase
- Include proper documentation
- Handle edge cases
- Write self-documenting code

Always check docs/CODING_STANDARDS.md before generating code.
```

## 🚨 CRITICAL: Must-Follow Rules

### 1. NO EMOJIS
- ❌ NEVER use emojis in code or comments
- ✅ Use clear, professional language
```typescript
// Bad: 🚀 Launch the app
// Good: Initialize application startup sequence
```

### 2. Production-Level Code Only
- Write code as if it's going to production today
- No placeholder code or TODOs without implementation plan
- No console.log/print statements in production code
- Proper error handling from the start

### 3. Follow Coding Standards
- Read `/docs/CODING_STANDARDS.md` for your platform
- Use correct naming conventions
- Follow file organization patterns
- Write meaningful comments

### 4. Use AI Prompts
- Don't freestyle with AI assistants
- Use templates from `/docs/AI_PROMPTS.md`
- Modify prompts for your specific needs
- Share effective prompts with the team

### 5. Code Review Requirements
Before submitting ANY pull request:
- [ ] Code follows platform naming conventions
- [ ] No emojis in code or comments
- [ ] Clear, helpful comments
- [ ] Proper error handling
- [ ] No hardcoded values (use constants)
- [ ] Responsive/adaptive design
- [ ] Accessibility considered
- [ ] Tests written/updated
- [ ] Documentation updated
- [ ] Ran locally and tested
- [ ] No console.log/print statements

## 📁 Project Structure

```
blessed_platform/
├── apps/
│   ├── web/blessed_irembo_web/    # Web application (ACTIVE)
│   ├── ios/                        # iOS app (Coming soon)
│   └── android/                    # Android app (Coming soon)
├── backend/                        # Backend API (Coming soon)
├── packages/                       # Shared code
├── docs/                          # Documentation (READ THIS!)
│   ├── README.md                  # Start here
│   ├── CODING_STANDARDS.md        # Critical reading
│   ├── AI_PROMPTS.md              # AI assistant templates
│   ├── COLLABORATION_GUIDE.md     # Team workflow
│   └── QUICK_REFERENCE.md         # Daily cheat sheet
└── README.md                       # Project overview
```

## 🎨 Design Standards

### Colors
```
Primary Teal:    #0D9488
Gray 900:        #111827 (Primary text)
Gray 600:        #4B5563 (Secondary text)
Gray 50:         #F9FAFB (Backgrounds)
White:           #FFFFFF (Cards, surfaces)
```

### Using Colors in Code

**Web (Tailwind CSS):**
```tsx
<button className="bg-teal-600 text-white hover:bg-teal-700">
  Click Me
</button>
```

**iOS (SwiftUI):**
```swift
Text("Hello")
    .foregroundColor(Color(hex: "0D9488"))
```

**Android (Compose):**
```kotlin
Text(
    "Hello",
    color = Color(0xFF0D9488)
)
```

## 🔧 Development Workflow

### 1. Before Starting a Feature

1. Understand requirements completely
2. Check if similar code exists
3. Review coding standards for your platform
4. Choose appropriate AI prompt template
5. Plan your approach

### 2. While Coding

1. Use AI prompts from `/docs/AI_PROMPTS.md`
2. Follow naming conventions
3. Write clear comments (NO emojis)
4. Handle errors properly
5. Test as you go
6. Commit regularly with good messages

### 3. Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```bash
git commit -m "feat(web): add pharmacy search with map integration

Implemented pharmacy search functionality with Google Maps API.
Users can search by location and view results on interactive map.

Closes #123"

git commit -m "fix(ios): correct timezone in availability check

Fixed bug where pharmacy hours used wrong timezone.
Now uses user's local timezone.

Fixes #456"
```

### 4. Pull Request Process

1. Create feature branch: `feat/platform-feature-name`
   ```bash
   git checkout -b feat/web-pharmacy-search
   ```

2. Make your changes and commit

3. Push to GitHub
   ```bash
   git push origin feat/web-pharmacy-search
   ```

4. Create Pull Request on GitHub

5. Request review from team member

6. Address feedback

7. Get approval and merge

## 🤝 Team Collaboration

### Communication Channels

**Daily:**
- Slack/Teams: Quick questions, updates
- GitHub Issues: Bug reports, features
- PR Comments: Code discussions

**Weekly:**
- Team Standup: Progress, blockers
- Cross-Platform Sync: Consistency check

**Monthly:**
- Sprint Planning: Upcoming features
- Retrospective: Improvements

### Getting Help

1. **Check documentation first**
   - `/docs/CODING_STANDARDS.md`
   - `/docs/QUICK_REFERENCE.md`
   - `/docs/AI_PROMPTS.md`

2. **Search Slack/Teams history**

3. **Ask in team chat**

4. **Pair with teammate**

5. **Bring to team meeting**

## 🎓 Platform-Specific Guidelines

### Web Developers (React/TypeScript/Next.js)

**Key Standards:**
- Components in PascalCase: `PharmacyCard.tsx`
- Functions/variables in camelCase: `fetchPharmacies()`
- Constants in UPPER_SNAKE_CASE: `API_BASE_URL`
- 2 space indentation
- Max line length: 100 characters

**File Organization:**
```
components/
  layout/      # Header, Footer
  sections/    # Hero, Features
  ui/          # Button, Card
  features/    # Feature-specific
```

**AI Prompt Quick Start:**
```
Create a [ComponentName] React component for Blessed Irembo.
TypeScript, Tailwind CSS, responsive, accessible, production-ready.
Follow docs/CODING_STANDARDS.md. No emojis.
```

**Example Component Structure:**
```typescript
import { useState } from 'react';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  onSelect?: (id: string) => void;
}

/**
 * PharmacyCard Component
 * 
 * Displays pharmacy information in a card format.
 * Used in search results and pharmacy listings.
 */
export default function PharmacyCard({ pharmacy, onSelect }: PharmacyCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Component content */}
    </div>
  );
}
```

### iOS Developers (Swift/SwiftUI)

**Key Standards:**
- Views in PascalCase: `PharmacyCard.swift`
- Variables/functions in camelCase: `fetchPharmacies()`
- Follow MVVM pattern strictly
- Use @State, @Binding, @ObservedObject appropriately

**File Organization:**
```
Views/         # SwiftUI views
ViewModels/    # MVVM ViewModels
Services/      # API, Location
Models/        # Data models
```

**AI Prompt Quick Start:**
```
Create a [ViewName] SwiftUI view for Blessed Irembo.
MVVM pattern, adaptive layout, accessible, production-ready.
Follow docs/CODING_STANDARDS.md. No emojis.
```

### Android Developers (Kotlin/Jetpack Compose)

**Key Standards:**
- Composables in PascalCase: `PharmacyCard.kt`
- Variables/functions in camelCase: `fetchPharmacies()`
- Follow MVVM pattern with ViewModels
- Use Material Design 3
- 4 space indentation

**File Organization:**
```
ui/
  screens/     # Activities/Fragments
  components/  # Composables
  viewmodels/  # ViewModels
data/
  models/      # Data models
  repository/  # Repositories
```

**AI Prompt Quick Start:**
```
Create a [ComposableName] for Blessed Irembo Android app.
Kotlin, Jetpack Compose, Material3, accessible, production-ready.
Follow docs/CODING_STANDARDS.md. No emojis.
```

## ⚠️ Common Mistakes to Avoid

### 1. Using Emojis
```typescript
// ❌ DON'T DO THIS
// 😊 This function fetches pharmacies
const getPharmacies = () => { }

// ✅ DO THIS
// Fetch pharmacies from API based on user location
const getPharmacies = () => { }
```

### 2. Obvious Comments
```typescript
// ❌ DON'T DO THIS
i++; // Increment i

// ✅ DO THIS
// Move to next pharmacy in pagination
currentIndex++;
```

### 3. Hardcoded Values
```typescript
// ❌ DON'T DO THIS
const apiUrl = "https://api.example.com";

// ✅ DO THIS
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
```

### 4. Missing Error Handling
```typescript
// ❌ DON'T DO THIS
const data = await fetch('/api/pharmacies');

// ✅ DO THIS
try {
  const data = await fetch('/api/pharmacies');
  return data;
} catch (error) {
  console.error('Failed to fetch pharmacies:', error);
  showErrorToast('Unable to load pharmacies');
  return null;
}
```

### 5. Poor Naming
```typescript
// ❌ DON'T DO THIS
const d = new Date();
const fn = () => {};

// ✅ DO THIS
const currentDate = new Date();
const fetchPharmacyDetails = () => {};
```

## 📚 Essential Resources

### Documentation (Must Read)
- `/docs/README.md` - Start here
- `/docs/CODING_STANDARDS.md` - Essential reading
- `/docs/AI_PROMPTS.md` - AI assistant templates
- `/docs/QUICK_REFERENCE.md` - Daily reference
- `/docs/COLLABORATION_GUIDE.md` - Team workflow

### Tools
- GitHub - Version control
- Slack/Teams - Communication
- Figma - Design
- VS Code - Code editor (recommended)

### External Resources
- Next.js Docs: https://nextjs.org/docs
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- TypeScript: https://www.typescriptlang.org

## ✅ Your First Week Goals

### Day 1-2
- [ ] Complete all reading (docs folder)
- [ ] Setup development environment
- [ ] Configure AI assistant
- [ ] Introduce yourself to the team

### Day 3-4
- [ ] Make first small contribution (fix typo, update README, etc.)
- [ ] Create your first pull request
- [ ] Get familiar with codebase
- [ ] Ask lots of questions

### Day 5
- [ ] Contribute to a feature
- [ ] Review someone's code
- [ ] Share learnings with team
- [ ] Reflect on week

## 🎉 Success Indicators

You're on the right track when:
- ✅ Your code passes review with minimal comments
- ✅ You're using AI prompts effectively
- ✅ You understand why we have standards
- ✅ You're helping teammates
- ✅ You're comfortable with the workflow
- ✅ You're asking good questions
- ✅ You're contributing quality code

## 🚀 Remember

> "We're building something that will help thousands of Rwandans access healthcare. Every line of code matters. Quality over speed. Consistency over individuality. Teamwork over solo work. Let's build something amazing together!"

## 📞 Need Help?

**Questions about:**
- Code Standards? → `/docs/CODING_STANDARDS.md`
- AI Prompts? → `/docs/AI_PROMPTS.md`
- Workflow? → `/docs/COLLABORATION_GUIDE.md`
- Quick Lookup? → `/docs/QUICK_REFERENCE.md`

**Still stuck?**
- Ask in team chat
- Tag a team lead
- Schedule pair programming session

---

## Next Steps

1. ✅ Read this document completely
2. ✅ Read `/docs/README.md`
3. ✅ Read `/docs/CODING_STANDARDS.md` (your platform)
4. ✅ Setup your environment
5. ✅ Configure AI assistant
6. ✅ Make first contribution
7. ✅ Join team meeting

**Welcome to the team! Let's build Blessed Irembo! 🇷🇼**

---

**Last Updated**: November 22, 2025
**Version**: 1.0.0
