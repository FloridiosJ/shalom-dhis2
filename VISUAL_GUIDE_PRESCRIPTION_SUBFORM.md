# Visual Guide: PrescriptionSubForm Component

## 📸 Component Overview

This document provides a visual guide to the newly created PrescriptionSubForm component and its usage.

## 🎯 What Was Created

### Component Hierarchy

```
prescription/
├── PrescriptionSubForm.jsx          ← Main reusable component
├── PrescriptionSubForm.test.jsx     ← 10 unit tests
├── MedicamentPicker.jsx             ← French alias
├── FrequencePicker.jsx              ← French alias
├── DureePicker.jsx                  ← French alias
├── index.js                         ← Centralized exports
├── MedicationSelector.jsx           ← Existing (used by PrescriptionSubForm)
├── FrequencySelector.jsx            ← Existing (used by PrescriptionSubForm)
├── DurationSelector.jsx             ← Existing (used by PrescriptionSubForm)
└── PrescriptionItemCard.jsx         ← Existing (alternative component)
```

## 📋 Component Structure

### PrescriptionSubForm Layout

```
┌─────────────────────────────────────────────────────┐
│  Médicament #1                              [✕]     │ ← Header (optional)
├─────────────────────────────────────────────────────┤
│  Médicament *                                       │
│  [+ Sélectionner un médicament ▼]                  │ ← MédicamentPicker
├─────────────────────────────────────────────────────┤
│  Dose                                               │
│  [Ex: 500mg, 2 comprimés...]                       │ ← Text input
├─────────────────────────────────────────────────────┤
│  Fréquence                                          │
│  [Ex: 3x/jour, matin et soir... ▼]                 │ ← FréquencePicker
├─────────────────────────────────────────────────────┤
│  Durée                                              │
│  [+ Sélectionner une durée ▼]                      │ ← DuréePicker
├─────────────────────────────────────────────────────┤
│  Notes                                              │
│  [Précisions pour ce médicament...]                │ ← Text input
└─────────────────────────────────────────────────────┘
```

### MédicamentPicker Dropdown

```
┌─────────────────────────────────────────────────────┐
│  [🔍 Rechercher un médicament...]                   │
├─────────────────────────────────────────────────────┤
│  Amoxicilline                                       │
│  Amoxicilline + Acide clavulanique                  │
│  Azithromycine                                      │
│  Paracétamol                                        │
│  Ibuprofène                                         │
│  ... (93 médicaments au total)                      │
├─────────────────────────────────────────────────────┤
│  [Fermer (Échap)]                                   │
└─────────────────────────────────────────────────────┘
```

### FréquencePicker Suggestions

```
┌─────────────────────────────────────────────────────┐
│  1x/jour                                            │
│  2x/jour                                            │
│  3x/jour                                            │
│  4x/jour                                            │
│  Matin                                              │
│  Soir                                               │
│  Matin et soir                                      │
│  Matin, midi et soir                                │
│  Toutes les 6 heures                                │
│  Toutes les 8 heures                                │
│  Toutes les 12 heures                               │
│  Au besoin                                          │
│  Selon prescription                                 │
├─────────────────────────────────────────────────────┤
│  [Fermer (Échap)]                                   │
└─────────────────────────────────────────────────────┘
```

### DuréePicker Options

```
┌─────────────────────────────────────────────────────┐
│  [🔍 Rechercher une durée...]                       │
├─────────────────────────────────────────────────────┤
│  3 jours                                            │
│  5 jours                                            │
│  7 jours                                            │
│  10 jours                                           │
│  14 jours                                           │
│  2 semaines                                         │
│  3 semaines                                         │
│  1 mois                                             │
│  2 mois                                             │
│  3 mois                                             │
│  En continu                                         │
│  Jusqu'à amélioration                               │
├─────────────────────────────────────────────────────┤
│  [Fermer (Échap)]                                   │
└─────────────────────────────────────────────────────┘
```

## 🎨 Usage Scenarios

### Scenario 1: Single Prescription

```
┌─────────────────────────────────────────────────────┐
│  Nouvelle prescription                              │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ PrescriptionSubForm Component                 │ │
│  │                                               │ │
│  │ Médicament: [Paracétamol]        [✕]         │ │
│  │ Dose: [500mg]                                 │ │
│  │ Fréquence: [3x/jour]                          │ │
│  │ Durée: [3 jours]                 [✕]          │ │
│  │ Notes: [Après les repas]                      │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Enregistrer]  [Annuler]                          │
└─────────────────────────────────────────────────────┘
```

