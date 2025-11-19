# BlessedIrembo Platform

BlessedIrembo is a mobile application designed to connect users with pharmacies in their vicinity and across the country. The platform provides an interactive map-based interface where users can view pharmacy locations, contact information, and other essential details. Pharmacies can register themselves, update their information, and interact with users directly.

The application serves as an intermediary platform (similar to YegoCab's model), without storing or recording private conversations between users and pharmacies, ensuring easy, transparent, and efficient access to pharmaceutical services.

## Objectives

- Help users easily find nearby pharmacies through a map interface
- Provide users with accurate details (name, location, phone number, email) of pharmacies
- Allow pharmacies to self-register and update their details (including geolocation)
- Enable two-way communication between pharmacies and users without storing conversations
- Create a nationwide database of pharmacies accessible by all users

## Key Features

### For Users

**Interactive Map View** - Users can see pharmacies plotted on a map, showing nearest pharmacies first

**Pharmacy Details** - View pharmacy name, location, contact person, phone, and email

**Inquiries / Contact** - Submit inquiry (name, phone, email) directly to pharmacy

**Search & Filters** - Search by name, location, and filter by opening hours (future option)

### For Pharmacies

**Registration** - Pharmacies create accounts with details (name, address, email, phone, license number)

**Manage Profile** - Update details anytime

**Receive Inquiries** - Receive user's name, phone, and email; respond directly

## User Roles & Access

**User** - Search, view, and contact pharmacies

**Pharmacy** - Register, manage profile, and receive inquiries

**Admin** - Verify pharmacy registrations, manage database, resolve issues

## Value Proposition

**For Users** - Quick and reliable access to pharmacies anywhere they are

**For Pharmacies** - Increased visibility and more clients

**For the Health Ecosystem** - Better access to essential medicines and stronger digital infrastructure

## Example User Flow

1. User opens the app - Map loads showing nearest pharmacies
2. User taps a pharmacy - Details page opens
3. User clicks "Contact Pharmacy" - fills name, phone, and email
4. Pharmacy receives inquiry instantly - can respond directly to the user

## Data & Privacy

- The app does not record or save conversations between users and pharmacies
- Only basic inquiry details (name, phone, email) are shared between users and pharmacies
- Pharmacy details (name, contacts, location) are visible to all users

## Project Structure

```
blessed_platform/
│
├── apps/
│   ├── web/                 # Web application
│   ├── ios/                 # Native iOS (Swift)
│   └── android/             # Native Android (Kotlin)
│
├── backend/
│   ├── api/                 # REST/GraphQL APIs
│   ├── services/            # Business logic
│   ├── models/              # Database models (User, Lessons, Progress…)
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Authentication, logging, error handling
│   ├── utils/               # Helper functions
│   ├── config/              # Configuration files
│   └── tests/               # Backend tests
│
├── packages/
│   ├── sdk/                 # Shared API SDK (iOS/Android/Web use this)
│   ├── utils/               # Shared utilities
│   └── config/              # Shared constants + env schema
│
├── infra/
│   ├── docker/              # Dockerfiles for backend, web, etc.
│   ├── k8s/                 # Kubernetes manifests (optional)
│   └── terraform/           # Cloud infrastructure as code
│
├── docs/                    # Documentation & architecture diagrams
├── scripts/                 # Dev, build, deploy scripts
└── .github/workflows/       # CI/CD pipelines
```

## Technical Considerations

**Platform** - Android & iOS (Phase 1 could start with Android)

**Map Integration** - Google Maps API

**User Location Tracking** - GPS for nearby pharmacy suggestions

**Database** - Secure database for pharmacy details and inquiries

**Admin Panel** - For monitoring and approving pharmacy registrations

## Additional Features (Future Phases)

- Ratings & reviews for pharmacies
- Filters (open now / 24 hours)
- Online ordering & delivery integration
- Multi-language support

## Getting Started

### Prerequisites

- Node.js (v18+)
- Swift (for iOS development)
- Kotlin/Android Studio (for Android development)
- Docker (optional, for containerization)
- Google Maps API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Blessed-Irembo/blessed_platform.git
cd blessed_platform

# Install dependencies
npm install
```

## Applications

### Web App
Located in `apps/web/` - Modern web application

### iOS App
Located in `apps/ios/` - Native iOS application built with Swift

### Android App
Located in `apps/android/` - Native Android application built with Kotlin (Phase 1 priority)

## Backend

The backend is organized into distinct layers:
- **API**: Handles HTTP requests and responses
- **Services**: Contains business logic for pharmacy management, user inquiries, and geolocation
- **Models**: Database schemas and models (User, Pharmacy, Inquiry, etc.)
- **Controllers**: Route handlers for pharmacy registration, user requests, and admin functions
- **Middleware**: Authentication, logging, error handling
- **Utils**: Helper functions and utilities

## Packages

Shared code that can be used across different platforms:
- **SDK**: API client for all platforms (iOS/Android/Web)
- **Utils**: Common utility functions
- **Config**: Shared configuration and constants

## Infrastructure

- **Docker**: Container definitions for backend, web, etc.
- **Kubernetes**: Orchestration configs (optional)
- **Terraform**: Cloud infrastructure provisioning

## Documentation

For detailed documentation, architecture diagrams, and guides, see the `/docs` directory.

## Development Notes

### Priority Features
- User-friendly interface and simple navigation
- Real-time GPS for location detection
- Accurate and searchable pharmacy pins
- Pharmacy registration portal with approval workflow
- Secure inquiry sharing (user details sent to pharmacy only)

### Security & Privacy
- No storage of user-pharmacy conversations
- Secure transmission of inquiry data
- Pharmacy verification system through admin panel
- User data protection compliance

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

[Add your license here]
