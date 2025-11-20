# ConsultationPicker et CategoriePicker - Guide d'utilisation

## Vue d'ensemble

Ce document décrit l'utilisation des deux composants de sélection spécialisés créés pour faciliter la saisie structurée des informations cliniques sur l'écran de consultation mobile.

## Composants

### 1. ConsultationPicker

Composant permettant de sélectionner un type de consultation parmi une liste prédéfinie.

#### Caractéristiques

- **Interface modale** : Affiche les types de consultation dans un modal plein écran
- **Recherche intégrée** : Permet de filtrer les types par libellé, description ou code
- **Affichage structuré** : Chaque type affiche son libellé et sa description
- **Types actifs uniquement** : Ne montre que les types avec `isActive = true`
- **Compatible react-hook-form** : S'intègre facilement avec `Controller`

#### Utilisation

```tsx
import ConsultationPicker from '../components/form/ConsultationPicker';
import { Controller } from 'react-hook-form';

// Dans votre formulaire
<Controller
  control={control}
  name="typeConsultation"
  render={({ field: { onChange, value } }) => (
    <ConsultationPicker
      value={value}
      onChange={onChange}
      error={errors.typeConsultation?.message}
      required
    />
  )}
/>
```

#### Props

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| `value` | `string \| null` | Oui | Code du type de consultation sélectionné (ex: "CURATIF") |
| `onChange` | `(code: string \| null) => void` | Oui | Callback appelé lors de la sélection |
| `error` | `string` | Non | Message d'erreur à afficher |
| `required` | `boolean` | Non | Affiche l'astérisque de champ requis |

#### Types de consultation disponibles

Les types suivants sont définis dans `src/constants/consultationTypes.ts` :

- **CURATIF** : Consultation Curative
- **PREVENTIF** : Consultation Préventive
- **CPN** : Consultation Prénatale
- **CPON** : Consultation Post-Natale
- **ACCOUCHEMENT** : Accouchement
- **VACCINATION** : Vaccination
- **NUTRITION** : Suivi Nutritionnel
- **PLANIFICATION** : Planification Familiale
- **IST** : IST/SIDA
- **PALUDISME** : Paludisme
- **TUBERCULOSE** : Tuberculose
- **URGENCE** : Urgence

---

### 2. CategoriePicker

Composant permettant de sélectionner une catégorie de maladie avec une structure hiérarchique à 2 niveaux (catégorie principale → sous-catégorie).

#### Caractéristiques

- **Sélection hiérarchique** : Navigation en deux étapes (catégorie puis sous-catégorie)
- **Bouton retour** : Permet de revenir à la liste des catégories principales
- **Recherche à chaque niveau** : Filtre disponible pour catégories et sous-catégories
- **Compteur de sous-catégories** : Affiche le nombre de sous-catégories disponibles
- **Valeur combinée** : Retourne un format `CODE_CATEGORIE:CODE_SOUS_CATEGORIE`

#### Utilisation

```tsx
import CategoriePicker from '../components/form/CategoriePicker';
import { Controller } from 'react-hook-form';

// Dans votre formulaire
<Controller
  control={control}
  name="categoriesMaladie"
  render={({ field: { onChange, value } }) => (
    <CategoriePicker
      value={value}
      onChange={onChange}
      error={errors.categoriesMaladie?.message}
      required
    />
  )}
/>
```

#### Props

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| `value` | `string \| null` | Oui | Format: "CATEGORIE_CODE:SUBCATEGORIE_CODE" (ex: "INFECTIEUSES:RESPIRATOIRES") |
| `onChange` | `(value: string \| null) => void` | Oui | Callback appelé lors de la sélection |
| `error` | `string` | Non | Message d'erreur à afficher |
| `required` | `boolean` | Non | Affiche l'astérisque de champ requis |

#### Format de la valeur

La valeur retournée est une chaîne avec le format suivant :
```
"CODE_CATEGORIE_PRINCIPALE:CODE_SOUS_CATEGORIE"
```

Exemples :
- `"INFECTIEUSES:RESPIRATOIRES"` : Maladies Infectieuses → Infections Respiratoires
- `"CHRONIQUES:DIABETE"` : Maladies Chroniques → Diabète
- `"MATERNITE:GROSSESSE_RISQUE"` : Santé Maternelle → Grossesse à Risque

