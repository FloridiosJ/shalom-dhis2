# Shared Module

This folder contains shared constants, types, and validation schemas used across both web and mobile platforms.

## Structure

```
shared/
├── constants/
│   ├── typeConsultations.ts    # Consultation types with gender filtering
│   ├── medications.ts           # Common medications, frequencies, durations
│   └── index.ts
├── types/
│   ├── consultation.ts          # Shared TypeScript types
│   └── index.ts
├── validation/
│   ├── consultationValidation.ts # Yup validation schema
│   └── index.ts
├── index.ts                     # Main export file
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

Since this is a local package within the monorepo, no installation is required. Import directly using relative paths:

### From Web

```javascript
import { TYPES_CONSULTATION, getConsultationTypesByGender } from '../../../shared/constants';
import { ConsultationFormData, PrescriptionItem } from '../../../shared/types';
import { consultationValidationSchema } from '../../../shared/validation';
```

### From Mobile

```typescript
import { TYPES_CONSULTATION, getConsultationTypesByGender } from '../../../shared/constants';
import { ConsultationFormData, PrescriptionItem } from '../../../shared/types';
import { consultationValidationSchema } from '../../../shared/validation';
```

## Dependencies

- `yup`: ^1.3.3 (for validation schema)

Note: Make sure yup is installed in both web and mobile projects.

## Modules

### Constants

#### `typeConsultations.ts`

- **TYPES_CONSULTATION**: Array of consultation types with metadata (code, label, icon, femaleOnly)
- **getConsultationTypeLabel(code)**: Get label for a consultation type
- **getConsultationTypeIcon(code)**: Get icon for a consultation type  
- **getConsultationTypesByGender(patientSexe)**: Filter consultation types by patient gender

#### `medications.ts`

- **COMMON_MEDICATIONS**: Sorted array of common medication names
- **COMMON_FREQUENCIES**: Array of dosage frequencies (1x/jour, 2x/jour, etc.)
- **COMMON_DURATIONS**: Array of treatment durations (3 jours, 7 jours, etc.)

### Types

#### `consultation.ts`

Core TypeScript interfaces:

- **PatientOption**: Patient selection data
- **CategoryWithMeta**: Disease category with metadata
- **PrescriptionItem**: Structured prescription item
- **ConsultationFormData**: Complete consultation form data
- **ConsultationDraft**: Draft consultation data
- **CategorieMaladie**: Disease category definition
- **Dispensaire**: Health facility definition

### Validation

#### `consultationValidation.ts`

- **consultationValidationSchema**: Yup schema for validating consultation forms
  - Validates all required fields
  - Ensures date/time are not in the future
  - Validates category structure (at least one, one principal if multiple)
  - Validates prescription items structure

## Usage Examples

### Filtering Consultation Types by Gender

```typescript
import { getConsultationTypesByGender } from '../../../shared/constants';

const patient = { sexe: 'M' }; // Male patient
const availableTypes = getConsultationTypesByGender(patient.sexe);
// Returns all types except femaleOnly ones (CPN, CPON, ACCOUCHEMENT)
```

### Using the Validation Schema

```typescript
import { consultationValidationSchema } from '../../../shared/validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

const { control, handleSubmit, errors } = useForm({
  resolver: yupResolver(consultationValidationSchema),
  defaultValues: {
    patientId: null,
    dateConsultation: new Date(),
    typeConsultation: '',
    categories: [],
    prescriptionItems: [],
    notes: '',
  },
});
```

### Creating a Consultation Payload

```typescript
import { ConsultationFormData, CategoryWithMeta, PrescriptionItem } from '../../../shared/types';

const formData: ConsultationFormData = {
  patientId: '123',
  dateConsultation: new Date(),
  heureConsultation: new Date(),
  dispensaireId: '456',
  typeConsultation: 'CURATIF',
  categories: [
    {
      categorieMaladieId: '1',
      isPrincipal: true,
      notes: 'Grippe saisonnière',
      nom: 'Maladies infectieuses',
      code: 'INF',
    }
  ],
  prescriptionItems: [
    {
      medicament: 'Paracétamol',
      dose: '500mg',
      frequence: '3x/jour',
      duree: '5 jours',
      notes: 'Après les repas',
      ordre: 0,
    }
  ],
  notes: 'Patient présente de la fièvre',
};
```

## Maintenance

When adding new fields or changing the structure:

1. Update types in `types/consultation.ts`
2. Update validation schema in `validation/consultationValidation.ts`
3. Update both web and mobile forms to include new fields
4. Update documentation in main project README

## Benefits

✅ **Single source of truth**: No duplication of constants or types  
✅ **Type safety**: TypeScript ensures consistency  
✅ **Consistent validation**: Same rules applied on both platforms  
✅ **Easy maintenance**: Update once, applies everywhere  
✅ **Discoverability**: All shared code in one place
