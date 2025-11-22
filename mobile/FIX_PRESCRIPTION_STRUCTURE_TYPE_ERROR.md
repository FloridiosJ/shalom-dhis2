# Fix: prescriptionsStructurees Type Error

## Issue Description
When adding a structured prescription in the "Nouvelle Consultation" screen, a validation error occurred:

```
prescriptionsStructurees must be a `string` type, but the final value was: 
[ 
  { 
    "id": "temp-1763811489694", 
    "medicament": "Albendazole", 
    "dose": "4", 
    "frequence": "3x/jour", 
    "duree": "7 jours", 
    "notes": "Rtf...", 
    "ordre": "0" 
  } 
]
```

## Root Cause

The issue arose from a mismatch between:
- **Frontend type definition**: `prescriptionsStructurees: PrescriptionItem[]` (array)
- **Validation schema**: Expected a `string` type
- **API/Backend**: Expected a JSON-encoded string

No serialization was happening before validation, causing the validation to fail when users added prescriptions.

## Solution

### Approach
The fix uses `yup.mixed().transform()` to automatically serialize the array to a JSON string during validation. This ensures:
1. Type safety in the form (TypeScript sees `PrescriptionItem[]`)
2. Proper serialization for API/backend (string)
3. Single source of truth (validation schema handles transformation)

### Changes Made

#### 1. Validation Schema (`mobile/src/utils/consultationValidation.ts`)

**Before:**
```typescript
prescriptionsStructurees: yup.string().optional()
```

**After:**
```typescript
prescriptionsStructurees: yup
  .mixed()
  .optional()
  .transform((value) => {
    // If it's already a string, return it as-is
    if (typeof value === 'string') {
      return value;
    }
    // If it's an array or object, serialize it to JSON string
    if (Array.isArray(value) || (value && typeof value === 'object')) {
      return JSON.stringify(value);
    }
    // For empty/null/undefined, return empty string
    return '';
  })
```

**What this does:**
- Accepts any type of input (`yup.mixed()`)
- Automatically transforms arrays/objects to JSON strings
- Preserves strings as-is (no double-encoding)
- Handles null/undefined gracefully

#### 2. Type Definitions (`mobile/src/types/consultation.ts`)

Added documentation:
```typescript
/**
 * Structured prescriptions array.
 * This is stored as an array in the form but will be automatically
 * serialized to a JSON string during validation and submission.
 */
prescriptionsStructurees: PrescriptionItem[];
```

#### 3. Form Submission (`mobile/src/hooks/useConsultationForm.ts`)

Added comment:
```typescript
// Note: prescriptionsStructurees is already serialized to JSON string by the validation schema
```

Removed redundant serialization code that would have caused double-encoding.

#### 4. Tests (`mobile/__tests__/consultationValidation.test.ts`)

Added 3 new tests:

1. **Array to JSON string transformation**
   ```typescript
   it('transforms prescriptionsStructurees array to JSON string', async () => {
     const validData = {
       // ... other fields
       prescriptionsStructurees: [
         {
           id: 'temp-1763811489694',
           medicament: 'Albendazole',
           dose: '4',
           frequence: '3x/jour',
           duree: '7 jours',
           notes: 'Rtf...',
           ordre: 0,
         },
       ],
     };
     
     const result = await consultationValidationSchema.validate(validData);
     
     expect(typeof result.prescriptionsStructurees).toBe('string');
     const parsed = JSON.parse(result.prescriptionsStructurees);
     expect(Array.isArray(parsed)).toBe(true);
   });
   ```

2. **String input (no transformation)**
   ```typescript
   it('keeps prescriptionsStructurees as string if already a string', async () => {
     // Tests that existing string values are preserved
   });
   ```

3. **Empty array handling**
   ```typescript
   it('handles empty array for prescriptionsStructurees', async () => {
     // Tests that empty arrays become "[]"
   });
   ```

## Test Results

