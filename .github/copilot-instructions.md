# Tripzy - GitHub Copilot Instructions

## Project Overview

Tripzy is a travel document automation platform built on GitHub Spark that helps travelers:
- Scan and extract data from passports and flight tickets
- Automatically identify required travel documents based on nationality, origin, and destination
- Pre-fill government forms with extracted information
- Track document completion and submission

This is a complex application with multi-step document processing workflow, AI integration for document scanning, user accounts with encrypted data storage, and comprehensive travel requirements analysis.

## Technology Stack

### Core Technologies
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4 with Radix UI components
- **GitHub Spark**: Runtime integration for LLM and storage via `@github/spark` package
- **AI**: GPT-4o vision for document scanning and data extraction
- **UI Components**: shadcn/ui component library with Radix UI primitives

### Key Dependencies
- React 19 with hooks patterns (prefer hooks over class components)
- TypeScript for type safety
- Tailwind CSS 4 for styling with utility classes
- Framer Motion for animations
- React Hook Form with Zod for form validation
- date-fns for date manipulation
- Sonner for toast notifications

## Development Workflow

### Setup
```bash
npm install              # Install dependencies
npm run dev             # Start development server on http://localhost:5000
npm run build           # Build for production (TypeScript compilation + Vite build)
npm run lint            # Run ESLint
```

### Important Notes
- The development server runs on port 5000 (not the default Vite port)
- TypeScript compilation uses `--noCheck` flag during build
- There is NO test infrastructure in this repository currently - do not add tests unless explicitly requested

## Code Standards & Patterns

### React Patterns
- Use functional components with hooks exclusively
- Prefer React 19 patterns and features
- Use custom hooks for shared logic (see `src/hooks/`)
- Components should be organized by feature/responsibility
- Use TypeScript for all components with proper typing

### File Organization
```
src/
├── components/          # React components (organized by feature)
├── lib/                # Utility functions and services
│   ├── ai-service.ts   # AI/LLM integration for document scanning
│   ├── constants.ts    # Application constants
│   └── utils.ts        # General utilities
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── styles/             # CSS and theme files
```

### Styling Guidelines
- Use Tailwind CSS utility classes for styling
- Follow the design system defined in PRD.md:
  - Primary: Deep Navy Blue `oklch(0.25 0.08 250)`
  - Secondary: Warm Peach `oklch(0.78 0.12 45)` and Fresh Teal `oklch(0.65 0.10 180)`
  - Accent: Vibrant Coral `oklch(0.68 0.18 25)`
- Responsive design: mobile-first approach
- Use Radix UI components for accessible UI primitives
- Maintain WCAG AAA contrast ratios as specified in PRD

### TypeScript Guidelines
- Avoid using `any` type - use proper types or `unknown` if necessary
- Define types in `src/types/` for shared interfaces
- Use `@ts-expect-error` instead of `@ts-ignore` with explanatory comments
- Remove unused imports and variables

### Animation Guidelines
- Use Framer Motion for complex animations
- Keep animations purposeful and efficient (see PRD.md Animations section)
- Balance: subtle enough not to distract, meaningful enough to enhance understanding
- Follow the journey metaphor (documents "flying", checkmarks "landing", etc.)

## GitHub Spark Integration

### Spark Runtime
The Spark runtime is initialized in `src/main.tsx` with:
```typescript
import "@github/spark/spark"
```

This provides the global `window.spark` object with:
- **LLM Integration**: `window.spark.llm` for AI calls
- **Key-Value Storage**: `window.spark.kv` for persistent storage
- **User Management**: `window.spark.user` for authentication

### Configuration Files
- `spark.meta.json` - Spark metadata (templateVersion: 1, dbType: kv)
- `runtime.config.json` - Runtime app configuration
- `.spark-initial-sha` - Initial commit tracking
- `vite.config.ts` - Contains Spark-specific Vite plugins

## Key Features & Domain Knowledge

### Document Processing Flow
1. **Upload** → User uploads passport and flight ticket images
2. **AI Extraction** → GPT-4o vision extracts data from documents
3. **Verification** → User verifies and corrects extracted data
4. **Requirements Analysis** → AI determines required documents based on:
   - Nationality
   - Origin (departure point)
   - Destination
   - Transit countries (for multi-leg flights)
5. **Payment** → User pays for document generation service
6. **Generation** → AI pre-fills government forms
7. **Delivery** → User downloads PDFs and completes missing fields

### Critical Business Logic
- **Country-specific requirements**: Always analyze nationality + origin + destination
- **Transit requirements**: For layovers, consider duration and nationality-specific exemptions
- **Philippines eTravel**: ONLY required for passengers departing FROM the Philippines
- **Confidence scoring**: AI extractions below 85% confidence trigger warnings
- **Multi-leg flights**: Support for connecting flights with transit visa requirements

### Security Considerations
- Handle passport data with encryption
- Never commit secrets or API keys
- Validate all user inputs
- Sanitize AI-generated content before display

## Linting & Build Process

### Current Linting Status
The repository has existing linting errors that are not blocking (35 errors, 6 warnings as of last check). When making changes:
- Fix linting issues in files you modify
- Do not modify unrelated files to fix their linting issues
- Common issues to avoid:
  - Unused variables and imports
  - `any` types (use proper typing)
  - `@ts-ignore` (use `@ts-expect-error` with comments)

### Build Process
1. TypeScript compilation with `--noCheck` flag
2. Vite build for production bundle
3. Icon optimization via `vitePhosphorIconProxyPlugin`
4. Output to `dist/` directory

## Documentation

### Key Documentation Files
- **README.md**: Project overview, setup, and technology stack
- **PRD.md**: Comprehensive product requirements, features, and design specifications
- **MOBILE_DETECTION.md**: Mobile detection implementation details
- **THEME_UPDATE.md**: Theme and styling updates
- **SECURITY.md**: Security policies and reporting

### When Making Changes
- Update README.md if changing setup or architecture
- Refer to PRD.md for design decisions and feature requirements
- Follow the design direction and color/font specifications in PRD.md

## Common Tasks

### Adding a New Component
1. Create component file in `src/components/`
2. Use TypeScript with proper prop types
3. Follow existing component patterns (functional + hooks)
4. Use Tailwind CSS for styling
5. Import and use shadcn/ui components where appropriate

### Adding AI Features
- Use `src/lib/ai-service.ts` for AI/LLM interactions
- Access Spark LLM via `window.spark.llm`
- Handle errors and loading states
- Show confidence scores for AI extractions

### Modifying Styles
- Edit Tailwind classes in components
- For theme changes, see `tailwind.config.js`
- Maintain design system consistency per PRD.md
- Test responsive behavior on mobile and desktop

## Edge Cases to Consider

- Poor quality document scans (confidence < 85%)
- Expired passports (< 6 months validity)
- Multi-leg flights with transit countries
- Last-minute travel (< 48 hours)
- Missing required fields in documents
- Unsupported countries
- Cross-country document rules (e.g., Philippines eTravel only for departures FROM Philippines)

## What NOT to Do

- Do not add test infrastructure unless explicitly requested
- Do not modify files in `node_modules/` or `dist/`
- Do not remove or modify working code without clear reason
- Do not add new dependencies without careful consideration
- Do not commit build artifacts or temporary files
- Do not expose sensitive data or API keys
- Do not modify `.github/agents/` files (reserved for agent configurations)

## Getting Help

- Review PRD.md for product requirements and design specifications
- Check existing components for patterns and examples
- Refer to README.md for setup and architecture overview
- Look at `src/lib/constants.ts` for application constants and configuration
