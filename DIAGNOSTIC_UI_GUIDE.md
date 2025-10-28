# Diagnostic Codification - Visual UI Guide

## Form Layout Changes

### New Field Order
1. Date de consultation *
2. Heure de consultation (optionnel)
3. Patient *
4. Dispensaire * (for admin/manager)
5. Type de consultation *
6. **🆕 Catégories de maladies *** (MOVED UP & REQUIRED)
7. **🆕 Détails du diagnostic (optionnel)** (NEW FIELD)
8. Prescription
9. Notes

---

## Section 1: Catégories de maladies (Required)

### Visual Appearance

```
┌─────────────────────────────────────────────────────────┐
│ Catégories de maladies *                                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ★ Principale  Paludisme  A09                     │   │
│  │                                          [★] [✕]  │   │
│  │ ┌──────────────────────────────────────────────┐ │   │
│  │ │ Notes pour cette catégorie (optionnel)       │ │   │
│  │ └──────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Diarrhée  B01                            [★] [✕] │   │
│  │ ┌──────────────────────────────────────────────┐ │   │
│  │ │ Notes pour cette catégorie (optionnel)       │ │   │
│  │ └──────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  [+ Ajouter une catégorie]                               │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Visual Elements

**Principal Badge (★ Principale)**:
- Background: `#fef3c7` (light amber)
- Text color: `#f59e0b` (amber)
- Font: 0.75rem, bold
- Border radius: 0.25rem
- Padding: 0.25rem 0.5rem

**Category Code Badge (e.g., "A09")**:
- Background: `#e2e8f0` (slate gray)
- Text color: `#64748b` (slate)
- Font: 0.75rem
- Border radius: rounded-full
- Padding: 0.125rem 0.5rem

**Category Card**:
- Background: `#f8fafc` (light gray)
- Border: 1px solid `#e2e8f0`
- Border radius: 0.5rem
- Padding: 0.75rem

**Set Principal Button (★)**:
- Border: 1px solid `#f59e0b` (amber)
- Color: `#f59e0b`
- Background: transparent → `#fef3c7` on hover
- Only shown when multiple categories exist
- Not shown for already principal category

**Remove Button (✕)**:
- Border: 1px solid `#ef4444` (red)
- Color: `#ef4444`
- Background: transparent → `#fee2e2` on hover
- Always visible

**Add Category Button**:
- Background: `#3b82f6` (blue)
- Color: white
- Border radius: 0.5rem
- Padding: 0.5rem 1rem

### Dropdown Selector

When "+ Ajouter une catégorie" is clicked:

```
┌─────────────────────────────────────────┐
│ + Ajouter une catégorie                 │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Paludisme          A09              │ │ ← Clickable
│ │ Diarrhée           B01              │ │ ← Clickable
│ │ Tuberculose        C02              │ │ ← Clickable
│ │ Infection resp.    D03              │ │ ← Clickable
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Section 2: Détails du diagnostic (NEW - Optional)

### Visual Appearance

```
┌─────────────────────────────────────────────────────────┐
│ Détails du diagnostic (optionnel)                       │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Observations ou précisions complémentaires sur le   │ │
│ │ diagnostic...                                       │ │
│ └─────────────────────────────────────────────────────┘ │
│ 💡 Ces détails seront ajoutés au diagnostic principal   │
│    basé sur la catégorie sélectionnée                   │
└─────────────────────────────────────────────────────────┘
```

**Textarea**:
- Rows: 2
- Background: `#f8fafc`
- Border: 1px solid `#cbd5e1`
- Border radius: 0.5rem
- Padding: 0.5rem 0.75rem

**Helper Text**:
- Font size: 0.875rem
- Color: `#64748b` (gray)
- Icon: 💡 (lightbulb)
- Margin top: 0.25rem

---

## User Flows

### Flow 1: Creating New Consultation (Single Category)

