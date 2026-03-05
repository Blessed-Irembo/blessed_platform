# Blessed Irembo - Admin Dashboard

Admin dashboard for managing the Blessed Irembo pharmacy finder platform.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the admin dashboard.

### Build

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Project Structure

```
admin/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable components
├── lib/                   # Utilities and helpers
├── public/                # Static assets
└── package.json           # Dependencies
```

## Features (Coming Soon)

- Admin authentication
- User management
- Pharmacy verification and approval
- Inquiry monitoring
- Subscription management
- Analytics dashboard
- System settings

## API Integration

The admin dashboard will communicate with the main backend API to:
- Manage users and pharmacies
- Review and approve pharmacy registrations
- Monitor platform activity
- Generate reports and analytics

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
