# Settings & Profile Screen - Visual Guide

## Screen Layout

The Settings & Profile screen follows a clean, card-based layout with clear visual hierarchy and proper spacing.

### Overall Structure
```
┌─────────────────────────────────────┐
│  ← Paramètres & Profil              │  <- Header (blue background)
├─────────────────────────────────────┤
│                                     │
│  PROFIL AGENT                       │  <- Section label
│  ┌─────────────────────────────┐   │
│  │ 👤  Alexandre Dupont        │   │  <- Profile Card
│  │     Nom                     │   │
│  │ ─────────────────────────   │   │
│  │ 🎫  AG-12345                │   │
│  │     Identifiant Agent       │   │
│  └─────────────────────────────┘   │
│                                     │
│  PARAMÈTRES DE SYNCHRONISATION      │  <- Section label
│  ┌─────────────────────────────┐   │
│  │ Synchroniser en Wi-Fi       │   │  <- Sync Settings
│  │ uniquement               ○  │   │     (with toggle)
│  │ Économise les données       │   │
│  │ mobiles                     │   │
│  └─────────────────────────────┘   │
│                                     │
│  À PROPOS                           │  <- Section label
│  ┌─────────────────────────────┐   │
│  │ Version de l'application    │   │  <- About Card
│  │                       1.2.3 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🚪  Déconnexion            │   │  <- Logout Button
│  └─────────────────────────────┘   │     (danger styling)
│                                     │
└─────────────────────────────────────┘
```

## Component Breakdown

### 1. Profile Card

