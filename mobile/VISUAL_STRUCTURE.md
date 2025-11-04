# Mobile Dashboard - Visual Structure

## Component Hierarchy

```
HomeScreen
├── ScrollView (allows vertical scrolling)
│   ├── Header Section
│   │   ├── Title: "Shalom Mobile"
│   │   └── Export Button (share icon)
│   │
│   ├── Filters Section
│   │   ├── Dispensaire Dropdown
│   │   │   ├── "Dispensaire" button
│   │   │   └── Menu (Dispensaire A, B, C)
│   │   └── Période Dropdown
│   │       ├── "Période" button
│   │       └── Menu (Aujourd'hui, Cette semaine, Ce mois)
│   │
│   └── Dashboard Cards Grid
│       ├── Row 1
│       │   ├── DashboardCard (Consultations en attente)
│       │   │   ├── Icon: clipboard-text (blue circle)
│       │   │   ├── Label: "Consultations en attente"
│       │   │   └── Count: 12
│       │   └── DashboardCard (Patients Récents)
│       │       ├── Icon: account-group (blue circle)
│       │       ├── Label: "Patients Récents"
│       │       └── Count: 5
│       └── Row 2
│           ├── DashboardCard (Synchronisation requise)
│           │   ├── Icon: sync (blue circle)
│           │   ├── Label: "Synchronisation requise"
│           │   └── Count: 8
│           └── ActionCard (Nouveau Patient)
│               ├── Icon: account-plus (blue circle)
│               ├── Label: "Nouveau Patient"
│               └── Dashed border (clickable)
```

## Navigation Structure

```
Bottom Tab Navigator
├── Tab 1: Accueil (Home) [Active by default]
│   └── HomeScreen (dashboard view)
├── Tab 2: Consultation
│   └── ConsultationScreen (placeholder)
├── Tab 3: Patient
│   └── PatientScreen (placeholder)
├── Tab 4: Sync/Statut
│   └── SyncScreen (placeholder)
└── Tab 5: Settings
    └── SettingsScreen (placeholder)
```

## Visual Layout (ASCII Representation)

```
┌─────────────────────────────────────────────┐
│  Shalom Mobile                       [📤]   │  ← Header
├─────────────────────────────────────────────┤
│  [Dispensaire ▼]    [Période ▼]            │  ← Filters
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────┐  ┌──────────────────┐│
│  │    📋            │  │    👥            ││  ← Row 1
│  │ Consultations en │  │  Patients        ││
│  │    attente       │  │  Récents         ││
│  │      12          │  │       5          ││
│  └──────────────────┘  └──────────────────┘│
│                                             │
│  ┌──────────────────┐  ┌╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶┐│
│  │    🔄            │  ┆    ➕           ┆│  ← Row 2
│  │ Synchronisation  │  ┆  Nouveau        ┆│
│  │    requise       │  ┆  Patient        ┆│
│  │       8          │  └╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶╶┘│
│  └──────────────────┘  (dashed border)     │
│                                             │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ [🏠] [🩺] [👤] [🔄] [⚙️]                    │  ← Bottom Tabs
│Accueil Consult Patient Sync Settings        │
└─────────────────────────────────────────────┘
```

## Color Palette

### Primary Colors
- **Primary Blue:** `#2196F3` (Shalom brand color)
  - Used for: Icons, active tab, borders on action card
  
- **Light Blue Background:** `#E3F2FD`
  - Used for: Icon circular backgrounds

### Neutral Colors
- **White:** `#FFFFFF`
  - Used for: Card backgrounds, header background
  
- **Light Gray:** `#F5F5F5`
  - Used for: Page background
  
- **Border Gray:** `#E0E0E0`
  - Used for: Button borders, separator lines

### Text Colors
- **Primary Text:** `#212121` (dark gray)
  - Used for: Titles, counts
  
- **Secondary Text:** `#757575` (medium gray)
  - Used for: Card labels
  
- **Inactive Text:** `#9E9E9E` (light gray)
  - Used for: Inactive tab labels

## Dimensions & Spacing

### Card Specifications
```
Card:
  - Width: 50% of container (minus gap)
  - Height: Auto (based on content)
  - Padding: 12px horizontal, 20px vertical
  - Border Radius: 12px
  - Elevation: 2 (shadow)
  - Gap between cards: 16px

Icon Container:
  - Size: 56x56px
  - Border Radius: 28px (circular)
  - Icon Size: 28px
  - Margin Bottom: 12px

Typography:
  - Header Title: headlineMedium, bold
  - Card Label: bodySmall, #757575
  - Card Count: headlineMedium, bold, #212121
  - Action Label: bodyMedium, bold, #2196F3
```

### Layout Spacing
```
Container Padding: 16px
Row Gap: 16px
Column Gap: 16px
Filter Section Padding: 12px vertical
Tab Bar Height: 60px
Tab Bar Padding: 8px vertical
```

## Icons Used (Material Community Icons)

| Component | Icon Name | Size |
|-----------|-----------|------|
| Consultations | `clipboard-text` | 28px |
| Patients | `account-group` | 28px |
| Sync | `sync` | 28px |
| Nouveau Patient | `account-plus` | 28px |
| Export/Share | `share-variant` | 24px |
| Home Tab | `view-dashboard` | Tab size |
| Consultation Tab | `stethoscope` | Tab size |
| Patient Tab | `account` | Tab size |
| Sync Tab | `sync` | Tab size |
| Settings Tab | `cog` | Tab size |
| Dropdown | `chevron-down` | Button icon |

## Interactions

### Tappable Elements
1. **Export Button** (top-right)
   - Action: Opens share/export dialog (TODO)
   
2. **Dispensaire Dropdown**
   - Action: Opens menu with dispensaire options
   - Effect: Changes selected dispensaire
   
3. **Période Dropdown**
   - Action: Opens menu with time period options
   - Effect: Changes selected period
   
4. **Nouveau Patient Card**
   - Action: Navigates to patient creation screen (TODO)
   - Visual: Dashed border indicates it's an action card
   
5. **Bottom Tabs**
   - Action: Switches between different sections
   - Visual: Active tab highlighted in blue (#2196F3)

### Visual Feedback
- Buttons: Touch opacity on press
- Cards: Elevation shadow for depth
- Active tab: Blue color (#2196F3)
- Inactive tabs: Gray color (#9E9E9E)

## Responsive Behavior

- **ScrollView:** Enables vertical scrolling if content exceeds viewport
- **Flex Layout:** Cards adapt to screen width (50% each)
- **Grid Gap:** Maintains consistent spacing across devices
- **Safe Area:** Tab bar respects device safe areas

## States

### Filter States
- Dispensaire: "Dispensaire", "Dispensaire A", "Dispensaire B", "Dispensaire C"
- Période: "Période", "Aujourd'hui", "Cette semaine", "Ce mois"

### Data States (Current: Placeholder)
```javascript
dashboardData = {
  consultationsCount: 12,
  patientsRecentsCount: 5,
  syncRequiredCount: 8,
}
```

### Future States
- Loading
- Error
- Empty data
- Refreshing

---

**Visual Structure Document**
*Part of Mobile Dashboard Implementation*
*Version 1.0 - Complete*
