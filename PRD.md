# Tripzy - Travel Document Automation Platform

A passport and flight ticket scanning tool that automatically identifies and pre-fills required travel documents, saving travelers hours of manual form completion and protecting them from scam websites.

**Experience Qualities:**
1. **Trustworthy** - Every document links to verified government sources with confidence scores, giving users peace of mind that they're accessing legitimate forms.
2. **Effortless** - What normally takes 3 hours of researching requirements and filling forms now takes 10 minutes with AI-powered automation.
3. **Transparent** - Users see exactly what data was extracted, which fields are pre-filled, and what's missing, maintaining complete control over submission.

**Complexity Level**: Complex Application (advanced functionality, accounts)
- Multi-step document processing workflow with AI integration, user accounts with encrypted data storage, payment processing, admin dashboard, and affiliate tracking system.

## Essential Features

### Document Upload & Scanning
**Functionality**: Users upload passport, flight ticket, and optional supporting documents (hotel, bank statements) via drag-and-drop or file picker.
**Purpose**: Capture all necessary information to identify travel requirements and pre-fill forms.
**Trigger**: User lands on homepage and clicks "Start Your Trip" or navigates to upload page.
**Progression**: Land on hero page → Click "Start" → Upload passport image → Upload flight ticket → Optionally upload 3 more documents → AI processes uploads → Display extracted data
**Success Criteria**: Images successfully uploaded, AI extracts name, passport number, nationality, origin, destination, dates with 95%+ accuracy.

### AI Data Extraction & Verification
**Functionality**: AI scans documents to extract traveler information, then displays extracted data in editable form for user verification.
**Purpose**: Ensure accuracy before generating documents, giving users control and catching AI mistakes.
**Trigger**: After document upload completes.
**Progression**: AI processes images → Display extracted fields (name, passport, DOB, nationality, flight details) → Show warning "Please check carefully" → User edits any incorrect fields → User confirms "Yes, Proceed"
**Success Criteria**: All critical fields extracted and displayed, users can edit any field, confirmation required before proceeding.

### Requirements Analysis & Checklist
**Functionality**: AI determines required documents based on origin, destination, and nationality, then displays comprehensive checklist.
**Purpose**: Show travelers exactly what they need, preventing surprises at the airport.
**Trigger**: User confirms extracted data accuracy.
**Progression**: System analyzes route → Display categorized checklist (Exit Documents, Entry Documents, Physical Requirements, Optional) → Show affiliate pop-ups (eSIM, hotel, tours) → User ticks what they already have → Click "Proceed to Payment"
**Success Criteria**: Checklist accurately reflects country-specific requirements, users can mark items they possess, affiliate offers displayed contextually.

### Payment Processing
**Functionality**: Two-tier pricing (Standard $8-15 one-way, Premium $20 round-trip), multiple payment methods supported.
**Purpose**: Monetize document preparation service while offering round-trip convenience.
**Trigger**: User proceeds from requirements checklist.
**Progression**: Display pricing tiers with comparison → User selects Standard or Premium → Choose payment method (card/PayPal/crypto/GCash) → Enter payment details → Confirm payment → Process transaction
**Success Criteria**: Secure payment completed, receipt sent via email, documents unlocked for generation.

### AI Document Generation
**Functionality**: AI opens official government sites, pre-fills known fields, generates PDFs showing completed and blank fields.
**Purpose**: Save users hours of manual form completion while maintaining transparency about what's filled.
**Trigger**: Payment confirmation received.
**Progression**: Show "Processing..." screen → AI accesses official forms → Fill in available data → Identify missing fields → Generate annotated PDFs → Display completion screen
**Success Criteria**: All required documents generated as PDFs, missing fields clearly marked, official source links included, process completes in under 60 seconds.

### Document Delivery & Management
**Functionality**: Present completed documents as downloadable PDFs with official links, highlight missing information, allow users to tick off completed submissions.
**Purpose**: Provide organized delivery of all documents with clear next steps for users.
**Trigger**: AI document generation completes.
**Progression**: Display document checklist → Show warnings for missing fields per document → User downloads PDFs → User clicks official site links → User completes missing fields manually → User submits on government sites → User ticks checkbox when done
**Success Criteria**: All documents downloadable, official links verified and clickable, missing fields highlighted in yellow, completion tracking functional.

### User Account System
**Functionality**: Optional account creation for document history, saved passports, and premium features vs guest mode with session-only access.
**Purpose**: Enable returning users to save time while offering frictionless guest access.
**Trigger**: User can create account anytime or use as guest.
**Progression**: Guest uses app without signup → Or user creates account → Save encrypted passport data → Access trip history (30 days) → Re-download past documents → Premium users: auto-fill return trip
**Success Criteria**: Guest and registered modes work seamlessly, encrypted passport storage, trip history accessible, premium round-trip data retention functions correctly.

