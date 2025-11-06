# Refonte de l'écran d'accueil mobile - Documentation

## Objectif
Refondre la page d'accueil mobile en supprimant les filtres, en intégrant des données dynamiques réelles, et en garantissant que le bouton de déconnexion n'apparaît que dans les paramètres.

## Changements Implémentés

### 1. ✅ Suppression des Dropdowns "Dispensaire" et "Période"

**Avant:**
- Deux menus déroulants en haut de la page
- État local pour gérer la visibilité et la sélection
- Styles pour les boutons de filtre

**Après:**
- Tous les menus déroulants ont été supprimés
- État local nettoyé (dispensaireVisible, periodeVisible, selectedDispensaire, selectedPeriode)
- Styles inutilisés supprimés (filtersContainer, filterButton, filterButtonContent)
- L'espace est maintenant occupé par les cartes de statistiques

### 2. ✅ Données Dynamiques (Réelles)

#### Hook Personnalisé: `useDashboardStats`

Créé un nouveau hook dans `/mobile/src/hooks/useDashboardStats.ts` qui:

```typescript
export interface DashboardStats {
  consultationsCount: number;      // Consultations en attente
  patientsRecentsCount: number;    // Patients récents (7 derniers jours)
  syncRequiredCount: number;       // Éléments en attente de synchronisation
}
```

**Fonctionnalités:**
- Fetch des données via GraphQL Apollo Client
- Requête `GET_PENDING_CONSULTATIONS` pour les consultations en attente (status: en_cours)
- Requête `GET_RECENT_PATIENTS` pour les patients récents (créés dans les 7 derniers jours)
- Intégration avec `useSyncQueue` pour le comptage des éléments en attente de sync
- Gestion des états de chargement et d'erreur
- Valeurs de repli (fallback) à 0 en cas d'erreur
- TypeScript type-safe avec typage explicite des réponses GraphQL

#### Intégration dans HomeScreen

**Avant:**
```typescript
const dashboardData = {
  consultationsCount: 12,  // Données mockées
  patientsRecentsCount: 5,
  syncRequiredCount: 8,
};
```

**Après:**
```typescript
const {stats, loading, error} = useDashboardStats();

const dashboardData = stats || {
  consultationsCount: 0,
  patientsRecentsCount: 0,
  syncRequiredCount: 0,
};
```

### 3. ✅ Gestion des États de Chargement et d'Erreur

#### Indicateurs de Chargement
- Ajout d'un props `isLoading` aux `DashboardCard`
- Affichage d'un `ActivityIndicator` pendant le chargement
- Spinner bleu correspondant à la couleur de l'icône

#### Message d'Erreur
- Bannière d'erreur rouge en haut si le fetch échoue
- Message: "Erreur lors du chargement des données. Affichage des dernières données disponibles."
- Design cohérent avec bordure gauche rouge et fond rosé
- Disparaît automatiquement si les données se chargent correctement

### 4. ✅ Accessibilité

**Améliorations apportées:**
- `accessible={true}` sur les cartes
- `accessibilityLabel` dynamique: "{label}: {chargement|count}"
- `accessibilityRole="text"` pour indiquer le type de contenu
- `accessibilityLiveRegion="polite"` pour annoncer les changements de données
- Contraste suffisant maintenu (texte gris #757575 sur blanc, chiffres noirs #212121)

### 5. ✅ Bouton Déconnexion

**Vérification effectuée:**
- HomeScreen a `headerShown: false` dans la navigation
- Aucun bouton de déconnexion n'apparaît sur la page d'accueil
- Le bouton de déconnexion reste uniquement dans:
  - SettingsScreen (dans le corps de la page avec composant `LogoutButton`)
  - Headers des autres écrans (Consultation, Patient, Sync, Settings)

### 6. ✅ Code Propre et TypeScript

**Qualité du code:**
- Séparation propre entre logique (hook) et UI (composant)
- TypeScript strict avec typage explicite
- Pas d'erreurs de lint
- Pas d'erreurs de type TypeScript
- Composants fonctionnels avec hooks React
- Styles cohérents et bien organisés
- Nettoyage des imports inutilisés (Menu, Button de react-native-paper)

## Fichiers Modifiés

### Créés
- `/mobile/src/hooks/useDashboardStats.ts` - Hook pour fetch des statistiques

### Modifiés
- `/mobile/src/screens/HomeScreen.tsx` - Suppression des filtres et intégration des données réelles

## Tests et Validation

### Linting
```bash
npm run lint
```
✅ Aucune erreur de lint

### TypeScript
```bash
npx tsc --noEmit
```
✅ Aucune erreur TypeScript dans nos fichiers

### Accessibilité
- Contraste de couleur vérifié (WCAG AA+)
- Labels descriptifs et dynamiques
- Régions live pour les mises à jour

## Structure Visuelle

```
┌─────────────────────────────────────────┐
│  Shalom Mobile               [Share]    │
├─────────────────────────────────────────┤
│                                         │
│  [Error Banner - si erreur]             │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────┐  ┌───────────────┐  │
│  │   📋          │  │   👥          │  │
│  │ Consultations│  │   Patients     │  │
│  │  en attente  │  │   Récents      │  │
│  │              │  │                │  │
│  │     12       │  │      5         │  │
│  └───────────────┘  └───────────────┘  │
│                                         │
│  ┌───────────────┐  ┌───────────────┐  │
│  │   🔄          │  │   👤+         │  │
│  │Synchronisation│  │   Nouveau     │  │
│  │   requise    │  │   Patient      │  │
│  │              │  │                │  │
│  │      8       │  │   (Action)     │  │
│  └───────────────┘  └───────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## Critères d'Acceptation

✅ Plus de filtres dropdown sur l'accueil
✅ Les chiffres sont mis à jour en temps réel selon l'API/backend
✅ Le bouton Déconnexion n'apparaît que sur Settings/profil, jamais page accueil
✅ Code propre et documenté
✅ TypeScript type-safe
✅ Gestion des états loading/erreur
✅ Accessibilité implémentée
✅ UI responsive

## Notes Techniques

### GraphQL Queries Utilisées

1. **GET_PENDING_CONSULTATIONS**
   - Filtre: `status: en_cours`
   - Retourne: `totalCount` des consultations en attente

2. **GET_RECENT_PATIENTS**
   - Variable: `dateFrom` (7 jours en arrière)
   - Retourne: `totalCount` des patients récents

3. **SyncQueue** (via useSyncQueue hook)
   - Retourne: `queueStats.pendingCount` pour les éléments à synchroniser

### Performance

- Requêtes parallèles avec `Promise.all()`
- `fetchPolicy: 'network-only'` pour données fraîches
- Fallback rapide en cas d'erreur
- Pas de re-renders inutiles

### Bonnes Pratiques Appliquées

- Composants fonctionnels purs
- Hooks personnalisés pour la logique
- Séparation des préoccupations
- Typage TypeScript strict
- Gestion d'erreurs robuste
- Accessibilité intégrée dès le départ
