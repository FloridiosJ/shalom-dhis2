# Visual Guide - "Mes Patients" Screen

This document provides a visual guide to the implemented patient management screens, matching the design mockup provided.

## 📱 Mobile View (Phone)

### 1. Patient List Screen
```
┌─────────────────────────────────────┐
│  ☰  Mes Patients            ⚙ 🚪   │ ← Header
├─────────────────────────────────────┤
│  🔍 Rechercher un patient...        │ ← Search Bar
├─────────────────────────────────────┤
│  📋 Trier par : Nom         ▼       │ ← Sort Menu
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Adama Traoré            >   │   │ ← Patient Card
│  │ 34 ans, Masculin            │   │
│  │ 🏥 Dispensaire de Bamako    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Fatoumata Diarra        >   │   │
│  │ 28 ans, Féminin             │   │
│  │ 🏥 Dispensaire de Ségou     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Moussa Coulibaly        >   │   │
│  │ 45 ans, Masculin            │   │
│  │ 🏥 Dispensaire de Bamako    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 2. Patient Detail Screen (After tapping card)
```
┌─────────────────────────────────────┐
│  ← Détails du Patient       ⚙ 🚪   │ ← Header with back
├─────────────────────────────────────┤
│            ┌───────┐                │
│            │  👤   │                │ ← Avatar
│            └───────┘                │
│        Fatoumata Diarra             │ ← Name
├─────────────────────────────────────┤
│  Informations Démographiques        │ ← Section Title
├─────────────────────────────────────┤
│  📇 Nom complet                     │
│     Fatoumata Diarra                │
│                                     │
│  🆔 ID Unique                       │
│     MLI-SEG-84302                   │
│                                     │
│  🎂 Date de naissance               │
│     12/05/1996 (28 ans)             │
│                                     │
│  ⚧ Sexe                             │
│     Féminin                         │
│                                     │
│  📍 Adresse                         │
│     Quartier du Fleuve, Ségou, Mali │
├─────────────────────────────────────┤
│  Historique des Consultations       │ ← Section Title
├─────────────────────────────────────┤
│  15/03/2024                    >    │
│  Suivi paludisme                    │
│ ─────────────────────────────────── │
│  02/01/2024                    >    │
│  Vaccination                        │
│ ─────────────────────────────────── │
│  18/11/2023                    >    │
│  Consultation prénatale             │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │  + Démarrer une nouvelle      │ │ ← Action Button
│  │     consultation              │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

## 💻 Tablet View (Split Screen)

```
┌────────────────────────────────────────────────────────────────────┐
│                    Mes Patients                            ⚙ 🚪    │
├──────────────────────────┬─────────────────────────────────────────┤
│  🔍 Rechercher...        │         ┌───────┐                       │
├──────────────────────────┤         │  👤   │                       │
│  📋 Trier par : Nom   ▼  │         └───────┘                       │
├──────────────────────────┤      Fatoumata Diarra                   │
│                          │─────────────────────────────────────────│
│ ┌──────────────────────┐ │ Informations Démographiques             │
│ │ Adama Traoré      > │ │─────────────────────────────────────────│
│ │ 34 ans, Masculin    │ │ 📇 Nom complet                          │
│ │ 🏥 Dispensaire      │ │    Fatoumata Diarra                     │
│ └──────────────────────┘ │                                         │
│                          │ 🆔 ID Unique                            │
│ ┌──────────────────────┐ │    MLI-SEG-84302                        │
│ │ Fatoumata Diarra  > │ │                                         │
│ │ 28 ans, Féminin     │ │ 🎂 Date de naissance                    │
│ │ 🏥 Dispensaire      │ │    12/05/1996 (28 ans)                  │
│ └──────────────────────┘ │                                         │
│                          │ ⚧ Sexe: Féminin                         │
│ ┌──────────────────────┐ │                                         │
│ │ Moussa Coulibaly  > │ │ 📍 Adresse                              │
│ │ 45 ans, Masculin    │ │    Quartier du Fleuve, Ségou, Mali      │
│ │ 🏥 Dispensaire      │ │─────────────────────────────────────────│
│ └──────────────────────┘ │ Historique des Consultations            │
│                          │─────────────────────────────────────────│
│                          │ 15/03/2024                         >    │
│                          │ Suivi paludisme                         │
│                          │ ─────────────────────────────────────   │
│                          │ 02/01/2024                         >    │
│                          │ Vaccination                             │
│                          │ ─────────────────────────────────────   │
│                          │ 18/11/2023                         >    │
│                          │ Consultation prénatale                  │
│                          │                                         │
│                          │ ┌─────────────────────────────────┐    │
│                          │ │ + Démarrer une nouvelle         │    │
│                          │ │   consultation                  │    │
│                          │ └─────────────────────────────────┘    │
│                          │                                         │
└──────────────────────────┴─────────────────────────────────────────┘
     List (400px max)      │     Detail View (Flexible)
                           │
```

## 🎨 Component Details

### Patient Card
```
┌─────────────────────────────────────┐
│ Name (Bold, 18px)              >    │  ← Chevron for navigation
│ ━━━━━━━━━━━━━                       │
│ 🎂 Age    ⚧ Gender                  │  ← Icons + text
│ 🏥 Dispensary Name                  │  ← Badge (green background)
└─────────────────────────────────────┘
  • Card elevation: 1
  • Border radius: 8px
  • Padding: 12px
  • Min height: 44px (touch target)
```

### Search Bar
```
┌─────────────────────────────────────┐
│ 🔍 Rechercher un patient...         │
└─────────────────────────────────────┘
  • Background: #F5F5F5
  • Border radius: 8px
  • Padding: 12px horizontal, 8px vertical
  • Min height: 44px
  • Icon size: 20px
  • Font size: 16px
```

