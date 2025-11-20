# Guide d'Utilisation : PrescriptionInputWithModal (Mobile - React Native)

## 📱 Vue d'ensemble

Le composant **PrescriptionInputWithModal** a été implémenté pour la partie mobile (React Native) de l'application. Il offre une expérience native optimisée pour iOS et Android permettant la saisie structurée de prescriptions médicales.

## 🎯 Localisation dans l'Application Mobile

### Écran Principal
**NewConsultationScreen** (`mobile/src/screens/NewConsultationScreen.tsx`)
- Accessible lors de la création d'une nouvelle consultation
- Section "Prescriptions structurées"
- Remplace le champ texte simple précédent

## 📦 Composants Créés

### 1. Composants Principaux

#### PrescriptionInputWithModal
`mobile/src/components/form/PrescriptionInputWithModal.tsx`

Composant d'input qui ouvre un modal pour la saisie de prescriptions.

**Props**:
```typescript
interface PrescriptionInputWithModalProps {
  prescriptions: PrescriptionItem[];
  onChange: (prescriptions: PrescriptionItem[]) => void;
  disabled?: boolean;
  error?: string;
}
```

**Fonctionnalités**:
- Input tactile qui ouvre un modal
- Affichage intelligent du résumé des prescriptions
- Liste des médicaments ajoutés
- Boutons de suppression pour chaque médicament

#### PrescriptionSubForm
`mobile/src/components/form/PrescriptionSubForm.tsx`

Formulaire contenant tous les champs de prescription.

**Props**:
```typescript
interface PrescriptionSubFormProps {
  value: PrescriptionItem;
  onChange: (value: PrescriptionItem) => void;
  showLabels?: boolean;
  disabled?: boolean;
}
```

**Champs**:
- Médicament (obligatoire) avec MedicationPicker
- Dose (texte libre)
- Fréquence avec FrequencyPicker
- Durée avec DurationPicker
- Notes (texte libre)

### 2. Pickers Spécialisés

#### MedicationPicker
`mobile/src/components/form/MedicationPicker.tsx`

Sélecteur de médicament avec recherche.

**Fonctionnalités**:
- Liste de 93 médicaments courants
- Recherche en temps réel
- Modal full-screen pour iOS/Android
- Bouton clear pour effacer la sélection

#### FrequencyPicker
`mobile/src/components/form/FrequencyPicker.tsx`

Sélecteur de fréquence d'administration.

**Fonctionnalités**:
- 13 fréquences prédéfinies
- Option de saisie personnalisée
- Liste défilante optimisée

#### DurationPicker
`mobile/src/components/form/DurationPicker.tsx`

Sélecteur de durée de traitement.

**Fonctionnalités**:
- 12 durées courantes
- Option de saisie personnalisée
- Interface tactile optimisée

### 3. Constants

#### medications.ts
`mobile/src/constants/medications.ts`

Contient toutes les listes et types.

**Exports**:
```typescript
export const COMMON_MEDICATIONS: string[] // 93 médicaments
export const COMMON_FREQUENCIES: string[] // 13 fréquences
export const COMMON_DURATIONS: string[] // 12 durées

export interface PrescriptionItem {
  id: string;
  medicament: string;
  dose?: string;
  frequence?: string;
  duree?: string;
  notes?: string;
  ordre?: number;
}
```

## 🎨 Flux d'Utilisation

### Étape 1 : État Initial (Vide)
```
┌────────────────────────────────────────┐
│ Prescriptions structurées              │
│ (Recommandé pour analyse)              │
├────────────────────────────────────────┤
│ [Cliquez pour ajouter des médicaments] │
└────────────────────────────────────────┘
```

### Étape 2 : Tap sur l'Input → Modal s'ouvre
```
         ┌─────────────────────────────┐
         │ Ajouter un médicament   [✕] │
         ├─────────────────────────────┤
         │                             │
         │ Médicament *                │
         │ [Sélectionner...]           │
         │                             │
         │ Dose                        │
         │ [Ex: 500mg...]              │
         │                             │
         │ Fréquence                   │
         │ [Sélectionner...]           │
         │                             │
         │ Durée                       │
         │ [Sélectionner...]           │
         │                             │
         │ Notes                       │
         │ [Précisions...]             │
         │                             │
         ├─────────────────────────────┤
         │ [Ajouter]    [Terminer]     │
         └─────────────────────────────┘
```

### Étape 3 : Après Ajout de Médicaments
```
┌────────────────────────────────────────┐
│ Prescriptions structurées              │
│ (Recommandé pour analyse)              │
├────────────────────────────────────────┤
│ [2 médicaments prescrits]              │
└────────────────────────────────────────┘

Liste des médicaments:
┌────────────────────────────────────────┐
│ Paracétamol - 500mg                [✕] │
│ - 3x/jour (3 jours)                    │
├────────────────────────────────────────┤
│ Amoxicilline - 1g                  [✕] │
│ - 2x/jour (7 jours)                    │
└────────────────────────────────────────┘
```

## 💻 Utilisation dans le Code

### Dans NewConsultationScreen

```typescript
import PrescriptionInputWithModal from '../components/form/PrescriptionInputWithModal';

// Dans le formulaire
<Controller
  control={control}
  name="prescriptionsStructurees"
  render={({field: {onChange, value}}) => (
    <PrescriptionInputWithModal
      prescriptions={value || []}
      onChange={onChange}
      error={errors.prescriptionsStructurees?.message}
    />
  )}
/>
```