#### Catégories disponibles

Les catégories suivantes sont définies dans `src/constants/categoriesMaladies.ts` :

1. **Maladies Infectieuses** (4 sous-catégories)
2. **Maladies Parasitaires** (3 sous-catégories)
3. **Maladies Chroniques** (4 sous-catégories)
4. **Troubles Nutritionnels** (4 sous-catégories)
5. **Santé Maternelle** (4 sous-catégories)
6. **Maladies Pédiatriques** (3 sous-catégories)
7. **IST et VIH/SIDA** (4 sous-catégories)
8. **Traumatismes et Blessures** (4 sous-catégories)
9. **Maladies Dermatologiques** (4 sous-catégories)
10. **Autres Pathologies** (4 sous-catégories)

---

## Accessibilité

Les deux composants sont conçus avec l'accessibilité en tête :

- ✅ **Labels clairs** : Chaque élément a un label descriptif
- ✅ **Touch targets** : Zones tactiles de minimum 44x44 points
- ✅ **AccessibilityRole** : Tous les boutons ont le rôle approprié
- ✅ **AccessibilityLabel** : Labels descriptifs pour les lecteurs d'écran
- ✅ **Navigation clavier** : Support complet de la navigation au clavier (iOS/Android)
- ✅ **Messages d'erreur** : Affichés clairement sous le champ

## Validation

Les deux composants sont compatibles avec le schéma de validation Yup existant dans `src/utils/consultationValidation.ts` :

```typescript
typeConsultation: yup
  .string()
  .required('Le type de consultation est requis'),
  
categoriesMaladie: yup
  .string()
  .required('La catégorie de maladie est requise'),
```

## Tests

Des tests unitaires sont fournis pour les deux composants :

- `__tests__/ConsultationPicker.test.tsx` : 7 tests
- `__tests__/CategoriePicker.test.tsx` : 7 tests

Exécuter les tests :
```bash
npm test ConsultationPicker.test.tsx CategoriePicker.test.tsx
```

## Personnalisation

### Ajouter un nouveau type de consultation

Modifier le fichier `src/constants/consultationTypes.ts` :

```typescript
export const TYPES_CONSULTATION: ConsultationType[] = [
  // ... types existants
  {
    code: 'NOUVEAU_TYPE',
    libelle: 'Nouveau Type',
    description: 'Description du nouveau type',
    isActive: true,
  },
];
```

### Ajouter une nouvelle catégorie de maladie

Modifier le fichier `src/constants/categoriesMaladies.ts` :

```typescript
export const CATEGORIES_MALADIES: CategorieMaladie[] = [
  // ... catégories existantes
  {
    code: 'NOUVELLE_CATEGORIE',
    nom: 'Nouvelle Catégorie',
    description: 'Description de la catégorie',
    sousCategories: [
      {
        code: 'SOUS_CAT_1',
        nom: 'Sous-catégorie 1',
        description: 'Description',
      },
      // ... autres sous-catégories
    ],
  },
];
```

## Intégration avec le backend

Actuellement, les données sont embarquées côté front (constantes). Pour une intégration future avec le backend :

1. **ConsultationPicker** : Remplacer `TYPES_CONSULTATION` par un appel à l'API GraphQL
2. **CategoriePicker** : Utiliser les queries GraphQL existantes :
   - `categoriesPrincipales` : Récupère les catégories principales avec leurs sous-catégories
   - `arbreCategories` : Récupère l'arbre hiérarchique complet

Exemple d'intégration backend pour CategoriePicker :

```typescript
import { useCategoriesMaladies } from '../hooks/useCategoriesMaladies';

// Dans le composant parent
const { categories, loading } = useCategoriesMaladies();

<CategoriePicker
  value={value}
  onChange={onChange}
  categories={categories} // Passer les données du backend
  loading={loading}
/>
```

## Support et maintenance

Pour toute question ou problème :
1. Consulter les tests unitaires pour des exemples d'utilisation
2. Vérifier la console pour les erreurs ou warnings
3. S'assurer que les constantes sont à jour
4. Valider que les props sont correctement passées

## Changelog

### v1.0.0 (2025-11-20)
- Création initiale des composants ConsultationPicker et CategoriePicker
- Ajout des constantes avec données embarquées
- Intégration dans NewConsultationScreen
- Tests unitaires complets
- Documentation complète
