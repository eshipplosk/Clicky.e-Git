# ScholarHub - Scholarship Management Platform

## Overview

ScholarHub is a web-based scholarship management platform designed to connect students with scholarship opportunities while providing administrators with tools to manage scholarship programs. The application features smart matching algorithms that pair students with relevant scholarships based on their academic profiles, demographics, and achievements. Built with a modern tech stack, it emphasizes clarity, efficiency, and accessibility following Material Design principles.

## Recent Changes

**December 4, 2025 - International Student Resources Section**
- Added "International Student Tuition & Scholarship Resources" section to student dashboard
- Created JSON config file (client/src/config/internationalResources.json) for easy resource updates without code changes
- Curated list includes: cost estimators, currency converters, scholarship databases (Fulbright, IIE, InternationalScholarships.com), and official resources (EducationUSA)
- All links open in new tabs with proper security attributes (rel="noopener noreferrer")
- Responsive grid layout: 1 column (mobile), 2 columns (tablet), 4 columns (desktop)
- Category badges with color-coded styling for visual organization
- Section placed below "Top Matches for You" on the dashboard
- Architect reviewed: passed with no blocking issues

**December 4, 2025 - FilteredScholarshipList Data Normalization Fix**
- Fixed crash in scholarship filtering when API returns flat properties vs. nested requirements object
- Added data normalization layer to handle both API format (minGPA, minACT, etc.) and mock format (requirements.minGPA)

**November 8, 2025 - AI Scholarship Assistant**
- Implemented intelligent scholarship matching algorithm with 100-point scoring system
- Matching criteria: GPA (20pts), test scores (15pts), major (15pts), demographics (20pts), skills (10pts), volunteer hours (10pts), financial need bonus (10pts)
- Built AI assistant powered by OpenAI GPT-4o-mini with student profile context
- Created conversational chat interface with message history and quick question prompts
- Added /student/ai-assistant route with prominent CTA card on student dashboard
- AI provides personalized scholarship recommendations and answers student questions
- All scoring includes proportional partial credit for missing requirements
- Architect reviewed: passed with no blocking issues; suggested future improvements include regression tests, OpenAI quota monitoring, and chat history persistence

**November 8, 2025 - Logout Functionality**
- Implemented secure logout feature accessible from user menu dropdown in Header
- Added logout handler that properly validates server response before clearing session
- Clears user state, React Query cache, and redirects to home page on successful logout
- Protected routes remain inaccessible after logout with appropriate access messages

**October 30, 2025 - Financial Aid Calculator Feature**
- Added tuition amount tracking to student profiles
- Created scholarship applications system for students to accept/remove scholarships
- Built Financial Aid Calculator component that displays:
  - Total tuition amount
  - Total scholarship coverage
  - Loan-eligible balance (tuition - scholarships)
- Implemented real-time calculation updates via React Query
- Added backend API endpoints for scholarship applications and financial aid summary
- Server now handles ISO date strings for scholarship deadlines by converting to Date objects

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing

**UI Design System**
- Shadcn/ui component library with Radix UI primitives for accessible, composable components
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design principles emphasizing clarity and information hierarchy
- Comprehensive theming system supporting light/dark modes with HSL color spaces
- Custom fonts: Inter (primary UI) and JetBrains Mono (monospace/data fields)

**State Management**
- TanStack Query (React Query) for server state management, caching, and data synchronization
- Local React state for UI-specific concerns
- Custom hooks pattern for reusable logic

**Key Design Decisions**
- Component-based architecture with clear separation between presentational and container components
- Path aliases (@/, @shared/, @assets/) for clean imports and maintainability
- Mobile-first responsive design with dedicated mobile breakpoint hooks

### Backend Architecture

**Server Framework**
- Express.js running on Node.js for RESTful API endpoints
- TypeScript throughout for type safety across client and server
- Custom middleware for request logging and error handling

**Database & ORM**
- Drizzle ORM for type-safe database operations with schema-first approach
- Neon serverless PostgreSQL for scalable cloud database hosting
- WebSocket support for real-time database connections
- Schema colocation in shared directory for frontend/backend type consistency

**Data Models**
- Users table with role-based access (student/admin)
- Student profiles with comprehensive academic and demographic data including tuition amount
- Scholarships with eligibility criteria and deadline tracking
- Scholarship applications table tracking student acceptances
- Support for various standardized test scores (ACT, SAT, LSAT, GRE)
- Array fields for extracurriculars, skills, and leadership roles

**Storage Pattern**
- Interface-based storage abstraction (IStorage) allowing flexible implementations
- In-memory storage for development (MemStorage class)
- Database storage interface for production (ready for Drizzle integration)
- CRUD operation encapsulation for clean separation of concerns

**Authentication & Authorization**
- Role-based access control (student vs admin)
- Session management prepared for implementation
- User identity tied to database records via UUID primary keys

### External Dependencies

**Database Services**
- Neon Serverless PostgreSQL - Cloud-hosted database with WebSocket support
- Connection pooling via @neondatabase/serverless package
- Database migrations managed through Drizzle Kit

**UI Component Libraries**
- Radix UI - Comprehensive set of accessible, unstyled React primitives
  - Dialog, Dropdown, Popover, Select, Toast, and 20+ other components
  - Built-in accessibility features and keyboard navigation
- Shadcn/ui - Customizable component implementations built on Radix
- Lucide React - Icon library for consistent iconography

**Development Tools**
- Replit-specific plugins for runtime error overlay, cartographer, and dev banner
- ESBuild for production server bundling
- TypeScript compiler for type checking without emission

**Form Management**
- React Hook Form for performant form handling
- Hookform/resolvers for validation schema integration
- Drizzle-Zod for automatic schema-to-validation conversion

**Utility Libraries**
- date-fns for date manipulation and formatting
- clsx and tailwind-merge (via cn utility) for conditional className composition
- class-variance-authority for variant-based component styling
- nanoid for unique ID generation

**Development Environment**
- Designed for Replit hosting with environment variable configuration
- DATABASE_URL environment variable required for database connection
- Separate development and production build processes