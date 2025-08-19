# Overview

This is a festival events management web application for the "Fiestas de Mislata 2024" - a Spanish town festival celebration. The application displays and manages festival events across different categories (patronales and populares) with features for browsing, searching, filtering, and favoriting events. The system provides a responsive user interface for viewing event schedules, locations, organizers, and status updates.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation through @hookform/resolvers
- **Styling**: Tailwind CSS with custom CSS variables for theming and design tokens

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **API Pattern**: RESTful API endpoints under `/api` prefix
- **Data Storage**: In-memory storage implementation with interface-based design for future database integration
- **Development**: Hot module replacement and development middleware through Vite integration

## Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL with Neon Database serverless driver
- **Schema**: Single `festival_events` table with fields for event details, categorization, and status tracking
- **Validation**: Zod schemas for runtime type checking and data validation
- **Migrations**: Drizzle Kit for database schema management and migrations

## Data Models
The core entity is `FestivalEvent` with properties:
- Event identification and naming
- Date/time scheduling
- Location and organizer information  
- Categorization (patronales/populares)
- Type classification (música, procesión, concierto, etc.)
- Status tracking (upcoming, ongoing, finished)

## Component Architecture
- **Layout Components**: Header, hero section, and filter sidebar for main navigation
- **Display Components**: Event cards with status badges and favorite toggle functionality
- **Modal Components**: Favorites management and responsive mobile interfaces
- **Custom Hooks**: Favorites persistence, mobile detection, and API data fetching

## External Dependencies

- **Database**: Neon Database (PostgreSQL-compatible serverless)
- **UI Components**: Radix UI for accessible component primitives
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns library with Spanish locale support
- **Development**: Replit-specific plugins for cartographer and runtime error handling
- **Fonts**: Google Fonts integration (Inter, Playfair Display, and additional typography)