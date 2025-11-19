# Visual Guide - Patient Input with Bottom Sheet

## Overview

This document provides a visual guide for the new Patient Picker with Bottom Sheet implementation in the Nouvelle Consultation screen.

## Implementation Summary

**Issue:** #[Issue Number] - Intégration d'un input patient avec bottom sheet sur l'écran NouvelleConsultation

**Changes Made:**
- Replaced Modal-based `PatientPicker` with Bottom Sheet implementation
- Added debounced search functionality (300ms)
- Integrated with Apollo Client for real patient data
- Improved keyboard management and accessibility
- Added "Create new patient" button in empty states

## Visual Comparison

### Before: Modal Implementation

The previous implementation used a full-screen Modal for patient selection:

```
┌─────────────────────────────┐
│  [Patient Input Field]      │ ← Tapping opens full-screen modal
│  ▼ Créer un nouveau patient │
└─────────────────────────────┘

When tapped, opens:
┌─────────────────────────────┐
│ Sélectionner un patient  [X]│ ← Full screen modal
│ ┌─────────────────────────┐ │
│ │ 🔍 Rechercher...        │ │
│ └─────────────────────────┘ │
│                             │
│  Jean Dupont                │
│  PAT-001                 >  │
│  ────────────────────────   │
│  Marie Martin               │
│  PAT-002                 >  │
│  ────────────────────────   │
│  Pierre Bernard             │
│  PAT-003                 >  │
└─────────────────────────────┘
```

### After: Bottom Sheet Implementation

The new implementation uses a bottom sheet that slides up from the bottom:

```
┌─────────────────────────────┐
│  Patient                    │
│  ┌───────────────────────┐  │
│  │ 🔍 Nom ou identifiant │  │ ← Tapping opens bottom sheet
│  └───────────────────────┘  │
│  ➕ Créer un nouveau patient│
│                             │
│  Date et Heure              │
└─────────────────────────────┘
        ⬇️ Slides up
┌─────────────────────────────┐
│ [Main content dimmed]       │
│                             │
│ ╔═══════════════════════╗   │
│ ║ Sélectionner un patient║ [X]
│ ║ ┌───────────────────┐ ║   │
│ ║ │🔍 Rechercher un...│ ║   │
│ ║ └───────────────────┘ ║   │
│ ║                       ║   │
│ ║ Awa Traoré            ║   │
│ ║ PAT-001            >  ║   │
│ ║ ───────────────────── ║   │
│ ║ Moussa Diop           ║   │
│ ║ PAT-002            >  ║   │
│ ╚═══════════════════════╝   │
└─────────────────────────────┘
```

## Screen Components

### 1. Input Field (Closed State)

```
┌─────────────────────────────────┐
│ Patient                         │ ← Label
│ ┌─────────────────────────────┐ │
│ │ 🔍 Nom ou identifiant du    │ │ ← Placeholder
│ │    patient                  │ │
│ └─────────────────────────────┘ │
│ ➕ Créer un nouveau patient     │ ← Quick action
└─────────────────────────────────┘
```

**When Patient Selected:**

```
┌─────────────────────────────────┐
│ Patient                         │
│ ┌─────────────────────────────┐ │
│ │ Awa Traoré          ⊗       │ │ ← Selected patient + clear
│ │ PAT-001                     │ │    button
│ └─────────────────────────────┘ │
│ ➕ Créer un nouveau patient     │
└─────────────────────────────────┘
```

### 2. Bottom Sheet (Expanded State)