### Scenario 2: Multiple Prescriptions

```
┌─────────────────────────────────────────────────────┐
│  Prescriptions                                      │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Médicament #1                         [✕]     │ │
│  │ Médicament: [Amoxicilline]           [✕]      │ │
│  │ Dose: [500mg]                                 │ │
│  │ Fréquence: [3x/jour]                          │ │
│  │ Durée: [7 jours]                    [✕]       │ │
│  │ Notes: []                                     │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Médicament #2                         [✕]     │ │
│  │ Médicament: [Paracétamol]            [✕]      │ │
│  │ Dose: [500mg]                                 │ │
│  │ Fréquence: [Au besoin]                        │ │
│  │ Durée: [3 jours]                    [✕]       │ │
│  │ Notes: [Si fièvre > 38°C]                     │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [+ Ajouter un médicament]                         │
│                                                     │
│  [Enregistrer toutes les prescriptions]            │
└─────────────────────────────────────────────────────┘
```

### Scenario 3: Read-Only Mode

```
┌─────────────────────────────────────────────────────┐
│  Prescription existante                             │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Médicament: [Paracétamol]            [✕]      │ │  ← Disabled
│  │ Dose: [500mg]                       (locked)  │ │  ← Disabled
│  │ Fréquence: [3x/jour]                          │ │  ← Disabled
│  │ Durée: [3 jours]                    [✕]       │ │  ← Disabled
│  │ Notes: [Après les repas]            (locked)  │ │  ← Disabled
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Fermer]                                          │
└─────────────────────────────────────────────────────┘
```

### Scenario 4: Compact Mode (No Labels)

```
┌─────────────────────────────────────────────────────┐
│  Prescription rapide                                │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ [Paracétamol]                        [✕]      │ │
│  │ [500mg]                                       │ │
│  │ [3x/jour]                                     │ │
│  │ [3 jours]                            [✕]      │ │
│  │ [Après les repas]                             │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Enregistrer]                                     │
└─────────────────────────────────────────────────────┘
```

## 🔌 Integration Points

### Where It Can Be Used

```
📦 Application Structure
│
├── 📄 CreateDataEntryModal        ← Can use PrescriptionSubForm
│   └── Uses PrescriptionList (which uses PrescriptionItemCard)
│
├── 📄 EditConsultationForm        ← Can use PrescriptionSubForm
│
├── 📄 OrdonnanceForm              ← Can use PrescriptionSubForm
│
├── 📄 PatientDetailsView          ← Can use PrescriptionSubForm (read-only)
│
└── 📄 PrescriptionSubFormExample  ← Demo page showing all scenarios
    └── /prescription-example route
```

## 📊 Data Flow

### Component Props Flow

```
Parent Component
    │
    ├─ state: prescription = { medicament, dose, frequence, duree, notes }
    │
    ▼
PrescriptionSubForm
    │
    ├─ Props In:
    │   ├─ value: prescription object
    │   ├─ onChange: (updatedPrescription) => setState
    │   ├─ disabled: boolean
    │   ├─ showLabels: boolean
    │   ├─ onRemove: () => void (optional)
    │   └─ index: number (optional)
    │
    ├─ Internal Components:
    │   ├─ MedicationSelector (MédicamentPicker)
    │   ├─ FrequencySelector (FréquencePicker)
    │   ├─ DurationSelector (DuréePicker)
    │   └─ Text inputs (dose, notes)
    │
    └─ Props Out:
        └─ onChange({ ...prescription, [field]: newValue })
```

### State Management Example

```javascript
// In parent component
const [prescription, setPrescription] = useState({
  medicament: '',    // From COMMON_MEDICATIONS
  dose: '',         // Free text
  frequence: '',    // From COMMON_FREQUENCIES or free text
  duree: '',       // From COMMON_DURATIONS
  notes: ''        // Free text
});

// When user changes medicament
MédicamentPicker onChange → 
  PrescriptionSubForm → 
    setPrescription({ ...prescription, medicament: 'Paracétamol' })

// When user types dose
Dose Input onChange → 
  PrescriptionSubForm → 
    setPrescription({ ...prescription, dose: '500mg' })
```

## 🎯 Key Features Visualized

### 1. Required Field Indicator

```
Médicament *  ← Red asterisk indicates required field
[+ Sélectionner un médicament]
```

### 2. Searchable Dropdown

```
[🔍 Para...]  ← Type to filter

Results:
✓ Paracétamol         ← Matches
  Paraméthasone        ← Matches
  (other items hidden)
```

### 3. Remove Button

