# QuizBlitz - Gamified Learning Platform

## Overview

QuizBlitz is a Kahoot-style gamified learning web application that enables teachers to create AI-powered quizzes and host live, interactive game sessions. Students join games using unique codes and compete in real-time multiple-choice quizzes, earning points, badges, and climbing leaderboards.

The platform leverages the Google Gemini API to automatically generate quiz questions from lesson content, making it easy for teachers to create engaging educational games quickly.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: Wouter for lightweight client-side routing with a clear separation between public routes (landing, login, register) and protected routes (dashboard, lessons, games)

**UI Component System**: Shadcn UI built on Radix UI primitives, providing accessible and customizable components. The design follows a "New York" style with custom theming using CSS variables for both light and dark modes.

**Styling**: TailwindCSS with a custom design system inspired by Kahoot's energetic aesthetic, Linear's typography, and Notion's organized dashboards. Uses Inter for UI text and Poppins for display/game elements. Implements a consistent spacing system and color palette optimized for gamification.

**State Management**: 
- TanStack Query (React Query) for server state management and caching
- React Context for authentication state and theme management
- Local component state for UI interactions

**Forms**: React Hook Form with Zod validation for type-safe form handling

**Key Design Patterns**:
- Component composition with Radix UI's slot-based architecture
- Custom hooks for reusable logic (auth, mobile detection, toast notifications)
- Protected route wrapper components for access control
- Responsive layouts with mobile-first approach

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**Language**: TypeScript with ES modules

**API Design**: RESTful endpoints organized by feature:
- `/api/auth/*` - Authentication and session management
- `/api/lessons/*` - Lesson CRUD operations
- `/api/quizzes/*` - Quiz management and generation
- `/api/sessions/*` - Game session lifecycle (create, join, start, play)

**Session Management**: Express-session with MemoryStore for development. Session-based authentication with user ID stored in session data.

**Authentication Flow**:
- Password hashing using Node.js crypto (scrypt with salt)
- Timing-safe password comparison to prevent timing attacks
- Session-based auth with HTTP-only cookies
- Protected middleware for route authorization
- Role-based access (teacher vs student)

**Business Logic Patterns**:
- Service layer pattern with storage interface abstraction
- In-memory storage implementation (can be swapped for database)
- Game code generation using alphanumeric strings
- Real-time game state managed through polling (refetch intervals on client)

### Data Storage Solutions

**ORM**: Drizzle ORM configured for PostgreSQL

**Database Provider**: Neon Database (serverless PostgreSQL) via `@neondatabase/serverless`

**Schema Design**:
- `users` - Stores both teachers and students with role field, includes gamification stats (totalScore, gamesPlayed, gamesWon)
- `lessons` - Teacher-created content with title, subject, and content text
- `quizzes` - Generated quizzes linked to lessons, includes metadata
- `questions` - Multiple-choice questions with options array and answer index
- `game_sessions` - Live game instances with status, game code, and current question tracking
- `game_players` - Player participation records with scores and streaks
- `player_answers` - Individual answer submissions with timing data
- `badges` - Achievement definitions with categories and unlock criteria
- `user_badges` - Badge ownership records

**Key Relationships**:
- Users (teachers) → Lessons (one-to-many)
- Lessons → Quizzes (one-to-many)
- Quizzes → Questions (one-to-many)
- Quizzes → Game Sessions (one-to-many)
- Game Sessions → Game Players (one-to-many)
- Game Players → Player Answers (one-to-many)

**Migration Strategy**: Drizzle Kit for schema migrations with TypeScript schema definitions

### Authentication and Authorization

**Strategy**: Session-based authentication with cookie storage

**Password Security**: 
- Scrypt key derivation with random 16-byte salt
- Constant-time comparison using `timingSafeEqual`
- Passwords never stored in plaintext

**Session Configuration**:
- HTTP-only cookies to prevent XSS attacks
- Secure flag in production
- Same-site strict for CSRF protection
- Session data stores user ID only

**Authorization**:
- Middleware checks session for authenticated routes
- Role-based access control for teacher-only features (lesson creation, quiz generation, hosting games)
- Students can join games and view leaderboards
- Protected route wrappers on frontend with redirect to login

### External Dependencies

**AI Service**: Google Gemini API (`@google/genai`)
- Model: gemini-2.5-flash
- Purpose: Generate multiple-choice quiz questions from lesson content
- Input: Lesson text and number of questions desired
- Output: JSON array of questions with options and correct answer indices
- Error handling includes JSON parsing cleanup for markdown-wrapped responses

**Database Service**: Neon Serverless PostgreSQL
- Connection via `@neondatabase/serverless` package
- Environment variable: `DATABASE_URL`
- WebSocket-based connection for serverless environments

**UI Component Library**: Radix UI
- Provides accessible, unstyled primitives
- Components: Dialog, Dropdown, Tooltip, Accordion, Select, etc.
- Wrapped with Shadcn styling system

**Development Tools**:
- Vite for fast development and HMR
- ESBuild for production server bundling
- Replit-specific plugins for runtime error overlay and cartographer

**Notable Package Choices**:
- `wouter` - Lightweight routing (2KB vs React Router's larger bundle)
- `date-fns` - Date formatting and manipulation
- `nanoid` - Unique ID generation
- `zod` - Runtime type validation and schema definitions
- `class-variance-authority` - Type-safe component variants

**Environment Requirements**:
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Google AI API key
- `SESSION_SECRET` - For session encryption (generated if missing)