```
┌─────────────────────────────────────┐
│                                     │
│ [Main screen content - dimmed]      │
│                                     │
│ ╔═══════════════════════════════════╗
│ ║ Sélectionner un patient       [X] ║ ← Header
│ ║                                   ║
│ ║ ┌───────────────────────────────┐ ║
│ ║ │ 🔍 Rechercher un utilisateur  │ ║ ← Search input
│ ║ └───────────────────────────────┘ ║
│ ║                                   ║
│ ║ ┌───────────────────────────────┐ ║
│ ║ │ Awa Traoré                 >  │ ║
│ ║ │ PAT-001                       │ ║
│ ║ └───────────────────────────────┘ ║
│ ║ ┌───────────────────────────────┐ ║
│ ║ │ Moussa Diop                >  │ ║
│ ║ │ PAT-002                       │ ║
│ ║ └───────────────────────────────┘ ║
│ ║ ┌───────────────────────────────┐ ║
│ ║ │ Fatou Kante                >  │ ║
│ ║ │ PAT-003                       │ ║
│ ║ └───────────────────────────────┘ ║
│ ╚═══════════════════════════════════╝
└─────────────────────────────────────┘
```

### 3. Bottom Sheet - Loading State

```
╔═══════════════════════════════════╗
║ Sélectionner un patient       [X] ║
║                                   ║
║ ┌───────────────────────────────┐ ║
║ │ 🔍 Rechercher un utilisateur  │ ║
║ └───────────────────────────────┘ ║
║                                   ║
║         ⏳                         ║ ← Loading spinner
║   Recherche en cours...           ║
║                                   ║
╚═══════════════════════════════════╝
```

### 4. Bottom Sheet - No Results State

```
╔═══════════════════════════════════╗
║ Sélectionner un patient       [X] ║
║                                   ║
║ ┌───────────────────────────────┐ ║
║ │ 🔍 xyz123                     │ ║ ← Search query
║ └───────────────────────────────┘ ║
║                                   ║
║         🔍                         ║ ← Empty icon
║   Aucun patient trouvé            ║
║                                   ║
║ ┌───────────────────────────────┐ ║
║ │  ➕ Créer un nouveau patient  │ ║ ← Action button
║ └───────────────────────────────┘ ║
╚═══════════════════════════════════╝
```

### 5. Bottom Sheet - Initial Empty State

```
╔═══════════════════════════════════╗
║ Sélectionner un patient       [X] ║
║                                   ║
║ ┌───────────────────────────────┐ ║
║ │ 🔍 Rechercher un utilisateur  │ ║
║ └───────────────────────────────┘ ║
║                                   ║
║         🔍                         ║
║   Recherchez un patient par       ║
║   nom ou identifiant              ║
║                                   ║
╚═══════════════════════════════════╝
```

## Interaction Flow

### Flow 1: Selecting a Patient

```
1. User taps input field
   ↓
2. Bottom sheet slides up with patient list
   ↓
3. User types in search field (debounced 300ms)
   ↓
4. Patient list filters dynamically
   ↓
5. User taps a patient from the list
   ↓
6. Bottom sheet closes, selected patient appears in input
   ↓
7. Keyboard dismisses automatically
```

### Flow 2: Creating a New Patient (from search)

```
1. User searches for "Jean Martin"
   ↓
2. No results found
   ↓
3. "Créer un nouveau patient" button appears
   ↓
4. User taps button
   ↓
5. Bottom sheet closes
   ↓
6. Navigate to patient creation screen
```

### Flow 3: Creating a New Patient (direct)

```
1. User taps "Créer un nouveau patient" link below input
   ↓
2. Navigate to patient creation screen
```

### Flow 4: Closing Bottom Sheet

Multiple ways to close:
- Tap [X] button in header
- Pull down gesture on bottom sheet
- Tap dimmed background/backdrop
- Press Android back button
- Select a patient

## Design Specifications

### Colors

| Element | Color | Hex |
|---------|-------|-----|
| Primary (Blue) | Blue | `#2196F3` |
| Text Primary | Dark Gray | `#212121` |
| Text Secondary | Medium Gray | `#757575` |
| Text Placeholder | Light Gray | `#9E9E9E` |
| Border | Light Gray | `#E0E0E0` |
| Error | Red | `#D32F2F` |
| Background | White | `#FFFFFF` |
| Empty BG | Light Gray | `#F5F5F5` |

### Typography

