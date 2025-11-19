# Team Collaboration Guide - Blessed Irembo Platform

## Overview

This guide outlines how the Blessed Irembo development team will collaborate effectively across Web, iOS, and Android platforms to build a consistent, high-quality application.

## Team Structure

### Development Teams

**Web Team**
- Technology: Next.js, React, TypeScript, Tailwind CSS
- Primary Focus: Web application development
- Repository: `apps/web/blessed_irembo_web/`

**iOS Team**
- Technology: Swift, SwiftUI
- Primary Focus: Native iOS application
- Repository: `apps/ios/`

**Android Team**
- Technology: Kotlin, Jetpack Compose
- Primary Focus: Native Android application
- Repository: `apps/android/`

**Backend Team**
- Technology: Node.js, TypeScript, Express
- Primary Focus: API and business logic
- Repository: `backend/`

### Shared Responsibilities

**All Teams**
- Follow coding standards in `docs/CODING_STANDARDS.md`
- Use AI prompts from `docs/AI_PROMPTS.md`
- Participate in code reviews
- Document their work
- Communicate changes that affect other teams

## Workflow

### 1. Feature Development Process

#### Step 1: Planning
1. **Product Owner** creates feature specification
2. Feature is discussed in team meeting
3. Technical approach is agreed upon
4. Tasks are created and assigned

#### Step 2: Development
1. Developer creates feature branch: `feat/platform-feature-name`
   - Example: `feat/web-pharmacy-search`
   - Example: `feat/ios-map-integration`
   - Example: `feat/android-user-profile`

2. Developer uses appropriate AI prompt from `docs/AI_PROMPTS.md`

3. Code is written following `docs/CODING_STANDARDS.md`

4. Developer tests locally

5. Developer commits with proper commit message format

#### Step 3: Code Review
1. Developer creates Pull Request (PR)
2. At least one team member reviews
3. Automated checks run (linting, tests)
4. Feedback is addressed
5. PR is approved and merged

#### Step 4: Integration
1. Code is merged to main branch
2. CI/CD pipeline runs
3. Changes are deployed to staging
4. QA testing is performed

### 2. Branch Strategy

```
main (production-ready code)
  ├── develop (integration branch)
  │   ├── feat/web-pharmacy-search
  │   ├── feat/ios-map-integration
  │   ├── feat/android-user-profile
  │   ├── fix/web-header-layout
  │   └── docs/update-api-guide
  └── hotfix/critical-bug
```

**Branch Naming Convention:**
- Features: `feat/platform-feature-name`
- Bug fixes: `fix/platform-bug-description`
- Documentation: `docs/document-name`
- Hotfixes: `hotfix/critical-issue`

### 3. Communication Channels

#### Daily
- **Slack/Teams**: Quick questions, updates, blockers
- **GitHub Issues**: Bug reports, feature requests
- **Pull Request Comments**: Code-specific discussions

#### Weekly
- **Team Standup**: Progress updates, blockers, planning
- **Code Review Sessions**: Review important PRs together
- **Cross-Platform Sync**: Ensure consistency across platforms

#### Monthly
- **Sprint Planning**: Plan upcoming features
- **Retrospective**: Discuss what worked, what didn't
- **Architecture Review**: Discuss major technical decisions

## Ensuring Consistency

### 1. Design Consistency