### Type de Données

```typescript
// Type mis à jour dans consultation.ts
export interface ConsultationFormData {
  patientId: string | null;
  dateConsultation: Date;
  heureConsultation: Date;
  typeConsultation: string;
  categoriesMaladie: string;
  prescriptionsStructurees: PrescriptionItem[]; // Array au lieu de string
  notes: string;
}
```

### Hook de Formulaire

```typescript
// Valeurs par défaut mises à jour
defaultValues: {
  // ...autres champs
  prescriptionsStructurees: [], // Array vide au lieu de string vide
  // ...
}
```

## 🎯 Caractéristiques Mobiles

### 1. Modal Natif
- Animation slide depuis le bas (iOS/Android)
- `presentationStyle="pageSheet"` pour iOS
- Bouton fermer natif
- Gesture de glissement pour fermer (iOS)

### 2. Gestion du Clavier
```typescript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
>
  {/* Contenu */}
</KeyboardAvoidingView>
```

### 3. Liste Optimisée
- Utilise `FlatList` pour performance
- `keyExtractor` pour optimisation
- Séparateurs stylisés
- Touch feedback sur les items

### 4. Recherche en Temps Réel
```typescript
const filteredMedications = COMMON_MEDICATIONS.filter(med =>
  med.toLowerCase().includes(searchQuery.toLowerCase()),
);
```

## 🎨 Styles React Native

### Palette de Couleurs
```typescript
Primary Blue: #0284c7
Text Dark: #0f172a
Text Medium: #1e293b
Text Light: #64748b
Placeholder: #94a3b8
Border: #cbd5e1
Background Light: #f8fafc
Error Red: #ef4444
```

### Composants React Native Paper
- `TextInput` avec mode outlined
- `Button` avec mode contained/outlined
- `IconButton` pour les icônes
- `ActivityIndicator` pour le chargement

## 📱 Spécificités Plateforme

### iOS
- Modal avec présentation pageSheet
- Padding ajusté pour le clavier
- Animations natives
- Safe area automatique

### Android
- Modal full screen
- Keyboard behavior automatique
- Bouton back natif fonctionne
- Material Design

## 🔧 Personnalisation

### Modifier les Listes

Pour ajouter des médicaments:
```typescript
// Dans mobile/src/constants/medications.ts
export const COMMON_MEDICATIONS = [
  // ... médicaments existants
  'Nouveau Médicament',
].sort();
```

Pour ajouter des fréquences:
```typescript
export const COMMON_FREQUENCIES = [
  // ... fréquences existantes
  'Nouvelle Fréquence',
];
```

### Styles Personnalisés

Modifier les styles dans chaque composant:
```typescript
const styles = StyleSheet.create({
  container: {
    // Vos styles
  },
  // ...
});
```

## 🐛 Débogage

### Vérifier les Valeurs
```typescript
console.log('Prescriptions:', prescriptions);
console.log('Current prescription:', currentPrescription);
```

### Tester la Validation
```typescript
if (!currentPrescription.medicament.trim()) {
  console.warn('Médicament requis!');
  return;
}
```

## 📊 Différences Web vs Mobile

| Fonctionnalité | Web | Mobile |
|----------------|-----|--------|
| Modal | HTML/CSS overlay | Native Modal |
| Recherche | Input HTML | TextInput RN |
| Liste | HTML list | FlatList |
| Styles | CSS modules | StyleSheet |
| Clavier | Auto | KeyboardAvoidingView |
| Animations | CSS transitions | Native animations |

## ✅ Tests

### Tester Manuellement
1. Ouvrir NewConsultationScreen
2. Tapper sur "Prescriptions structurées"
3. Modal s'ouvre
4. Sélectionner un médicament
5. Remplir les champs
6. Tapper "Ajouter"
7. Formulaire se réinitialise
8. Ajouter un autre médicament
9. Tapper "Terminer"
10. Vérifier la liste affichée
11. Tester suppression avec ✕

### Points de Contrôle
- ✅ Modal s'ouvre au tap
- ✅ Recherche fonctionne (MedicationPicker)
- ✅ Sélection met à jour le champ
- ✅ Ajouter crée un nouvel item
- ✅ Liste affiche correctement
- ✅ Suppression fonctionne
- ✅ Input résumé correct
- ✅ Validation médicament requis
- ✅ Clavier se gère bien
- ✅ Modal se ferme correctement

## 🚀 Prochaines Étapes

### Améliorations Possibles
1. **Validation avancée**
   - Vérifier cohérence dose/fréquence
   - Alertes interactions médicamenteuses

2. **Historique**
   - Prescriptions fréquentes du patient
   - Favoris par utilisateur

3. **Suggestions**
   - Complétion automatique dose
   - Fréquence suggérée par médicament

4. **Export**
   - Générer ordonnance PDF
   - Partager prescription

5. **Offline**
   - Cache des médicaments
   - Sync prescriptions hors ligne

## 📚 Références

- React Native Paper: https://callstack.github.io/react-native-paper/
- React Hook Form: https://react-hook-form.com/
- TypeScript: https://www.typescriptlang.org/

---

**Version**: 1.0.0  
**Platform**: React Native (iOS & Android)  
**Date**: 2025-11-20  
**Auteur**: GitHub Copilot pour FloridiosJ/shalom-dhis2
