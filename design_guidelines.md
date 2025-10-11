# Scholarship Management Application - Design Guidelines

## Design Approach: Material Design System

**Justification**: This educational platform is utility-focused and information-dense, requiring clear data presentation, efficient form handling, and intuitive navigation. Material Design provides the robust component patterns needed for scholarship management while maintaining professional credibility.

**Key Design Principles**:
- Clarity over decoration - prioritize readability and scannability
- Efficient information hierarchy for quick scholarship discovery
- Trust-building through professional, academic aesthetic
- Responsive layouts optimized for both mobile browsing and desktop data management

---

## Color Palette

**Light Mode**:
- Primary: 220 85% 45% (Educational blue - trustworthy, professional)
- Primary Light: 220 75% 65% (for hover states)
- Secondary: 200 20% 35% (Slate for text and borders)
- Background: 0 0% 98% (Soft white)
- Surface: 0 0% 100% (Pure white for cards)
- Success: 145 65% 42% (For accepted/eligible indicators)
- Warning: 35 90% 55% (Deadline alerts)
- Error: 0 75% 50% (Ineligible/missing requirements)

**Dark Mode**:
- Primary: 220 85% 60% (Brighter blue for contrast)
- Secondary: 200 15% 65% (Lighter slate)
- Background: 220 15% 10% (Deep navy-black)
- Surface: 220 12% 14% (Elevated cards)
- Maintain same success/warning/error hues, adjust lightness to 55-65%

---

## Typography

**Font Stack**: 
- Primary: 'Inter' (Google Fonts) - exceptional readability for UI and data
- Monospace: 'JetBrains Mono' - for IDs, codes, or data fields

**Scale & Usage**:
- **Headings**: 
  - H1: text-4xl font-bold (Dashboard titles, page headers)
  - H2: text-2xl font-semibold (Section headers, scholarship titles)
  - H3: text-xl font-medium (Card headers, subsections)
- **Body**: 
  - Base: text-base (16px) font-normal - paragraph text
  - Small: text-sm - metadata, helper text
  - XSmall: text-xs - timestamps, secondary info
- **Interactive**: font-medium for buttons, font-semibold for active nav items

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12, 16, 20** for consistent rhythm
- Component padding: p-6, p-8
- Section spacing: space-y-8, gap-6
- Card margins: m-4, m-6
- Container max-width: max-w-7xl for content areas

**Grid Structure**:
- Dashboard: 12-column grid with 16-unit gutters
- Scholarship cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Admin tables: Full-width responsive with horizontal scroll on mobile
- Forms: Single column on mobile, 2-column on desktop (md:grid-cols-2)

---

## Component Library

**Navigation**:
- Top navbar: Fixed header with logo, search bar, user menu
- Student sidebar: Dashboard, Browse Scholarships, My Profile, Saved
- Admin sidebar: Dashboard, Manage Scholarships, Student Records, Analytics
- Breadcrumbs for deep navigation in admin panel

**Data Display**:
- Scholarship cards: Image thumbnail, title, amount, deadline badge, quick eligibility indicator
- Data tables: Sortable headers, pagination, row actions (edit/delete for admin)
- Student profile cards: Avatar, key stats, eligibility match score
- Stats widgets: Clean metric cards with icon, value, label

**Forms & Inputs**:
- Text inputs: Outlined style with floating labels
- Dropdowns: Material-style select with search for long lists
- Date pickers: Calendar popover for deadlines
- File upload: Drag-and-drop zone for documents
- Checkboxes/Radio: Prominent, accessible sizing (min 20px touch target)

**Interactive Elements**:
- Primary CTAs: Solid background with primary color, rounded-lg
- Secondary actions: Outlined buttons with border-2
- Filter chips: Pill-shaped toggles for scholarship filtering
- Toast notifications: Slide in from top-right for success/error states

**Overlays**:
- Modal dialogs: For scholarship details, profile editing (max-w-2xl)
- Confirmation dialogs: For admin delete actions (max-w-md)
- Drawer panels: Slide-in from right for advanced filters

---

## Animations

**Minimal, Purposeful Motion**:
- Page transitions: None - instant navigation for efficiency
- Card hovers: Subtle translate-y-1 + shadow-lg (150ms ease)
- Filter/search: Staggered fade-in for results (100ms delay per item, max 5 items)
- Loading states: Skeleton screens (no spinners) with shimmer effect
- Form validation: Shake animation (300ms) for errors

---

## Images

**Hero Section**: 
- Full-width banner on homepage (h-64 md:h-96) featuring diverse students studying/graduating
- Gradient overlay (from 220 50% 10% to transparent) for text contrast
- Position: bg-center bg-cover

**Scholarship Cards**:
- Thumbnail images (aspect-square, max h-40) representing institution or field of study
- Fallback: Gradient backgrounds matching category (STEM, Arts, Business, etc.)

**Profile Avatars**:
- Circular student photos (w-16 h-16 for cards, w-32 h-32 for full profile)
- Fallback: Initials on colored background using primary palette

**Empty States**:
- Illustration-style graphics for "No scholarships found" or "Complete your profile"
- Centered, max-w-md with actionable CTA below

---

## Platform-Specific Considerations

**Student Portal**: 
- Focus on discovery and ease of access
- Large, tappable cards optimized for mobile browsing
- Persistent search/filter bar
- "Match score" visual indicator (progress ring) showing eligibility percentage

**Admin Dashboard**:
- Dense data tables prioritized for desktop workflow
- Batch action toolbars for managing multiple scholarships
- Analytics charts using simple bar/line graphs (Chart.js)
- Quick-add floating action button (bottom-right) for new scholarships

**Accessibility**:
- WCAG AA compliant contrast ratios (4.5:1 minimum)
- Keyboard navigation for all interactive elements
- ARIA labels for icon-only buttons
- Focus indicators: ring-4 ring-primary/50