**Design System**
- Shared color palette (teal #0D9488 as primary)
- Consistent spacing scale
- Unified typography
- Common component behaviors

**Implementation:**
- Web uses Tailwind CSS classes
- iOS uses design tokens in Swift
- Android uses Material3 theme with custom colors

**Process:**
1. Designer creates component in Figma
2. Designer specifies behavior for all platforms
3. Each team implements using platform conventions
4. Teams cross-check implementations

### 2. API Consistency

**Backend Team Responsibilities:**
- Document all API endpoints
- Maintain API documentation (Swagger/OpenAPI)
- Version APIs properly
- Notify teams of breaking changes

**Frontend Team Responsibilities:**
- Use shared SDK from `packages/sdk/`
- Don't duplicate API logic
- Report API issues to backend team

**Process:**
1. Backend team creates/updates endpoint
2. Backend team updates API documentation
3. Backend team updates SDK in `packages/sdk/`
4. Frontend teams use updated SDK
5. Frontend teams provide feedback

### 3. Data Model Consistency

**Shared Models:**
All platforms should use the same data structures.

Example - Pharmacy Model:
```typescript
// Backend/Web (TypeScript)
interface Pharmacy {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  isOpen: boolean;
  openingHours: OpeningHours[];
}
```

```swift
// iOS (Swift)
struct Pharmacy: Codable {
    let id: String
    let name: String
    let location: Location
    let contact: Contact
    let isOpen: Bool
    let openingHours: [OpeningHours]
}
```

```kotlin
// Android (Kotlin)
data class Pharmacy(
    val id: String,
    val name: String,
    val location: Location,
    val contact: Contact,
    val isOpen: Boolean,
    val openingHours: List<OpeningHours>
)
```

**Process:**
1. Backend team defines data models
2. Models are documented in `docs/DATA_MODELS.md`
3. All teams implement matching models
4. Changes are communicated to all teams

### 4. Feature Parity

**Feature Checklist:**
When implementing a feature, ensure:
- [ ] Web implementation complete
- [ ] iOS implementation complete
- [ ] Android implementation complete
- [ ] Behavior is consistent across platforms
- [ ] Error handling is consistent
- [ ] Loading states are consistent
- [ ] Success/failure messages are similar

**Feature Tracking:**
Use GitHub Projects to track feature implementation across platforms.

## Using AI Assistants Consistently

### 1. Initial Setup

Each developer should configure their AI assistant with:

```
Context: Blessed Irembo Platform Development

I'm developing for the [Web/iOS/Android] platform of Blessed Irembo, 
a pharmacy locator application for Rwanda.

Standards:
- Follow docs/CODING_STANDARDS.md strictly
- Use prompts from docs/AI_PROMPTS.md as templates
- No emojis in code or comments
- Production-level code quality
- Clear, concise documentation

Platform: [Web/iOS/Android]
Tech Stack: [Your specific stack]

Always generate code that:
1. Follows our coding standards
2. Matches existing patterns in the codebase
3. Is production-ready
4. Includes proper error handling
5. Is well-documented
```

### 2. Before Generating Code

Ask yourself:
1. What's the exact feature I'm building?
2. Does a similar component exist I can reference?
3. What are the specific requirements?
4. Have I checked the coding standards?

### 3. After Receiving AI-Generated Code

Review checklist:
- [ ] Matches our naming conventions
- [ ] No emojis in comments
- [ ] Proper error handling
- [ ] Follows platform patterns
- [ ] Properly typed (TypeScript/Swift/Kotlin)
- [ ] Accessible
- [ ] Responsive/Adaptive
- [ ] Production-ready

### 4. Sharing AI Prompts

When you create an effective prompt:
1. Add it to `docs/AI_PROMPTS.md`
2. Share in team chat
3. Discuss in weekly meeting

## Code Review Guidelines

### What to Look For

**All Code:**
- Follows coding standards
- No emojis
- Clear, concise comments
- Proper error handling
- No hardcoded values
- Consistent with existing patterns

**Web Code:**
- TypeScript types defined
- Responsive design
- Accessible
- Performance optimized

**iOS Code:**
- Swift best practices
- Adaptive layout
- Accessibility labels
- Memory management

**Android Code:**
- Kotlin best practices
- Material Design 3
- Accessibility
- Lifecycle awareness

### How to Give Feedback

**Good Feedback:**
```
"This function could be more readable if we extract the validation 
logic into a separate function. Here's an example..."
```

**Bad Feedback:**
```
"This is wrong."
```

**Better:**
- Be specific
- Explain why
- Suggest alternatives
- Provide examples
- Link to standards document

### Response Time
- Acknowledge PR within 4 hours
- Complete review within 24 hours
- Emergency fixes: ASAP

## Quality Assurance

### Testing Requirements

**Web:**
- Unit tests for utilities
- Component tests for UI
- Integration tests for API calls
- E2E tests for critical flows

**iOS:**
- Unit tests for ViewModels
- UI tests for main flows
- Test on iPhone and iPad

**Android:**
- Unit tests for ViewModels
- UI tests for main flows
- Test on multiple screen sizes

**Backend:**
- Unit tests for services
- Integration tests for endpoints
- Load testing for critical endpoints

### QA Process
1. Developer tests locally
2. Automated tests run on PR
3. Code review includes functionality check
4. Merged to develop
5. QA team tests on staging
6. Approved for production

## Documentation

### Required Documentation

**Code Documentation:**
- File headers explaining purpose
- Function/method documentation
- Complex logic comments
- No emojis

**Project Documentation:**
- README.md for each platform
- API documentation (backend)
- Setup instructions
- Deployment guides

**Feature Documentation:**
- Feature specifications
- User stories
- Design mockups
- Technical decisions

### Updating Documentation

When to update:
- New feature added
- API changed
- Process changed
- Standards updated

Who updates:
- Developer updates code docs
- Team lead updates process docs
- Product owner updates specs
- All can suggest improvements

## Onboarding New Team Members

### Day 1
1. Access to repositories
2. Read README.md
3. Read docs/CODING_STANDARDS.md
4. Read docs/AI_PROMPTS.md
5. Setup development environment

### Week 1
1. Pair with team member
2. Make first small contribution
3. Create first pull request
4. Attend team meetings
5. Ask questions freely

### Month 1
1. Contribute to major feature
2. Review others' code
3. Suggest improvements
4. Feel comfortable with codebase

## Conflict Resolution

### Code Conflicts
1. Discuss in PR comments
2. If no agreement, escalate to team lead
3. Team lead makes final decision
4. Decision is documented

### Design Conflicts
1. Discuss in team meeting
2. Reference design system
3. Designer has final say on design
4. Developer has final say on feasibility

### Process Conflicts
1. Bring up in retrospective
2. Team discusses alternatives
3. Vote on approach
4. Update documentation

## Continuous Improvement

### What We Track
- Code quality metrics
- PR review time
- Bug rate
- Feature velocity
- Team satisfaction

### How We Improve
1. Monthly retrospectives
2. Analyze metrics
3. Identify problems
4. Implement solutions
5. Measure impact

### Updating Standards
1. Anyone can propose change
2. Discuss in team meeting
3. Update docs/CODING_STANDARDS.md
4. Announce to all teams
5. Update in progress work gradually

## Emergency Procedures

### Production Bug
1. Create hotfix branch from main
2. Fix and test quickly
3. Fast-track PR review
4. Deploy immediately
5. Post-mortem after fix

### Service Outage
1. Backend team investigates
2. Status updates every 15 minutes
3. Frontend teams prepare messaging
4. Resolve and deploy
5. Post-mortem within 24 hours

### Security Issue
1. Report to team lead immediately
2. Assess severity
3. Fix in private repository if needed
4. Deploy fix
5. Notify affected users if required

## Success Metrics

We're successful when:
- Code is consistent across platforms
- Features work identically everywhere
- Code reviews are constructive
- Deployments are smooth
- Team is happy and productive
- Users love the product

## Resources

### Documentation
- `docs/CODING_STANDARDS.md` - Coding standards
- `docs/AI_PROMPTS.md` - AI assistant prompts
- `docs/DATA_MODELS.md` - Shared data models
- `README.md` - Project overview

### Tools
- GitHub - Version control
- Slack/Teams - Communication
- Figma - Design
- Postman - API testing
- Jira/Linear - Project management

### Getting Help
1. Check documentation first
2. Ask in team chat
3. Pair with team member
4. Escalate to team lead
5. Bring to team meeting

---

## Remember

> "We're building something that will help thousands of Rwandans access healthcare. Quality and consistency matter. Take pride in your code, help your teammates, and we'll build something amazing together."

---

**Last Updated**: November 19, 2025
**Version**: 1.0.0
**Maintained By**: Development Team Leads