All 9 tests pass:
```
✓ validates a complete and valid form
✓ rejects form without patient
✓ rejects form without typeConsultation
✓ rejects form without categoriesMaladie
✓ rejects future date
✓ allows optional fields to be empty
✓ transforms prescriptionsStructurees array to JSON string (NEW)
✓ keeps prescriptionsStructurees as string if already a string (NEW)
✓ handles empty array for prescriptionsStructurees (NEW)

Test Suites: 1 passed
Tests: 9 passed
```

## How It Works

### User Flow
1. User opens "Nouvelle Consultation" screen
2. User adds a prescription via `PrescriptionInputWithModal`
3. Prescription is stored as `PrescriptionItem[]` in form state
4. User clicks "Enregistrer" (Save)
5. `handleSubmit` triggers validation with `consultationValidationSchema`
6. **Validation automatically transforms array to JSON string**
7. Validated data (with serialized string) is passed to `handleSave`
8. Data is sent to API with correct format

### Before Fix
```
User Input (Array) → Validation → ❌ ERROR: Expected string, got array
```

### After Fix
```
User Input (Array) → Validation (with transform) → ✅ JSON String → API
```

## Edge Cases Handled

1. **Array input** → JSON string
   - `[{...}]` → `"[{...}]"`

2. **Already a string** → No change
   - `"[{...}]"` → `"[{...}]"`

3. **Empty array** → JSON string
   - `[]` → `"[]"`

4. **Null/undefined** → Empty string
   - `null` → `""`
   - `undefined` → `""`

## Benefits

✅ **No breaking changes** - Existing code continues to work  
✅ **Type safety** - TypeScript types remain accurate  
✅ **Single source of truth** - Validation schema handles all serialization  
✅ **No double-encoding** - Transform checks type before serializing  
✅ **Well-tested** - 3 new tests cover all scenarios  
✅ **Documented** - Comments explain the behavior  
✅ **Security** - CodeQL scan passed with no vulnerabilities  

## Testing Locally

To test this fix locally:

1. Install dependencies:
   ```bash
   cd mobile
   npm install
   ```

2. Run tests:
   ```bash
   npm test -- consultationValidation.test.ts
   ```

3. Test on device/emulator:
   ```bash
   npm run android  # or npm run ios
   ```

4. Steps to verify:
   - Open "Nouvelle Consultation" screen
   - Select a patient
   - Add a structured prescription (e.g., Albendazole)
   - Click "Enregistrer"
   - ✅ Should save without error
   - ❌ Before fix: Would show type error

## Backend Considerations

### Expected Format
The backend/API should expect `prescriptionsStructurees` as a **JSON-encoded string**:

```graphql
type DataEntryInput {
  prescriptionsStructurees: String  # JSON-encoded array
}
```

### Parsing
When reading the data, parse the string back to array:
```typescript
const prescriptions = JSON.parse(dataEntry.prescriptionsStructurees);
// prescriptions is now PrescriptionItem[]
```

### Example
```json
{
  "prescriptionsStructurees": "[{\"id\":\"temp-1763811489694\",\"medicament\":\"Albendazole\",\"dose\":\"4\",\"frequence\":\"3x/jour\",\"duree\":\"7 jours\",\"notes\":\"Rtf...\",\"ordre\":0}]"
}
```

## Related Files

- `mobile/src/utils/consultationValidation.ts` - Validation schema with transform
- `mobile/src/types/consultation.ts` - Type definitions
- `mobile/src/hooks/useConsultationForm.ts` - Form submission logic
- `mobile/__tests__/consultationValidation.test.ts` - Validation tests
- `mobile/src/screens/NewConsultationScreen.tsx` - UI screen
- `mobile/src/components/form/PrescriptionInputWithModal.tsx` - Prescription input component

## References

- [Yup Transform Documentation](https://github.com/jquense/yup#mixedtransformtransformer-schema-schema)
- [React Hook Form + Yup](https://react-hook-form.com/get-started#SchemaValidation)
- Original Issue: Bug: prescriptionStructurees type error (expected string, got array/object) sur Nouvelle Consultation

## Author
GitHub Copilot Coding Agent

## Date
November 22, 2025