```
Médicament #1         [✕] ← Click to remove this prescription
```

### 4. Index Display

```
Médicament #1  ← First prescription
Médicament #2  ← Second prescription
Médicament #3  ← Third prescription
```

## 📱 Responsive Considerations

The component uses the existing responsive CSS from `CreateDataEntryModal.module.css`:

- **Desktop**: Full width fields with proper spacing
- **Tablet**: Slightly condensed but still readable
- **Mobile**: Stacked fields, touch-friendly buttons

## 🎨 Color Scheme

- **Primary Blue**: `#0284c7` - Headers, selected items
- **Text Gray**: `#1e293b` - Main text
- **Light Gray**: `#64748b` - Secondary text, hints
- **Border Gray**: `#cbd5e1` - Borders
- **Red**: `#dc2626` - Required indicators, delete buttons
- **Background**: `#fff` - Main background

## 📂 File Organization

```
web/src/
├── components/
│   └── prescription/
│       ├── PrescriptionSubForm.jsx          ← NEW
│       ├── PrescriptionSubForm.test.jsx     ← NEW
│       ├── MedicamentPicker.jsx             ← NEW (alias)
│       ├── FrequencePicker.jsx              ← NEW (alias)
│       ├── DureePicker.jsx                  ← NEW (alias)
│       ├── index.js                         ← NEW (exports)
│       ├── MedicationSelector.jsx           ← EXISTING
│       ├── FrequencySelector.jsx            ← EXISTING
│       ├── DurationSelector.jsx             ← EXISTING
│       └── PrescriptionItemCard.jsx         ← EXISTING
│
├── pages/
│   └── PrescriptionSubFormExample.jsx       ← NEW (demo)
│
├── constants/
│   └── medications.js                       ← EXISTING (data)
│       ├── COMMON_MEDICATIONS (93 items)
│       ├── COMMON_FREQUENCIES (13 items)
│       └── COMMON_DURATIONS (12 items)
│
└── routes/
    └── Routes.jsx                           ← MODIFIED (+1 route)
```

## 🧪 Testing

Test coverage visualization:

```
PrescriptionSubForm.test.jsx
├─ ✅ Renders all required fields
├─ ✅ Displays index when provided
├─ ✅ Shows remove button when onRemove provided
├─ ✅ Calls onRemove when button clicked
├─ ✅ Updates dose field correctly
├─ ✅ Updates notes field correctly
├─ ✅ Disables fields when disabled prop is true
├─ ✅ Hides labels when showLabels is false
├─ ✅ Renders with pre-filled values
└─ ✅ Marks medicament field as required

Result: 10/10 tests passing ✅
```

## 📖 Documentation Files

```
📚 Documentation Structure
│
├── PRESCRIPTION_SUBFORM_USAGE.md
│   ├─ Props documentation
│   ├─ Usage examples
│   ├─ Integration guide
│   └─ Best practices
│
├── IMPLEMENTATION_PRESCRIPTION_SUBFORM.md
│   ├─ Implementation summary
│   ├─ Features list
│   ├─ Files created
│   ├─ Testing results
│   └─ Security scan results
│
└── VISUAL_GUIDE_PRESCRIPTION_SUBFORM.md (this file)
    ├─ Component hierarchy
    ├─ Visual layouts
    ├─ Usage scenarios
    └─ Data flow diagrams
```

## 🚀 Getting Started

### Quick Start Guide

1. **View the demo page**:
   - Navigate to `/prescription-example` after logging in
   - Try all 4 scenarios

2. **Use in your component**:
   ```javascript
   import PrescriptionSubForm from './components/prescription/PrescriptionSubForm';
   ```

3. **Set up state**:
   ```javascript
   const [prescription, setPrescription] = useState({
     medicament: '', dose: '', frequence: '', duree: '', notes: ''
   });
   ```

4. **Render**:
   ```jsx
   <PrescriptionSubForm value={prescription} onChange={setPrescription} />
   ```

## ✅ Checklist for Developers

When using PrescriptionSubForm:

- [ ] Import the component
- [ ] Set up state with all 5 fields
- [ ] Pass value and onChange props
- [ ] Handle validation (medicament is required)
- [ ] Test with disabled=true for read-only views
- [ ] Test with multiple instances for list scenarios
- [ ] Consider showLabels=false for compact displays
- [ ] Add onRemove for multi-prescription scenarios
- [ ] Add index for numbered displays

---

**Visual Guide Version**: 1.0  
**Date**: 2025-11-20  
**Component Version**: 1.0  
**Status**: ✅ Ready for use
