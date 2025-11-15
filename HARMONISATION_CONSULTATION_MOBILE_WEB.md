# Harmonisation Mobile/Web - Page Nouvelle Consultation

## Vue d'ensemble

Ce document décrit l'harmonisation complète entre la page mobile "Nouvelle consultation" et le modal web "DataEntry", garantissant la parité fonctionnelle et des données cohérentes entre les deux plateformes.

## Objectifs atteints

✅ **Parité fonctionnelle complète** : La page mobile dispose maintenant exactement des mêmes champs, validations et options que le modal web

✅ **Code partagé** : Les constantes, types et validations sont centralisés dans un dossier `shared/`

✅ **Composants réutilisables** : Composants mobiles structurés équivalents aux composants web

✅ **Validation cohérente** : Schéma Yup unique partagé entre web et mobile

✅ **Évolutivité** : Tout ajout de champ sur web sera automatiquement reflété sur mobile

## Architecture

### Structure des dossiers

```
shalom-dhis2/
├── shared/                                 # ✨ NOUVEAU - Modules partagés
│   ├── constants/
│   │   ├── typeConsultations.ts           # Types de consultation avec filtrage par genre
│   │   ├── medications.ts                 # Médicaments, fréquences, durées
│   │   └── index.ts
│   ├── types/
│   │   ├── consultation.ts                # Types TypeScript partagés
│   │   └── index.ts
│   ├── validation/
│   │   ├── consultationValidation.ts      # Schéma Yup partagé
│   │   └── index.ts
│   ├── index.ts
│   └── package.json
│
├── web/src/
│   ├── constants/
│   │   ├── typeConsultations.js           # ✏️ Réexporte depuis shared/
│   │   ├── medications.js                 # ✏️ Réexporte depuis shared/
│   │   └── index.js
│   └── components/
│       ├── CreateDataEntryModal.jsx       # Modal web (référence)
│       ├── CategoriesSelector.jsx
│       ├── PrescriptionList.jsx
│       └── prescription/
│           ├── PrescriptionItemCard.jsx
│           ├── MedicationSelector.jsx
│           ├── FrequencySelector.jsx
│           └── DurationSelector.jsx
│
└── mobile/src/
    ├── types/
    │   └── consultation.ts                # ✏️ Réexporte depuis shared/
    ├── utils/
    │   └── consultationValidation.ts      # ✏️ Réexporte depuis shared/
    ├── components/form/
    │   ├── CategorySelector.tsx           # ✨ NOUVEAU
    │   ├── PrescriptionList.tsx           # ✨ NOUVEAU
    │   ├── TypeConsultationPicker.tsx     # ✨ NOUVEAU
    │   ├── DispensaireSelector.tsx        # ✨ NOUVEAU
    │   └── PatientPicker.tsx              # Existant
    ├── hooks/
    │   └── useConsultationForm.ts         # ✏️ Mis à jour
    ├── screens/
    │   └── NewConsultationScreen.tsx      # ✏️ Mis à jour
    └── styles/
        └── NewConsultationScreen.styles.ts # ✏️ Mis à jour
```

## Modules partagés

### 1. `shared/constants/typeConsultations.ts`

Gère les types de consultation avec filtrage automatique par genre du patient :

```typescript
export const TYPES_CONSULTATION: ConsultationType[] = [
  { code: "CURATIF", label: "Consultation Curative", icon: "🏥", femaleOnly: false },
  { code: "CPN", label: "Consultation Prénatale (CPN)", icon: "🤰", femaleOnly: true },
  // ... autres types
];

export function getConsultationTypesByGender(patientSexe?: string): ConsultationType[]
```

**Fonctionnalité clé** : Filtre automatiquement les types réservés aux femmes (CPN, CPON, ACCOUCHEMENT) pour les patients masculins.

### 2. `shared/constants/medications.ts`

Listes communes de médicaments, fréquences et durées pour l'autocomplétion :

```typescript
export const COMMON_MEDICATIONS: string[]
export const COMMON_FREQUENCIES: string[]
export const COMMON_DURATIONS: string[]
```

### 3. `shared/types/consultation.ts`

Types TypeScript partagés garantissant la cohérence des structures de données :

