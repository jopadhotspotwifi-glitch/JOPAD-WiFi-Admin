# ODOK Admin Portal

Professional administration interface for managing the ODOK WiFi Platform. Monitor clients, locations, revenue, and system settings from a centralized dashboard.

## Features

### 🏠 Dashboard

- Real-time platform metrics and statistics
- 7-day revenue trend visualization
- Recent client activity feed
- Quick stats overview (monthly revenue, total revenue, active rate)

### 👥 Clients Management

- View and manage all business clients
- Client status tracking (active, suspended, inactive)
- Subscription plan management (starter, professional, enterprise)
- Revenue and session analytics per client
- Add new clients with detailed information

### 📍 Locations Overview

- Monitor all WiFi locations across all clients
- Real-time status indicators (online, offline, error)
- Router type filtering (MikroTik, OpenWRT, Ubiquiti)
- Session count and revenue tracking
- Comprehensive location statistics

### 📊 Platform Analytics

- Session distribution by pricing plan
- Device type analytics (mobile, laptop, tablet)
- Hourly traffic patterns
- Top performing locations ranking
- Time-range filters (7 days, 30 days, 90 days)

### 💰 Revenue Tracking

- Platform and client revenue split visualization (15%/85% default)
- 6-month revenue trend analysis
- Top clients by revenue
- Revenue breakdown by pricing plan
- Average session value calculations

### ⚙️ Settings

- **Platform Settings**: Configure platform name and support email
- **Revenue Configuration**: Adjust platform revenue share percentage
- **Notifications**: Email and SMS notification preferences
- **Security**: Password management and two-factor authentication

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5 (Strict mode)
- **Styling**: Tailwind CSS v4
- **Font**: Inter (Google Fonts)

## Design Principles

- **Modern UI**: Clean, professional interface with consistent spacing
- **Type Safety**: Full TypeScript coverage, no "any" types
- **React 19 Compliance**: Follows React 19 purity rules (no impure functions in render)
- **Responsive**: Mobile-first design with responsive layouts
- **Accessibility**: Semantic HTML and ARIA attributes
- **Performance**: Optimized with lazy initialization and efficient state management

## Pages Structure

```
/                   - Login page
/dashboard          - Main admin dashboard
/clients            - Client management
/locations          - Location monitoring
/analytics          - Platform analytics
/revenue            - Revenue tracking
/settings           - System settings
```

## Components

### Reusable Components

- **Sidebar**: Navigation with active state highlighting
- **Header**: Page headers with search and notifications
- **StatCard**: Metric display cards with trend indicators

### TypeScript Types

All types are defined in `src/types/index.ts`:

- AdminUser
- Client
- Location
- PlatformStats
- Session
- RevenueData
- SystemAlert
- ClientActivity
- SystemSettings

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to view the admin portal.

## Key Features

### Revenue Management

- Configurable platform revenue share (default 15%)
- Real-time revenue calculations
- Split visualization between platform and clients

### Security

- Secure authentication flow
- Session management
- Two-factor authentication support

## Best Practices

1. **No "any" Types**: All variables are properly typed
2. **React 19 Purity**: No impure functions (like Date.now()) in render
3. **Lazy Initialization**: useState with initializer functions for expensive computations
4. **Modern Tailwind**: Using v4 syntax (bg-linear-to-r, shrink-0)
5. **Component Separation**: Reusable components with clear props interfaces