1. User clicks "+ Ajouter une catégorie"
2. Dropdown appears with available categories
3. User clicks "Paludisme A09"
4. Category card appears with:
   - ★ Principale badge (auto-added)
   - Category name and code
   - [✕] remove button (no [★] button since it's the only one)
   - Notes input field
5. User optionally adds details in "Détails du diagnostic"
6. On submit, diagnostic is generated: `A09 - Paludisme (details if any)`

### Flow 2: Creating New Consultation (Multiple Categories)

1. User adds first category (e.g., "Paludisme A09")
   - Automatically marked as principal
2. User adds second category (e.g., "Diarrhée B01")
   - NOT marked as principal
   - Shows [★] button to set as principal
3. User can click [★] on "Diarrhée" to make it principal
   - "Paludisme" principal badge removed
   - "Diarrhée" gets principal badge
   - [★] button now appears on "Paludisme"
4. User optionally adds notes to each category
5. User optionally adds diagnostic details
6. On submit, diagnostic is generated from principal category + details

### Flow 3: Editing Existing Consultation

1. Modal opens with existing categories loaded
2. Each category card shows:
   - Principal badge if it was principal
   - Category name and code
   - Existing notes
   - [★] and [✕] buttons
3. User can:
   - Add new categories
   - Remove existing categories
   - Change which category is principal
   - Modify notes
   - Update diagnostic details
4. Validation runs on submit (same as create)

---

## Validation States

### Success State (Valid)
- At least one category selected
- Exactly one category marked as principal (enforced automatically)
- Form can be submitted

### Error State 1: No Categories
```
┌─────────────────────────────────────────────────────────┐
│ Catégories de maladies *                                │
├─────────────────────────────────────────────────────────┤
│  [+ Ajouter une catégorie]                               │
│                                                           │
│  ⚠️ Au moins une catégorie de maladie est requise        │
└─────────────────────────────────────────────────────────┘
```

### Error State 2: No Principal (Multiple Categories)
```
┌─────────────────────────────────────────────────────────┐
│ Catégories de maladies *                                │
├─────────────────────────────────────────────────────────┤
│  [Category cards without principal badge]                │
│                                                           │
│  ⚠️ Vous devez sélectionner une catégorie principale     │
└─────────────────────────────────────────────────────────┘
```

**Error Styling**:
- Color: `#dc2626` (red)
- Font size: 0.875rem
- Margin top: 0.25rem

---

## Color Palette

| Element | Background | Border | Text |
|---------|-----------|--------|------|
| Principal Badge | `#fef3c7` | none | `#f59e0b` |
| Code Badge | `#e2e8f0` | none | `#64748b` |
| Category Card | `#f8fafc` | `#e2e8f0` | `#1e293b` |
| Set Principal Btn | transparent | `#f59e0b` | `#f59e0b` |
| Set Principal Hover | `#fef3c7` | `#f59e0b` | `#f59e0b` |
| Remove Btn | transparent | `#ef4444` | `#ef4444` |
| Remove Hover | `#fee2e2` | `#ef4444` | `#ef4444` |
| Add Category Btn | `#3b82f6` | none | `#ffffff` |
| Error Text | transparent | none | `#dc2626` |

---

## Responsive Behavior

- Modal width: 400px - 600px (responsive)
- Max height: 90vh with scroll
- Categories stack vertically
- Buttons adapt to available space
- Touch-friendly on mobile (minimum 44px tap targets)

---

## Accessibility

- All buttons have `title` attributes for tooltips
- Error messages use semantic error color and icons
- Form fields have proper labels with `htmlFor`
- Required fields marked with `*` and aria attributes
- Modal has `aria-modal="true"` and `role="dialog"`
- Focus management: first input receives focus on modal open
- Keyboard navigation supported throughout

---

## Data Output Example

When user selects:
- Principal: "Paludisme (A09)"
- Secondary: "Diarrhée (B01)" 
- Details: "Fièvre élevée depuis 3 jours"

**Generated Diagnostic**:
```
A09 - Paludisme (Fièvre élevée depuis 3 jours)
```

**Payload to Backend**:
```json
{
  "diagnostic": "A09 - Paludisme (Fièvre élevée depuis 3 jours)",
  "categories": [
    {
      "categorieMaladieId": "uuid-123",
      "isPrincipal": true,
      "notes": ""
    },
    {
      "categorieMaladieId": "uuid-456",
      "isPrincipal": false,
      "notes": ""
    }
  ]
}
```
