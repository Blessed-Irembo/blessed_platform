# Blessed Irembo Web Application

Production-level web application for the Blessed Irembo pharmacy locator platform.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI**: React 19

## Project Structure

```
apps/web/blessed_irembo_web/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── layout/              # Layout components (Header, Footer)
│   └── sections/            # Page sections (Hero, Features, etc.)
├── public/                  # Static assets
│   ├── images/              # Image files
│   └── logo.svg             # Site logo
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Navigate to the web app directory
cd apps/web/blessed_irembo_web

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
# Create a production build
npm run build

# Start the production server
npm start
```

## Components

### Layout Components

- **Header**: Main navigation with logo, links, and action buttons
- **Footer**: Site footer with quick links and contact information

### Section Components

- **HeroSection**: Main landing section with CTA buttons
- **FeaturesSection**: Platform statistics and key features
- **PharmacyOwnersSection**: Benefits for pharmacy owners
- **CTASection**: Bottom call-to-action section

## Adding Images

Place your images in the `public/images/` directory:

- `hero-pharmacist.jpg` - Hero section image (recommended: 1200x1000px)
- `pharmacy-owner.jpg` - Pharmacy owners section image (recommended: 1200x1000px)

## Color Scheme

The application uses a teal-based color scheme:

- **Primary**: Teal-600 (#0D9488)
- **Primary Hover**: Teal-700 (#0F766E)
- **Text**: Gray-900 (#111827)
- **Secondary Text**: Gray-600 (#4B5563)
- **Background**: White (#FFFFFF)
- **Alt Background**: Gray-50 (#F9FAFB)

## Responsive Design

All components are fully responsive with breakpoints:

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Code Standards

- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent component documentation
- Semantic HTML structure
- Accessibility best practices

## Performance Optimizations

- Next.js Image component for optimized images
- Component-level code splitting
- Static generation where possible
- CSS optimization with Tailwind

## Future Enhancements

- Add interactive map integration (Google Maps API)
- Implement pharmacy search functionality
- Add user authentication
- Create pharmacy registration forms
- Add multi-language support (English, Kinyarwanda, French)

## License

Copyright 2025 Blessed Irembo. All rights reserved.