```typescript
export interface ConsultationFormData {
  patientId: string | null;
  dateConsultation: Date | string;
  heureConsultation?: Date | string;
  dispensaireId?: string;
  typeConsultation: string;
  categories: CategoryWithMeta[];
  prescriptionItems: PrescriptionItem[];
  notes?: string;
}

export interface CategoryWithMeta {
  categorieMaladieId: string;
  isPrincipal: boolean;
  notes: string;
  nom?: string;
  code?: string;
}

export interface PrescriptionItem {
  id?: string;
  medicament: string;
  dose?: string | null;
  frequence?: string | null;
  duree?: string | null;
  notes?: string | null;
  ordre: number;
}
```

### 4. `shared/validation/consultationValidation.ts`

Schéma Yup unique assurant des règles de validation identiques :

```typescript
export const consultationValidationSchema = yup.object().shape({
  patientId: yup.string().nullable().required('Veuillez sélectionner un patient'),
  dateConsultation: yup.mixed().required('La date de consultation est requise'),
  typeConsultation: yup.string().required('Le type de consultation est requis'),
  categories: yup.array()
    .min(1, 'Au moins une catégorie de maladie est requise')
    .test('has-principal', 'Une catégorie principale est requise', ...),
  // ... autres validations
});
```

## Nouveaux composants mobiles

### 1. TypeConsultationPicker

Sélecteur modal de type de consultation avec :
- Filtrage automatique par genre du patient
- Interface tactile optimisée
- Icônes visuelles pour chaque type
- Indication visuelle de la sélection

### 2. CategorySelector

Gestionnaire de catégories de maladies avec :
- Sélection multiple de catégories
- Marquage d'une catégorie comme principale (obligatoire si > 1 catégorie)
- Notes par catégorie
- Recherche de catégories
- Validation : au moins une catégorie requise

### 3. PrescriptionList

Gestionnaire de prescriptions structurées avec :
- Ajout/modification/suppression de médicaments
- Autocomplétion pour :
  - Médicaments (liste commune)
  - Fréquences (1x/jour, 2x/jour, etc.)
  - Durées (3 jours, 7 jours, etc.)
- Champs : médicament*, dose, fréquence, durée, notes
- Modal d'édition pour chaque prescription

### 4. DispensaireSelector

Sélecteur de dispensaire avec :
- Interface modale de sélection
- Désactivation automatique pour les agents (dispensaire pré-affecté)
- Message informatif pour les agents

## Changements dans le formulaire mobile

### Avant (ancien)

```typescript
interface ConsultationFormData {
  patientId: string | null;
  dateConsultation: Date;
  heureConsultation: Date;
  typeConsultation: string;           // Champ texte libre
  categoriesMaladie: string;          // Champ texte libre
  prescriptionsStructurees: string;   // Champ texte libre
  notes: string;
}
```

### Après (nouveau)

```typescript
interface ConsultationFormData {
  patientId: string | null;
  dateConsultation: Date | string;
  heureConsultation?: Date | string;
  dispensaireId?: string;             // ✨ NOUVEAU - Sélecteur
  typeConsultation: string;           // ✏️ Sélecteur avec filtrage genre
  categories: CategoryWithMeta[];     // ✨ NOUVEAU - Structure complexe
  prescriptionItems: PrescriptionItem[]; // ✨ NOUVEAU - Structure complexe
  notes?: string;
}
```

## Flux de validation

### Champs obligatoires

1. **Patient** : Doit être sélectionné
2. **Date de consultation** : Requise, ne peut pas être future
3. **Type de consultation** : Requis, filtré par genre du patient
4. **Catégories de maladies** : 
   - Au moins une catégorie requise
   - Si plusieurs catégories : exactement une doit être principale
   - Si une seule catégorie : automatiquement marquée comme principale
5. **Dispensaire** : Requis pour admin/manager, automatique pour agents

### Champs optionnels

- Heure de consultation
- Prescriptions structurées (recommandé mais optionnel)
- Notes générales
- Notes par catégorie
- Détails de chaque prescription (sauf médicament)

## Logique métier

### Génération automatique du diagnostic

Le champ `diagnostic` est généré automatiquement à partir de la catégorie principale :

```javascript
const principalCategory = categories.find(c => c.isPrincipal);
let diagnostic = principalCategory ? principalCategory.nom : '';
if (diagnosticDetails?.trim()) {
  diagnostic += ` (${diagnosticDetails.trim()})`;
}
```

### Gestion du dispensaire

- **Agent** : Dispensaire automatiquement affecté depuis le profil utilisateur
- **Admin/Manager** : Sélection manuelle obligatoire

### Payload envoyé au backend