### Admin Dashboard
**Functionality**: Comprehensive admin interface for revenue tracking, user management, country requirements editing, affiliate monitoring, and support.
**Purpose**: Manage platform operations, update requirements as governments change rules, track business metrics.
**Trigger**: Admin user logs in with elevated permissions.
**Progression**: Admin login → View dashboard (revenue charts, user stats, affiliate performance) → Manage country requirements → Edit cultural guides → Handle support tickets → Generate reports
**Success Criteria**: Real-time metrics displayed, requirements editor saves changes, affiliate tracking accurate, support tickets manageable.

## Edge Case Handling

**Poor Quality Scans** - AI confidence score below 85% triggers warning, highlights uncertain fields in red, prompts user for manual verification
**Expired Passports** - Detected during scan, displays prominent warning before proceeding, blocks document generation with "Passport expires within 6 months" alert
**Multi-leg Flights** - System detects connecting countries, adds +$2 per connection, generates documents for each transit country
**Last-Minute Travel** - Departure within 48 hours adds +$3 surcharge, displays "expedited processing" badge
**Changed Requirements** - Shows last verified date on each document, displays "Requirements may have changed" warning if >30 days old
**Missing Required Fields** - Payment cannot proceed if critical fields (passport #, destination) couldn't be extracted
**Payment Failures** - Retry logic with alternative payment methods, support contact provided, transaction rolled back safely
**Unsupported Countries** - Shows "Requirements not available" message, offers manual research service, collects country request for future addition

## Design Direction

The design should feel professional, trustworthy, and internationally sophisticated - like a premium airline lounge experience digitized. Users should feel confident entrusting their sensitive passport data to the platform. The interface should be clean and uncluttered, allowing complex workflows to feel simple through progressive disclosure. Aim for a balance leaning toward minimal interface that lets content (documents, forms) take center stage while providing delightful micro-interactions during wait states.

## Color Selection

**Triadic** (energetic yet balanced) - Three colors evenly spaced on the color wheel representing trust (blue), warmth (peach), and success (green).

- **Primary Color**: Deep Navy Blue `oklch(0.25 0.08 250)` - Communicates trust, security, and professionalism essential for handling sensitive passport data. Used for headers, primary CTAs, and navigation.
- **Secondary Colors**: 
  - Warm Peach `oklch(0.78 0.12 45)` - Friendly, approachable warmth that softens the professional tone. Used for secondary buttons, highlights, and light mode accents.
  - Fresh Teal `oklch(0.65 0.10 180)` - Success and progress indicator. Used for completed items, verified badges, and positive confirmations.
- **Accent Color**: Vibrant Coral `oklch(0.68 0.18 25)` - Attention-grabbing for important CTAs like "Start Your Trip" and "Pay Now". Creates energy and urgency without anxiety.
- **Foreground/Background Pairings**:
  - Background (Very Light Cream `oklch(0.98 0.01 80)`): Dark Navy text `oklch(0.20 0.05 250)` - Ratio 11.2:1 ✓
  - Card (White `oklch(1 0 0)`): Dark Navy text `oklch(0.20 0.05 250)` - Ratio 13.8:1 ✓
  - Primary (Deep Navy `oklch(0.25 0.08 250)`): White text `oklch(1 0 0)` - Ratio 11.5:1 ✓
  - Secondary (Warm Peach `oklch(0.78 0.12 45)`): Dark Navy text `oklch(0.20 0.05 250)` - Ratio 9.2:1 ✓
  - Accent (Vibrant Coral `oklch(0.68 0.18 25)`): White text `oklch(1 0 0)` - Ratio 5.1:1 ✓
  - Muted (Light Gray `oklch(0.95 0.005 250)`): Medium Gray text `oklch(0.50 0.02 250)` - Ratio 7.8:1 ✓

## Font Selection

Typography should balance modern sans-serif clarity with a hint of personality that makes travelers feel excited about their journey. Fonts should be highly legible across languages and device sizes.

- **Primary**: Inter (headings, UI elements) - Clean, professional, excellent international character support
- **Secondary**: Source Sans Pro (body text, form labels) - Slightly warmer than Inter, optimized for lengthy reading
- **Monospace**: JetBrains Mono (passport numbers, booking codes) - Clear differentiation for alphanumeric codes

**Typographic Hierarchy**:
- H1 (Page Title): Inter Bold/32px/tight letter-spacing/-0.02em
- H2 (Section Headers): Inter SemiBold/24px/normal letter-spacing
- H3 (Card Titles): Inter Medium/18px/normal letter-spacing
- Body (Main Text): Source Sans Pro Regular/16px/1.6 line-height
- Small (Helper Text): Source Sans Pro Regular/14px/1.5 line-height
- Code (IDs, Numbers): JetBrains Mono Medium/14px/1.2 line-height

## Animations

Animations should feel purposeful and efficient - like a well-orchestrated airport operation. Every motion should communicate progress, guide attention, or provide reassuring feedback. Balance is key: subtle enough not to distract, meaningful enough to enhance understanding of the multi-step process.

**Purposeful Meaning**: Motion represents the journey metaphor - documents "flying" into view, checkmarks "landing" on completed items, progress bars "traveling" across the screen.

**Hierarchy of Movement**:
1. **Critical**: Upload progress, AI processing spinner, payment confirmation
2. **Important**: Page transitions, modal appearances, form validation
3. **Subtle**: Hover states, checkbox ticks, tooltip reveals

**Specific Animations**:
- **Document Upload**: Drag-drop zone scales up on hover (1.02), files slide up from bottom when added
- **AI Processing**: Pulsing gradient backdrop with rotating icon, feels alive but not anxious
- **Data Extraction**: Fields fade in sequentially (100ms stagger), yellow highlight flash on editable fields
- **Requirements Checklist**: Items cascade down (50ms stagger), check animations have satisfying "snap"
- **Payment Success**: Confetti burst (brief, celebratory), then smooth fade to documents screen
- **Document Download**: Slight "paper lift" on hover, download icon bounces on click
- **Page Transitions**: Smooth 300ms fade with subtle slide (20px), maintains spatial continuity

## Component Selection

**Components**: 
- **Upload**: Custom drag-drop zone with Card, enhanced file input styled as Button
- **Forms**: Input, Label, Checkbox, Select for data verification screen
- **Navigation**: Tabs for multi-step process indicator (Upload → Verify → Requirements → Pay → Documents)
- **Documents Display**: Card with Badge for verification status, Button for downloads/links
- **Payment**: Dialog for payment method selection, RadioGroup for plan selection
- **Notifications**: Sonner toasts for success/error states
- **Data Tables**: Table component for admin dashboard analytics
- **Charts**: Custom charts for revenue/affiliate tracking (admin)
- **Modals**: Dialog for affiliate pop-ups, AlertDialog for confirmation prompts

**Customizations**:
- **Progress Indicator**: Custom stepper component showing current position in 5-step flow
- **Document Card**: Custom component showing document title, completion status, missing fields warning, download/link buttons
- **Upload Zone**: Custom drag-drop area with animated border and preview thumbnails
- **Confidence Indicator**: Custom badge showing AI scan confidence percentage with color coding
- **Price Calculator**: Custom component showing dynamic pricing breakdown based on complexity

**States**:
- **Buttons**: Default has subtle shadow, hover lifts 2px with darker shadow, active presses down, disabled grays out at 50% opacity
- **Inputs**: Default has border, focus adds ring and accent border color, error shows red border with shake animation, success shows green check icon
- **Cards**: Default has subtle border, hover elevates with shadow, selected has accent border glow
- **Checkboxes**: Smooth check animation with slight bounce, indeterminate state for partial completion

**Icon Selection**:
- Upload: CloudArrowUp (upload zone), File (document types)
- Verification: CheckCircle (verified), Warning (low confidence), PencilSimple (edit)
- Requirements: ListChecks (checklist), Airplane (travel), Shield (security)
- Payment: CreditCard (card payment), Wallet (digital wallets), Lock (security)
- Documents: FilePdf (download), ArrowSquareOut (external link), Clock (last verified)
- Admin: ChartLine (analytics), Users (user management), Gear (settings)
- Navigation: CaretLeft/CaretRight (pagination), MagnifyingGlass (search)

**Spacing**:
- Section padding: p-8 (desktop), p-4 (mobile)
- Card padding: p-6
- Element gaps: gap-4 (general), gap-2 (tight groupings), gap-8 (major sections)
- Form field spacing: space-y-4
- Grid columns: grid-cols-1 (mobile), grid-cols-2 (tablet), grid-cols-3 (desktop)

**Mobile**:
- **Upload**: Single column, larger touch targets (min 44px), bottom sheet for file picker
- **Stepper**: Horizontal scroll with snap points, shows current + adjacent steps only
- **Requirements**: Accordion-style collapsible sections instead of all visible
- **Payment**: Stacked plan cards instead of side-by-side comparison
- **Documents**: Full-width cards, sticky download button at bottom
- **Admin**: Hamburger menu, prioritize key metrics on dashboard, detailed tables accessible via drill-down
