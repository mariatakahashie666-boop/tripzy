# Mobile/Desktop Auto-Detection Feature

## Overview
This application now includes automatic device detection that optimizes the user experience based on whether users are accessing from a mobile phone or desktop computer.

## What's Detected

The app automatically detects:
- **Mobile devices**: Phones and tablets (screen width < 768px)
- **Desktop devices**: Laptops and desktop computers (screen width >= 768px)

## User-Facing Features

### Visual Indicators
1. **Device Indicator Badge** (Top-right corner, auto-hides after 8 seconds)
   - Shows "Mobile Mode - Camera optimized" on phones
   - Shows "Desktop Mode - File upload ready" on desktop
   
2. **Hero Page Detection**
   - Displays device-specific message for 5 seconds
   - Mobile: "Mobile device detected - Camera scanning optimized"
   - Desktop: "Desktop detected - File upload optimized"

### Optimized Behaviors

#### Document Upload Page
**Mobile Users:**
- Camera opens directly when tapping "Open Camera" buttons
- Only image files accepted (camera photos)
- Simplified instructions: "Use your camera to scan"
- Button text: "Open Camera" / "Retake Photo"
- File input uses `capture="environment"` attribute for rear camera

**Desktop Users:**
- Standard file picker opens
- Both images and PDFs accepted
- Instructions: "Upload images from your computer"
- Button text: "Upload Passport" / "Change Passport"
- Drag-and-drop functionality enabled

#### Data Verification Page
**Mobile Users:**
- Compact layout message: "Please check carefully"
- Shows "Mobile layout optimized for easy editing" hint
- Touch-optimized input fields

**Desktop Users:**
- Full layout message: "Please check very carefully"
- Standard form layout with desktop-optimized spacing

## Technical Implementation

### Hook Usage
The app uses the pre-built `useIsMobile()` hook from `@/hooks/use-mobile`:

```typescript
import { useIsMobile } from '@/hooks/use-mobile'

function MyComponent() {
  const isMobile = useIsMobile()
  
  return (
    <div>
      {isMobile ? 'Mobile View' : 'Desktop View'}
    </div>
  )
}
```

### How It Works
- Breakpoint: 768px (standard mobile/tablet cutoff)
- Updates reactively when window is resized
- Uses `matchMedia` API for efficient detection
- No external dependencies required

### Components Using Detection
1. `Hero.tsx` - Device-specific welcome messages
2. `DocumentUpload.tsx` - Camera vs file upload optimization
3. `DataVerification.tsx` - Layout and messaging adjustments
4. `DeviceIndicator.tsx` - Floating notification badge
5. `App.tsx` - Global device indicator integration

## Benefits

### For Mobile Users
✅ Direct camera access with one tap
✅ Optimized for capturing photos of documents
✅ Rear camera automatically selected
✅ Simpler, touch-friendly interface
✅ No confusion about file formats

### For Desktop Users
✅ Full file browser access
✅ Drag-and-drop file uploads
✅ Support for PDFs and images
✅ Larger screen real estate utilized
✅ Multi-file selection support

## Future Enhancements
- Orientation detection (portrait/landscape)
- Camera resolution optimization per device
- Progressive image compression for mobile
- Offline mode detection
- Network speed detection for upload optimization
