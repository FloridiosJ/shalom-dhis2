# Diagnostic Codification - UI Changes Documentation

## Overview
This document describes the UI changes made to implement diagnostic codification and disease category management in the DataEntry form.

## Changes Summary

### Before
- **Diagnostic field**: Free-text input field allowing any text
- **Categories**: Optional section, not required
- **Validation**: Only required non-empty diagnostic text

### After
- **Diagnostic**: Automatically generated from selected principal category
- **Categories section**: Moved to top, now **required** with at least one category
- **Diagnostic Details**: New optional textarea for observations
- **Validation**: 
  - At least one category required
  - Exactly one principal category required when multiple categories selected
  - Auto-marks single category as principal

## Detailed Changes

### 1. Category Selection (Required)
**Location**: Top of form, after "Type de consultation"

**Features**:
- Required field with red asterisk (*)
- Shows selected categories as cards with:
  - Principal badge (★ Principale) for the main category
  - Category name and code
  - Remove button (✕)
  - Set as principal button (★) - only shown when multiple categories
  - Notes input field for each category

**User Flow**:
1. Click "+ Ajouter une catégorie" button
2. Select from dropdown of available categories
3. First category is automatically marked as principal
4. For additional categories, user can click ★ to change which is principal
5. Only one category can be principal at a time

### 2. Diagnostic Details (Optional)
**Location**: After categories section

**Features**:
- Optional textarea (2 rows)
- Labeled as "Détails du diagnostic (optionnel)"
- Placeholder: "Observations ou précisions complémentaires sur le diagnostic..."
- Helper text: "💡 Ces détails seront ajoutés au diagnostic principal basé sur la catégorie sélectionnée"

**Purpose**: 
Allows healthcare providers to add free-text observations that complement the structured category-based diagnosis.

### 3. Auto-Generated Diagnostic
**How it works**:
- When submitting the form, diagnostic is automatically generated as:
  - If category has code: `[CODE] - [Category Name] (details)` 
  - If no code: `[Category Name] (details)`
  - Details are only added if the diagnosticDetails field has content
  
**Example**:
- Category: "A09 - Diarrhée et gastro-entérite"
- Details: "Symptômes depuis 3 jours, déshydratation modérée"
- Result: `A09 - Diarrhée et gastro-entérite (Symptômes depuis 3 jours, déshydratation modérée)`

### 4. Validation Messages

**Error Messages**:
- "Au moins une catégorie de maladie est requise" - When no categories selected
- "Vous devez sélectionner une catégorie principale" - When multiple categories but none marked as principal
- "Une seule catégorie principale autorisée" - When more than one category marked as principal

### 5. Visual Indicators
- Selected categories appear in blue-tinted cards
- Principal category has gold star badge (★ Principale)
- Category codes shown in gray badges
- Delete and principal buttons appear on hover

## Backend Validation

The backend enforces the same rules:
- At least one category required (or diagnostic text for backward compatibility)
- If multiple categories: exactly one must be marked as isPrincipal=true
- All categories must have valid IDs

**Error Codes**:
- `MISSING_CATEGORIES` - No categories provided
- `INVALID_CATEGORY` - Category missing ID
- `MISSING_PRINCIPAL_CATEGORY` - Multiple categories but no principal
- `MULTIPLE_PRINCIPAL_CATEGORIES` - More than one principal category

## Data Flow

### Creating New Consultation
1. User selects at least one disease category
2. First category auto-marked as principal
3. User can add more categories and change which is principal
4. User optionally adds diagnostic details
5. On submit:
   - Frontend validates category selection
   - Frontend generates diagnostic text from principal category + details
   - Backend receives categories array with metadata (id, isPrincipal, notes)
   - Backend validates categories rules
   - Backend saves consultation with categories

### Editing Existing Consultation
1. Modal loads with existing categories from `categoriesWithMeta`
2. Categories displayed with current principal status and notes
3. User can add/remove categories, change principal, modify notes
4. Same validation and submission flow as creation

## Benefits

1. **Data Quality**: Standardized categories instead of free text
2. **Analytics**: Easy aggregation by disease category codes
3. **ICD-10 Ready**: Code field supports ICD-10 or other standard codes
4. **Flexibility**: Optional details field for additional observations
5. **Consistency**: Enforced principal category ensures clear primary diagnosis
6. **Backward Compatible**: Diagnostic field still exists for legacy data

## Migration Notes

- Existing consultations with free-text diagnostics remain unchanged
- New consultations require category selection
- Categories can be imported/seeded with ICD-10 codes
- Old diagnostic texts can be manually mapped to categories if needed
