# Design Guidelines: Gamified Learning Platform (Kahoot-Style)

## Design Approach

**Reference-Based Approach**: Drawing primary inspiration from **Kahoot's** energetic, playful aesthetic combined with **Linear's** clean typography and **Notion's** organized dashboard patterns.

**Core Principles**:
- High-energy gameplay: Bold, confident UI that creates excitement
- Clear hierarchy: Game elements dominate during play, productivity during creation
- Instant recognition: Visual feedback for correct/incorrect answers, scores, and progress
- Playful professionalism: Fun for students, organized for teachers

---

## Typography

**Font Families**:
- Primary: `Inter` (Google Fonts) - UI, body text, dashboards
- Display: `Poppins` (Google Fonts) - Game titles, questions, bold statements

**Hierarchy**:
- Game Questions: `text-4xl md:text-5xl lg:text-6xl font-bold` (Poppins)
- Dashboard Headings: `text-3xl font-bold` (Poppins)
- Section Titles: `text-xl font-semibold` (Inter)
- Body Text: `text-base` (Inter)
- UI Labels: `text-sm font-medium` (Inter)
- Captions/Meta: `text-xs text-muted-foreground` (Inter)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 24** for consistency
- Tight spacing: `gap-2, p-2` (within cards, button groups)
- Standard spacing: `gap-4, p-4, p-6` (component padding, card spacing)
- Section spacing: `py-8, py-12, py-16` (between major sections)
- Generous spacing: `gap-24` (game lobby, leaderboard items)

**Grid System**:
- Dashboards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for lesson/quiz cards
- Game view: Full-width centered layouts with `max-w-4xl` for questions
- Sidebar: `w-64` fixed width on desktop, drawer on mobile

---

## Component Library

### Navigation
**Teacher/Student Dashboards**:
- Left sidebar navigation (`w-64`) with icon + label for primary actions
- Top bar with user profile, notifications, and quick actions
- Mobile: Hamburger menu revealing slide-out drawer

### Game Components

**Lobby Screen**:
- Centered game code display: Massive typography (`text-8xl font-bold`), single focus
- Waiting list: Grid of player avatars/names (`grid-cols-4 md:grid-cols-6`)
- "Start Game" button: Large, prominent (`h-16 text-xl`)

**Question Display**:
- Full-screen question card with generous padding (`p-12`)
- Question text: Dominant, centered (`text-5xl lg:text-6xl`)
- Answer grid: `grid-cols-1 md:grid-cols-2 gap-6` for 4 options
- Each option: Large button with letter badge (A/B/C/D) + answer text
- Timer: Fixed position circular progress indicator (top-right)

**Answer Buttons**:
- Height: `h-20 md:h-24`
- Shape: `rounded-2xl`
- Letter badge: Absolute positioned, `w-12 h-12 rounded-full` in corner
- Hover state: Subtle scale transform (`hover:scale-105 transition-transform`)
- Selected state: Border highlight, no color change yet (handle color separately)

**Leaderboard**:
- Top 3: Podium-style display with larger cards (`h-48, h-56, h-48` for 2nd, 1st, 3rd)
- Remaining players: Ordered list with rank number, avatar, name, score
- Spacing: `gap-4` between entries, `p-6` within cards
- Badges: Small icons next to names for achievements

### Dashboard Components

**Lesson/Quiz Cards**:
- Size: `aspect-video` ratio with thumbnail preview area
- Layout: Image/icon top, title/description below
- Actions: Floating action menu (3-dot) on hover
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

**Statistics Panels**:
- Card-based: `rounded-lg border p-6`
- Layout: Icon + number stacked, label below
- Grid: `grid-cols-2 md:grid-cols-4 gap-4`

**Quiz Creation Form**:
- Single column layout: `max-w-2xl mx-auto`
- Input spacing: `space-y-6`
- Text area for lesson: `min-h-48`
- Section dividers: `border-b pb-6 mb-6`

### Forms & Inputs
- Input height: `h-12`
- Rounded corners: `rounded-lg`
- Focus rings: `ring-2 ring-offset-2`
- Button heights: Primary `h-12`, Secondary `h-10`, Small `h-8`

---

## Page-Specific Guidelines

### Authentication Pages
- Centered card layout: `max-w-md mx-auto py-24`
- Minimal branding: Logo + tagline at top
- Form: Single column, generous spacing (`space-y-4`)

### Teacher Dashboard
- Sidebar + main content area
- Top stats bar: 4 metric cards (`grid-cols-4`)
- Recent lessons: Horizontal scrolling cards or grid
- Quick actions: Floating action button for "Create New Lesson"

### Student Dashboard
- Card-based layout emphasizing "Join Game" action
- Recent games history: Timeline/list view
- Achievements/badges: Horizontal scrolling showcase
- Stats: Personal progress with visual graphs (simple bars/circles)

### Game Lobby
- Centered content: `max-w-3xl mx-auto`
- Game code: Hero element, copy button inline
- Players grid: Animated entry for new joiners
- Bottom bar: Host controls (Start Game, Settings, Cancel)

### Live Game View
- Question phase: Full-screen question + 4 answer grid
- Answer reveal: Brief animation, highlight correct answer
- Scoreboard: Quick slide-in showing current rankings
- Next question: Smooth transition with countdown

### Leaderboard View
- Celebratory layout with confetti/animation for winner
- Podium for top 3: Different heights (`h-32, h-48, h-40`)
- Full list below: Striped rows for readability
- "Play Again" / "Exit" buttons at bottom

---

## Images

**Hero Section** (Marketing/Landing Page if needed):
- Large hero image showcasing students engaged with devices
- Blurred background overlay with semi-transparent buttons
- Image dimensions: Full viewport width, `h-[600px]` minimum

**Dashboard Illustrations**:
- Empty state illustrations for "No lessons yet" scenarios
- Small decorative icons for lesson categories/subjects
- Avatar placeholders using initials for players without photos

**Game Assets**:
- Trophy/medal icons for leaderboard positions
- Badge/achievement icons (star, lightning, crown, etc.)
- Timer icon/animated circular progress

---

## Animations

**Use sparingly**:
- Answer reveal: Subtle color transition (0.3s)
- Player join: Gentle fade-in + slide-up (0.4s)
- Leaderboard update: Smooth position swap (0.5s)
- Correct answer: Brief scale pulse (0.2s)

**Avoid**: Excessive page transitions, distracting background animations, auto-playing elements