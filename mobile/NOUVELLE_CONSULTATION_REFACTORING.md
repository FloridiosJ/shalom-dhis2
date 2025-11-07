# Refonte UI - Nouvelle Consultation (Mobile)

## 📋 Vue d'ensemble

Cette refactorisation implémente une nouvelle interface utilisateur pour la page "Nouvelle Consultation" dans l'application mobile, suivant les meilleures pratiques React Native et les exigences de design spécifiées.

## ✨ Changements Principaux

### 1. Structure Simplifiée de l'Interface

#### Suppressions
- ✅ Supprimé le sous-titre "Nouvelle Consultation"
- ✅ Supprimé le label "Patient" (section titre)
- ✅ Supprimé le titre "Date et Heure"
- ✅ Supprimé la section "Pièces Jointes"
- ✅ Supprimé les deux boutons "Enregistrer" et "Envoyer"

#### Ajouts et Modifications
- ✅ Date et heure réorganisées sur deux lignes distinctes
  - Ligne 1 : **Heure** (label bleu + input)
  - Ligne 2 : **Date de la consultation** (label bleu + input)
- ✅ Pickers avec icônes et labels en bleu (#2196F3)
- ✅ Un seul bouton "Enregistrer" (bleu, accentué)

### 2. Section "Informations Cliniques"

Conserve uniquement les champs suivants :
- ✅ **Type consultation** + input (requis)
- ✅ **Catégories de maladie** + input (requis)
- ✅ **Prescriptions structurées** (optionnel, multiline)
- ✅ **Notes** (optionnel, multiline)

## 🏗️ Architecture et Composants

### Nouveaux Composants Créés

#### 1. `DatePickerBlue.tsx`
**Emplacement:** `src/components/consultation/form/DatePickerBlue.tsx`

```typescript
<DatePickerBlue
  label="Date de la consultation"
  value={date}
  onChange={handleChange}
  error={errorMessage}
  required
  maximumDate={new Date()}
/>
```

**Fonctionnalités:**
- Label en bleu (#2196F3)
- Icône calendrier en bleu
- Support min/max dates
- Gestion des erreurs
- Accessibilité > 44px

#### 2. `TimePickerBlue.tsx`
**Emplacement:** `src/components/consultation/form/TimePickerBlue.tsx`

```typescript
<TimePickerBlue
  label="Heure"
  value={time}
  onChange={handleChange}
  error={errorMessage}
  required
/>
```

**Fonctionnalités:**
- Label en bleu (#2196F3)
- Icône horloge en bleu
- Format 24h
- Gestion des erreurs
- Accessibilité > 44px

#### 3. `ConsultationInput.tsx`
**Emplacement:** `src/components/consultation/form/ConsultationInput.tsx`

```typescript
<ConsultationInput
  label="Type consultation"
  value={value}
  onChange={handleChange}
  placeholder="ex: Consultation générale"
  error={errorMessage}
  required
  multiline={false}
  numberOfLines={1}
/>
```

**Fonctionnalités:**
- Input réutilisable avec style cohérent
- Support multiline
- Gestion des erreurs avec HelperText
- Labels requis avec astérisque
- Accessibilité complète

### Hook Personnalisé

#### `useConsultationForm.ts`
**Emplacement:** `src/hooks/useConsultationForm.ts`

**Responsabilités:**
- Gestion de l'état du formulaire (react-hook-form)
- Validation avec Yup
- Sauvegarde automatique des brouillons (debounced)
- Chargement des patients
- Recherche de patients
- Soumission du formulaire
- Gestion des erreurs

**Utilisation:**
```typescript
const {
  control,
  handleSubmit,
  errors,
  isValid,
  filteredPatients,
  loadingPatients,
  saving,
  handleSearchPatients,
  handleCreatePatient,
  handleSave,
} = useConsultationForm(navigation);
```

### Styles Séparés

#### `NewConsultationScreen.styles.ts`
**Emplacement:** `src/styles/NewConsultationScreen.styles.ts`

**Structure:**
```typescript
export const THEME_COLORS = {
  primary: '#2196F3',      // Bleu pour headers et actions
  background: '#F5F5F5',   // Fond de l'app
  cardBackground: '#FFFFFF', // Fond des cartes
  textPrimary: '#212121',  // Texte principal
  textSecondary: '#757575', // Texte secondaire
  border: '#E0E0E0',       // Bordures
  error: '#D32F2F',        // Erreurs
  success: '#4CAF50',      // Succès
};
```

**Avantages:**
- Centralisation des couleurs thème
- Réutilisabilité
- Maintenance simplifiée
- Cohérence visuelle

## 📝 Types et Validation

### Types Mis à Jour

**`src/types/consultation.ts`**
```typescript
export interface ConsultationFormData {
  patientId: string | null;
  dateConsultation: Date;
  heureConsultation: Date;
  typeConsultation: string;        // NOUVEAU
  categoriesMaladie: string;        // NOUVEAU
  prescriptionsStructurees: string; // REMPLACE prescriptions
  notes: string;
  // attachments: supprimé
}
```

### Validation Mise à Jour

**`src/utils/consultationValidation.ts`**
- Ajout validation pour `typeConsultation` (requis)
- Ajout validation pour `categoriesMaladie` (requis)
- Remplacement `prescriptions` par `prescriptionsStructurees` (optionnel)
- Suppression validation `attachments`

## 🧪 Tests

### Tests Créés

1. **`DatePickerBlue.test.tsx`** - 4 tests
   - Rendu de base
   - Avec erreur
   - Champ requis
   - Avec dates min/max

2. **`TimePickerBlue.test.tsx`** - 3 tests
   - Rendu de base
   - Avec erreur
   - Champ requis

3. **`ConsultationInput.test.tsx`** - 5 tests
   - Rendu de base
   - Avec erreur
   - Champ requis
   - Mode multiline
   - Avec placeholder

**Résultats:** ✅ 12/12 tests passent

## ♿ Accessibilité

### Bonnes Pratiques Implémentées

1. **Tailles de cible tactile**
   - Tous les éléments interactifs > 44px (minHeight: 48px)

2. **Labels explicites**
   - Tous les champs ont des labels clairs
   - Champs requis marqués avec *
   - AccessibilityLabel et AccessibilityHint fournis

3. **Feedback d'état**
   - Indicateurs de chargement (ActivityIndicator)
   - États disabled clairement visibles
   - Messages d'erreur sous les champs

4. **Rôles d'accessibilité**
   - Boutons: `accessibilityRole="button"`
   - Champs texte: `accessibilityRole="text"`

## 📱 Expérience Utilisateur

### Améliorations

1. **Flux Simplifié**
   - Moins de titres et sections = interface plus épurée
   - Focus sur l'essentiel
   - Navigation claire

2. **Sauvegarde Automatique**
   - Brouillons sauvegardés automatiquement (debounced à 1s)
   - Pas de risque de perte de données
   - Reprise transparente

3. **Feedback Visuel**
   - Couleur bleu cohérente (#2196F3)
   - États de chargement clairs
   - Messages de succès/erreur

4. **Responsive**
   - KeyboardAvoidingView pour iOS/Android
   - ScrollView pour accessibilité complète
   - Adaptation automatique au clavier

## 🔄 Migration

### Compatibilité

Les changements sont **non rétrocompatibles** au niveau du type `ConsultationFormData`. 

**Action requise:**
- Les brouillons existants dans AsyncStorage doivent être migrés ou supprimés
- L'API backend doit être mise à jour pour accepter les nouveaux champs

### Migration des Brouillons

```typescript
// Code de migration à ajouter si nécessaire
const migrateDraft = (oldDraft: OldConsultationFormData) => ({
  ...oldDraft,
  typeConsultation: '',
  categoriesMaladie: '',
  prescriptionsStructurees: oldDraft.prescriptions || '',
  // attachments supprimés
});
```

## 📂 Structure des Fichiers

```
mobile/
├── src/
│   ├── components/
│   │   └── consultation/
│   │       └── form/
│   │           ├── DatePickerBlue.tsx       [NOUVEAU]
│   │           ├── TimePickerBlue.tsx       [NOUVEAU]
│   │           └── ConsultationInput.tsx    [NOUVEAU]
│   ├── hooks/
│   │   └── useConsultationForm.ts           [NOUVEAU]
│   ├── styles/
│   │   └── NewConsultationScreen.styles.ts  [NOUVEAU]
│   ├── screens/
│   │   └── NewConsultationScreen.tsx        [REFACTORISÉ]
│   ├── types/
│   │   └── consultation.ts                  [MODIFIÉ]
│   └── utils/
│       └── consultationValidation.ts        [MODIFIÉ]
└── __tests__/
    ├── DatePickerBlue.test.tsx              [NOUVEAU]
    ├── TimePickerBlue.test.tsx              [NOUVEAU]
    └── ConsultationInput.test.tsx           [NOUVEAU]
```

## ✅ Critères d'Acceptation

- ✅ La page ne comporte plus les sections/titres supprimés
- ✅ La saisie date/heure est sur deux lignes avec styling bleu
- ✅ Un seul bouton "Enregistrer" bleu visible, action claire
- ✅ Les informations cliniques sont structurées selon la liste cible
- ✅ Code modulaire, composants réutilisables, styles isolés
- ⏳ Tests manuels sur mobile/android (à effectuer)

## 🚀 Prochaines Étapes

1. **Tests Manuels**
   - Tester sur appareil Android physique
   - Tester sur émulateur iOS
   - Vérifier l'accessibilité avec VoiceOver/TalkBack
   - Capturer des screenshots

2. **Intégration Backend**
   - Adapter l'API pour accepter les nouveaux champs
   - Migration des données existantes si nécessaire

3. **Documentation Utilisateur**
   - Mise à jour du guide utilisateur
   - Formation sur les nouveaux champs

## 📚 Références

- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Hook Form](https://react-hook-form.com/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Material Design Guidelines](https://material.io/design)