| Element | Font Size | Weight |
|---------|-----------|--------|
| Label | 14px | 600 (Semi-bold) |
| Input Text | 16px | 400 (Regular) |
| Placeholder | 16px | 400 (Regular) |
| Patient Name | 16px | 500 (Medium) |
| Patient Number | 14px | 400 (Regular) |
| Sheet Title | 20px | 700 (Bold) |
| Empty Text | 16px | 400 (Regular) |

### Spacing

| Element | Padding/Margin |
|---------|----------------|
| Container Bottom | 16px |
| Label Bottom | 8px |
| Input Padding | 12px |
| Sheet Header | 16px (horizontal), 12px (vertical) |
| Search Container | 16px (all sides), 8px (bottom) |
| Patient Item | 16px (all sides) |
| Patient Item Height | min 60px |

### Bottom Sheet Configuration

| Property | Value |
|----------|-------|
| Snap Points | 75%, 90% |
| Initial Index | -1 (closed) |
| Enable Pan Down | Yes |
| Backdrop Opacity | 0.5 |
| Keyboard Behavior | Interactive |

## Accessibility Features

### Labels and Hints

```typescript
// Input field
accessibilityLabel="Sélectionner un patient"
accessibilityHint="Ouvre un écran de recherche de patient"

// Patient item
accessibilityLabel="Sélectionner le patient Awa Traoré"
accessibilityRole="button"

// Clear button
accessibilityLabel="Effacer la sélection"

// Create button
accessibilityLabel="Créer un nouveau patient"

// Search input
accessibilityLabel="Rechercher un patient"
```

### Minimum Touch Targets

All interactive elements meet the minimum 44x44 point touch target size:
- Close button: 44x44
- Patient list items: min height 60px
- Clear button: 20px + 10px hitSlop on all sides = 40x40 effective

## Key Improvements Over Modal

1. **Better UX**: Bottom sheet feels more natural on mobile
2. **Context Preservation**: Main screen remains visible (dimmed)
3. **Gesture Support**: Pull-down to close, native feel
4. **Performance**: Debounced search reduces API calls
5. **Keyboard Management**: Better keyboard handling
6. **Accessibility**: Enhanced screen reader support
7. **Empty States**: Contextual messages and actions
8. **Visual Feedback**: Loading states for better perceived performance

## Testing Checklist

- [ ] Opens bottom sheet on input tap
- [ ] Closes bottom sheet on backdrop tap
- [ ] Closes bottom sheet on pull-down gesture
- [ ] Closes bottom sheet on [X] button tap
- [ ] Closes bottom sheet on patient selection
- [ ] Android back button closes bottom sheet
- [ ] Search input filters patient list
- [ ] Search is debounced (300ms delay)
- [ ] Keyboard dismisses on scroll
- [ ] Keyboard dismisses on selection
- [ ] Loading state displays spinner
- [ ] Empty state shows appropriate message
- [ ] Create button appears when no results
- [ ] Selected patient displays in input
- [ ] Clear button removes selection
- [ ] Error state displays properly
- [ ] Accessibility labels work with screen readers
- [ ] Works on different screen sizes
- [ ] Works on Redmi 10A (test device)

## Related Files

- `/mobile/src/components/form/PatientPickerBottomSheet.tsx` - Main component
- `/mobile/src/hooks/useDebounce.ts` - Debounce hook
- `/mobile/src/hooks/useConsultationForm.ts` - Form logic
- `/mobile/src/screens/NewConsultationScreen.tsx` - Integration
- `/mobile/App.tsx` - GestureHandlerRootView setup
- `/mobile/__tests__/PatientPickerBottomSheet.test.tsx` - Tests
- `/mobile/__tests__/useDebounce.test.ts` - Tests

## References

- Design Mockup: [GitHub Issue Image](https://github.com/user-attachments/assets/445a9fec-7c54-431b-bfef-7085b03ebb4b)
- @gorhom/bottom-sheet Documentation: https://gorhom.github.io/react-native-bottom-sheet/
