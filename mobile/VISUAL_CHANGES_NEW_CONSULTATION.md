# Visual Changes: New Consultation Screen

## Screen Flow

### 1. Entry Point: Consultations List
- **Change**: FAB button now navigates to New Consultation screen
- **Location**: ConsultationScreen.tsx
- **Action**: Tap FAB (+) button → Opens NewConsultationScreen

### 2. New Consultation Screen

#### Header
```
┌─────────────────────────────────────┐
│ ← Nouvelle Consultation  [Sauvegardé]│
└─────────────────────────────────────┘
```
- Back arrow for navigation
- Title: "Nouvelle Consultation"
- Green "Sauvegardé" badge when draft exists

#### Patient Section
```
┌─────────────────────────────────────┐
│ Patient                             │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Nom ou identifiant du patient│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ➕ Créer un nouveau patient         │
└─────────────────────────────────────┘
```
- Search field that opens patient selection modal
- "Créer un nouveau patient" button

When patient selected:
```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ Jean Dupont              ✖      │ │
│ │ PAT-001                         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
- Shows patient name and number
- X button to clear selection

#### Date and Time Section
```
┌─────────────────────────────────────┐
│ Date et Heure                       │
│                                     │
│ Date de la consultation  *          │
│ ┌─────────────────┐                │
│ │ 📅 27/10/2023  ▼│                │
│ └─────────────────┘                │
│                                     │
│ Heure *                             │
│ ┌─────────────────┐                │
│ │ 🕐 02:30 PM    ▼│                │
│ └─────────────────┘                │
└─────────────────────────────────────┘
```
- Two columns on larger screens
- Native date picker (calendar icon)
- Native time picker (clock icon)
- Required fields marked with *

#### Clinical Information Section
```
┌─────────────────────────────────────┐
│ Informations Cliniques              │
│                                     │
│ Diagnostic *                        │
│ ┌─────────────────────────────────┐ │
│ │ Paludisme simple                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Prescriptions                       │
│ ┌─────────────────────────────────┐ │
│ │ ex: Paracétamol 500mg,          │ │
│ │ 3 fois par jour...              │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Notes                               │
│ ┌─────────────────────────────────┐ │
│ │ Ajouter des commentaires...     │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
- Diagnostic: Single line, required
- Prescriptions: Multiline, optional
- Notes: Multiline, optional

#### Attachments Section
```
┌─────────────────────────────────────┐
│ Pièces Jointes                      │
│                                     │
│ ┌──────────────┐ ┌─────────────────┐│
│ │📷 Ajouter   │ │📎 Ajouter un f.││
│ │   une...    │ │                 ││
│ └──────────────┘ └─────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🖼 image.jpg          100KB  ✖ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
- Two buttons: "Ajouter une..." (camera), "Ajouter un f..." (file)
- List of attachments with delete option
- File type icon, name, and size

#### Action Bar
```
┌─────────────────────────────────────┐
│ ┌───────────────┐ ┌────────────────┐│
│ │ Enregistrer   │ │ ↗ Envoyer     ││
│ │ broui...      │ │               ││
│ └───────────────┘ └────────────────┘│
└─────────────────────────────────────┘
```
- "Enregistrer broui..." (outlined) - Save draft
- "Envoyer" (filled blue) - Submit consultation
- Send button disabled until form is valid

### 3. Patient Selection Modal

```
┌─────────────────────────────────────┐
│ Sélectionner un patient          ✖ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Rechercher par nom...        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Jean Dupont            →        │ │
│ │ PAT-001                         │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Marie Martin           →        │ │
│ │ PAT-002                         │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Pierre Bernard         →        │ │
│ │ PAT-003                         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
- Full-screen modal (slide animation)
- Search bar at top
- List of patients with name and number
- Tap to select and close modal

### 4. Validation States

#### Error States
```
┌─────────────────────────────────────┐
│ Patient *                           │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Nom ou identifiant du patient│ │ ← Red border
│ └─────────────────────────────────┘ │
│ ⚠ Veuillez sélectionner un patient │ ← Red text
└─────────────────────────────────────┘
```
- Red border on invalid fields
- Error message in red below field

#### Loading State
```
┌─────────────────┐
│ ⟳ Loading...   │ ← Spinner in button
└─────────────────┘
```
- Activity indicator in send button during submission

## Color Scheme

- **Primary Blue**: `#2196F3` - Buttons, active states
- **Success Green**: `#4CAF50` - Saved badge
- **Error Red**: `#D32F2F` - Errors, delete
- **Background Gray**: `#F5F5F5` - Screen background
- **White**: `#FFFFFF` - Card backgrounds
- **Text Dark**: `#212121` - Primary text
- **Text Gray**: `#757575` - Secondary text
- **Text Light Gray**: `#9E9E9E` - Placeholders
- **Border Gray**: `#E0E0E0` - Borders

## Typography

- **Screen Title**: 18px, bold, #212121
- **Section Title**: 16px, semi-bold, #212121
- **Field Label**: 14px, semi-bold, #424242
- **Input Text**: 16px, regular, #212121
- **Helper Text**: 12px, regular, #9E9E9E
- **Error Text**: 12px, regular, #D32F2F

## Spacing

- **Screen Padding**: 16px
- **Section Margin**: 16px bottom
- **Section Padding**: 16px
- **Field Margin**: 16px bottom
- **Label Margin**: 8px bottom
- **Button Height**: 48px minimum
- **Touch Target**: 44px minimum

## Responsive Behavior

### Small Screens (< 375px)
- Date/Time fields stack vertically
- Buttons stack vertically
- Reduced padding where needed

### Medium Screens (375px - 768px)
- Date/Time fields side by side
- Buttons side by side
- Standard layout

### Large Screens (> 768px)
- Same as medium
- More generous whitespace

## Accessibility

- All buttons have 44x44px minimum touch targets
- Labels properly associated with inputs
- Error messages announced to screen readers
- Proper contrast ratios (WCAG AA compliant)
- Keyboard navigation support
- Focus indicators visible

## Animations

- Modal slide in/out (patient selection)
- Fade in/out for error messages
- Button press feedback
- Loading spinner rotation
- Keyboard animation handled by KeyboardAvoidingView

## Platform Differences

### Android
- Material Design date/time pickers
- Camera permission dialog
- Material elevation (shadows)

### iOS
- Native iOS date/time pickers (spinner style)
- iOS-style modals
- Native shadow style