### Sort Menu
```
┌─────────────────────────────────────┐
│ 📋 Trier par : Nom              ▼   │
└─────────────────────────────────────┘
  • Background: #E3F2FD (light blue)
  • Text color: #2196F3 (blue)
  • Border radius: 8px
  • Min height: 44px
  
  Dropdown options:
  ┌─────────────────────────────────┐
  │ 📋 Trier par : Nom              │ ← Selected (highlighted)
  │ 🔢 Trier par : Âge              │
  │ 🕐 Trier par : Récent           │
  └─────────────────────────────────┘
```

### Info Row (in Detail View)
```
┌─────────────────────────────────────┐
│ 🆔 Label Name                       │  ← Icon + Label (gray)
│    Value Text                       │  ← Value (black, indented)
└─────────────────────────────────────┘
  • Icon size: 20px
  • Label color: #757575
  • Value color: #212121
  • Separator: 1px #F5F5F5
```

### Consultation History Item
```
┌─────────────────────────────────────┐
│ 15/03/2024                      >   │  ← Date (bold) + Chevron
│ Suivi paludisme                     │  ← Type/Diagnostic
└─────────────────────────────────────┘
  • Date: Bold, #212121
  • Type: Regular, #616161
  • Border bottom: 1px #E0E0E0
  • Min height: 44px
```

### Action Button
```
┌─────────────────────────────────────┐
│  +  Démarrer une nouvelle           │
│     consultation                    │
└─────────────────────────────────────┘
  • Background: #2196F3 (blue)
  • Text: White, 16px, bold
  • Border radius: 8px
  • Min height: 48px
  • Icon: Plus sign
  • Full width with margins
```

## 🎭 States

### Empty State (No Patients)
```
┌─────────────────────────────────────┐
│                                     │
│            👥 (large)               │
│                                     │
│      Aucun patient enregistré       │
│   Les patients apparaîtront ici     │
│                                     │
└─────────────────────────────────────┘
  • Icon size: 64px, color: #BDBDBD
  • Title: #757575
  • Text: #9E9E9E
```

### Empty Search Results
```
┌─────────────────────────────────────┐
│                                     │
│            🔍👤 (large)             │
│                                     │
│       Aucun patient trouvé          │
│  Essayez avec d'autres critères     │
│                                     │
└─────────────────────────────────────┘
  • Same styling as empty state
  • Different icon and message
```

### Loading State
```
┌─────────────────────────────────────┐
│                                     │
│              ⏳                     │
│     Chargement des patients...      │
│                                     │
└─────────────────────────────────────┘
  • Spinner: Activity Indicator (blue)
  • Text: #757575
```

### Error State
```
┌─────────────────────────────────────┐
│                                     │
│            ⚠️ (large)               │
│                                     │
│      Erreur de chargement           │
│   [Error message text]              │
│                                     │
│  ┌───────────────────────────────┐ │
│  │         Retour                │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
  • Icon: 64px, color: #F44336 (red)
  • Title: #212121
  • Message: #757575
  • Button: Contained, primary color
```

## 🎨 Color Palette

```
Primary Blue:     #2196F3  (Buttons, icons, highlights)
Light Blue:       #E3F2FD  (Sort menu background)
Pink (Female):    #E91E63  (Gender icon)
Green:            #4CAF50  (Dispensary badge)
Light Green BG:   #E8F5E9  (Badge background)
Dark Green:       #2E7D32  (Badge text)
Red (Error):      #F44336  (Error icons)

Text Primary:     #212121  (Main text)
Text Secondary:   #616161  (Supporting text)
Text Disabled:    #9E9E9E  (Placeholder, empty states)
Text Hint:        #757575  (Labels, hints)

Background:       #F5F5F5  (Screen background)
Card Background:  #FFFFFF  (Cards)
Border:           #E0E0E0  (Separators)
Input Background: #F5F5F5  (Search bar)
```

## 📐 Spacing & Sizing

```
Touch Targets:       ≥44px (all interactive elements)
Card Border Radius:  8px
Button Height:       48px (primary actions)
Icon Sizes:
  - Small:           16px (info items)
  - Medium:          20px (search, info rows)
  - Large:           24px (navigation)
  - Extra Large:     48px (avatar)
  - Huge:            64px (empty states)

Padding:
  - Screen:          16px horizontal
  - Card:            12px
  - Section:         16px horizontal, 12px vertical
  - Button:          16px horizontal, 12px vertical

Margins:
  - Between cards:   12px
  - Between sections: 16px
  - Bottom spacing:  24px
```

## 🔄 Interactions

### Tap Behaviors
1. **Patient Card**: Navigate to detail (mobile) or show detail (tablet)
2. **Sort Menu**: Open dropdown with options
3. **Consultation Item**: Navigate to consultation detail (optional)
4. **Action Button**: Navigate to new consultation with patient pre-filled
5. **Search Bar**: Focus for keyboard input
6. **Back Button**: Return to patient list

### Pull to Refresh
```
┌─────────────────────────────────────┐
│             ⟳                       │ ← Refresh indicator
│  🔍 Rechercher un patient...        │
│  ...                                │
```

### Scroll Behavior
- **FlatList**: Virtualized scrolling
- **Pull down**: Refresh data
- **Smooth scrolling**: 60 FPS target
- **Scroll to top**: On tab re-press

## 📱 Responsive Breakpoints

```
Mobile:   < 768px  → Stack navigation
Tablet:   ≥ 768px  → Split view layout

Split View Proportions:
- List column:   400px max width
- Detail column: Flexible (remaining space)
- Separator:     1px solid #E0E0E0
```

This visual guide corresponds to the implemented components and matches the design mockup provided in the issue.