```javascript
{
  dateConsultation: "2024-11-15T14:30:00.000Z",
  patientId: "123",
  dispensaireId: "456",
  typeConsultation: "CURATIF",
  diagnostic: "Maladies infectieuses (Grippe)",
  notes: "Patient présente de la fièvre",
  categories: [
    {
      categorieMaladieId: "1",
      isPrincipal: true,
      notes: "Grippe saisonnière"
    }
  ],
  prescriptionItems: [
    {
      medicament: "Paracétamol",
      dose: "500mg",
      frequence: "3x/jour",
      duree: "5 jours",
      notes: "Après les repas",
      ordre: 0
    }
  ]
}
```

## Cohérence Web/Mobile

| Fonctionnalité | Web | Mobile | Statut |
|----------------|-----|--------|--------|
| Sélection patient | ✅ Autocomplete | ✅ Modal avec recherche | ✅ |
| Date/Heure | ✅ Inputs séparés | ✅ Pickers natifs | ✅ |
| Dispensaire | ✅ Dropdown (si admin) | ✅ Modal (si admin) | ✅ |
| Type consultation | ✅ Dropdown avec genre | ✅ Modal avec genre | ✅ |
| Catégories maladies | ✅ Sélecteur structuré | ✅ Modal structuré | ✅ |
| Prescriptions | ✅ Liste structurée | ✅ Liste structurée | ✅ |
| Notes | ✅ Textarea | ✅ Textarea | ✅ |
| Validation | ✅ Yup schema | ✅ Yup schema (shared) | ✅ |
| Payload backend | ✅ Format standard | ✅ Format standard | ✅ |

## Tests recommandés

### Tests unitaires

- [ ] Validation du schéma Yup
- [ ] Filtrage des types de consultation par genre
- [ ] Génération du diagnostic à partir de la catégorie principale
- [ ] Validation des catégories (principale requise si > 1)

### Tests d'intégration mobile

- [ ] Créer une consultation avec toutes les données
- [ ] Créer une consultation minimale (champs requis uniquement)
- [ ] Ajouter/modifier/supprimer des catégories
- [ ] Ajouter/modifier/supprimer des prescriptions
- [ ] Validation du filtrage par genre
- [ ] Mode agent vs admin/manager

### Tests de cohérence

- [ ] Comparer le payload web et mobile
- [ ] Vérifier que les mêmes champs sont obligatoires
- [ ] Vérifier que les mêmes validations s'appliquent
- [ ] Vérifier que les listes déroulantes ont les mêmes options

## Points d'attention

### 🔴 Breaking changes

- Le format de `ConsultationFormData` a changé
- Les anciennes consultations avec champs texte libres doivent être migrées
- Les composants qui utilisaient les anciennes types doivent être mis à jour

### ⚠️ Compatibilité ascendante

- Les constantes web réexportent depuis `shared/`, maintenant la compatibilité
- Les imports existants continuent de fonctionner : `import { TYPES_CONSULTATION } from '../constants'`

### 🎯 Évolutivité

Pour ajouter un nouveau champ à la consultation :

1. Ajouter le champ dans `shared/types/consultation.ts`
2. Mettre à jour `shared/validation/consultationValidation.ts`
3. Créer les composants web et mobile nécessaires
4. Ajouter au payload dans les deux hooks de soumission
5. Les tests garantissent la cohérence

## Migration des données existantes

Si des consultations avec l'ancien format existent :

```javascript
// Ancien format
{
  categoriesMaladie: "Maladies infectieuses",
  prescriptionsStructurees: "Paracétamol 500mg, 3x/jour"
}

// Nouveau format (migration nécessaire)
{
  categories: [
    {
      categorieMaladieId: "trouver-id-par-nom",
      isPrincipal: true,
      notes: ""
    }
  ],
  prescriptionItems: [
    // Parser le texte libre en structure
  ]
}
```

## Support

Pour toute question ou problème lié à cette harmonisation, référer à :

- Ce document
- Code source dans `shared/`
- Composants de référence :
  - Web : `web/src/components/CreateDataEntryModal.jsx`
  - Mobile : `mobile/src/screens/NewConsultationScreen.tsx`

## Changelog

### Version 1.0.0 (2024-11-15)

- ✨ Création du dossier `shared/` avec constants, types et validation
- ✨ Nouveaux composants mobiles (CategorySelector, PrescriptionList, TypeConsultationPicker, DispensaireSelector)
- ✏️ Mise à jour de useConsultationForm pour gérer la structure complète
- ✏️ Mise à jour de NewConsultationScreen avec tous les nouveaux champs
- ✏️ Web constants réexportent depuis shared/
- ✅ Parité fonctionnelle complète entre web et mobile