#### Visual Specifications
- **Background:** White (#FFFFFF)
- **Border Radius:** 12px
- **Elevation:** 2
- **Padding:** 16px (card) + 8px vertical (content)
- **Margin Bottom:** 24px

#### Layout Details
Each info row contains:
- **Icon Container:** 
  - Size: 48x48px
  - Background: Light blue (#E3F2FD)
  - Border Radius: 24px (circular)
  - Icon Size: 24px
  - Icon Color: Primary blue (#2196F3)

- **Info Content:**
  - Value Text: 
    - Font Size: bodyLarge
    - Color: #212121
    - Font Weight: 500
  - Label Text:
    - Font Size: bodySmall
    - Color: #757575
    - Margin Top: 4px

- **Divider:** 
  - Height: 1px
  - Color: #E0E0E0
  - Margin: 4px vertical

#### Icons Used
- Row 1: `account` (user icon)
- Row 2: `badge-account` (ID badge icon)

### 2. Sync Settings Card

#### Visual Specifications
- **Background:** White (#FFFFFF)
- **Border Radius:** 12px
- **Elevation:** 2
- **Padding:** 16px (card) + 8px vertical (content)
- **Margin Bottom:** 24px

#### Layout Details
Single row contains:
- **Text Content (Left):**
  - Title: 
    - Font Size: bodyLarge
    - Color: #212121
    - Font Weight: 500
  - Description:
    - Font Size: bodySmall
    - Color: #757575
    - Margin Top: 4px

- **Switch (Right):**
  - Track Color (off): #E0E0E0
  - Track Color (on): #90CAF9
  - Thumb Color (off): #F5F5F5
  - Thumb Color (on): #2196F3
  - Minimum Touch Target: 44px

### 3. About App Card

#### Visual Specifications
- **Background:** White (#FFFFFF)
- **Border Radius:** 12px
- **Elevation:** 2
- **Padding:** 16px (card) + 8px vertical (content)
- **Margin Bottom:** 24px

#### Layout Details
Single row with:
- **Label (Left):**
  - Font Size: bodyLarge
  - Color: #212121
  - Font Weight: 400

- **Value (Right):**
  - Font Size: bodyLarge
  - Color: #757575
  - Font Weight: 500

### 4. Logout Button

#### Visual Specifications
- **Background:** Light red (#FFEBEE)
- **Border:** 1px solid #FFCDD2
- **Border Radius:** 12px
- **Elevation:** 1
- **Height:** 56px
- **Padding:** 16px vertical, 20px horizontal

#### Layout Details
Centered content with:
- **Icon:**
  - Name: `logout`
  - Size: 24px
  - Color: #D32F2F (red)

- **Text:**
  - Font Size: bodyLarge
  - Color: #D32F2F (red)
  - Font Weight: 600
  - Margin Left: 12px from icon

#### States
- **Normal:** Full opacity, enabled
- **Disabled:** 50% opacity, no interaction
- **Pressed:** Slightly darker background (handled by TouchableOpacity)

## Section Labels

### Visual Specifications
- **Font Size:** labelSmall
- **Color:** #9E9E9E (gray)
- **Font Weight:** 600
- **Letter Spacing:** 0.5
- **Margin Bottom:** 8px
- **Margin Left:** 4px
- **Text Transform:** Uppercase

### Labels Used
1. "PROFIL AGENT"
2. "PARAMÈTRES DE SYNCHRONISATION"
3. "À PROPOS"

## Screen Container

### Visual Specifications
- **Background:** Light gray (#F5F5F5)
- **Safe Area:** Bottom edge only
- **Content Padding:** 16px all sides
- **Bottom Padding:** 32px (extra for scroll)

### Scroll Behavior
- Vertical scroll enabled
- No horizontal scroll
- Hide scroll indicator
- Bounce effect on over-scroll

## Color Palette

### Primary Colors
- **Primary Blue:** #2196F3 (icons, accents)
- **Light Blue:** #E3F2FD (icon backgrounds)
- **Very Light Blue:** #90CAF9 (switch track active)

### Text Colors
- **Primary Text:** #212121 (dark gray)
- **Secondary Text:** #757575 (gray)
- **Muted Text:** #9E9E9E (light gray)

### Danger Colors
- **Danger Red:** #D32F2F (logout button)
- **Light Red:** #FFEBEE (logout background)
- **Border Red:** #FFCDD2 (logout border)

### Background Colors
- **Screen Background:** #F5F5F5 (light gray)
- **Card Background:** #FFFFFF (white)
- **Divider:** #E0E0E0 (light gray)

### State Colors
- **Switch Off Track:** #E0E0E0
- **Switch Off Thumb:** #F5F5F5
- **Switch On Track:** #90CAF9
- **Switch On Thumb:** #2196F3

## Typography Scale

### Variants Used
- **labelSmall:** Section titles (uppercase)
- **bodyLarge:** Primary values, settings titles
- **bodySmall:** Secondary labels, descriptions

### Font Weights
- **400:** Regular (labels)
- **500:** Medium (values, setting titles)
- **600:** Semi-bold (section labels, button text)

## Spacing System

### Vertical Spacing
- **Section margin bottom:** 24px
- **Card padding vertical:** 8px (content)
- **Row padding vertical:** 12px
- **Icon to text margin:** 16px
- **Text label margin top:** 4px
- **Divider margin vertical:** 4px

### Horizontal Spacing
- **Screen padding:** 16px
- **Card padding:** 16px
- **Button padding horizontal:** 20px
- **Icon to text margin:** 12-16px

### Component Heights
- **Min touch target:** 44px (iOS) / 48px (Android)
- **Info row min height:** 60px
- **Button height:** 56px
- **Icon container:** 48x48px

## Shadow & Elevation

### Card Shadows
```
shadowColor: '#000'
shadowOffset: { width: 0, height: 1 }
shadowOpacity: 0.1
shadowRadius: 3
elevation: 2 (Android)
```

### Button Shadows
```
shadowColor: '#000'
shadowOffset: { width: 0, height: 1 }
shadowOpacity: 0.05
shadowRadius: 2
elevation: 1 (Android)
```

## Responsive Behavior

### Small Screens (< 375px width)
- Maintains all minimum sizes
- Text may wrap naturally
- Scroll enabled for overflow
- All touch targets remain adequate

### Large Screens (> 768px width)
- Content remains left-aligned
- Cards maintain max-width if needed
- Extra padding on sides possible
- Same vertical spacing

### Landscape Orientation
- Scroll enabled
- Content flows vertically
- No horizontal layout changes
- Same spacing maintained

## Accessibility Features

### Touch Targets
- All interactive elements ≥ 44px
- Adequate spacing between targets
- Clear visual feedback on press

### Screen Reader Support
- All elements have labels
- Roles properly defined
- State changes announced
- Hints provided for actions

### Visual Clarity
- High contrast ratios (WCAG AA)
- Clear text hierarchy
- Consistent iconography
- Obvious interactive elements

## Animation & Transitions

### Switch Toggle
- Smooth transition (native)
- Color change animated
- Thumb position animated
- Duration: ~200ms

### Button Press
- Opacity feedback (TouchableOpacity)
- Quick response time
- No delay in interaction

### Screen Loading
- Activity indicator centered
- Smooth fade-in when content loads
- No jarring layout shifts

## States & Feedback

### Loading State
- Full-screen activity indicator
- Centered vertically and horizontally
- Primary blue color
- No other content visible

### Error State
- Alert dialogs for errors
- Clear error messages
- Action buttons provided

### Empty State
- Profile card doesn't render if no user
- Other components still visible
- Graceful degradation

### Confirmation Dialog
- Alert for logout action
- Clear title and message
- Two actions: Cancel, Logout
- Destructive action styled appropriately

## Platform Differences

### iOS
- Switch uses iOS native styling
- Touch targets minimum 44px
- Smooth animations
- System fonts

### Android
- Material Design switch
- Touch targets minimum 48px
- Material elevation
- Roboto fonts

## Implementation Notes

### SafeAreaView
- Applied to screen container
- Edges: bottom only
- Prevents content below navigation bar

### ScrollView
- Content grows vertically
- showsVerticalScrollIndicator: false
- Keyboard avoidance if needed

### Cards
- Material Design card component
- Consistent styling
- Proper elevation
- Shadow support

This visual guide ensures consistent implementation across the application and provides clear specifications for future maintenance and updates.
