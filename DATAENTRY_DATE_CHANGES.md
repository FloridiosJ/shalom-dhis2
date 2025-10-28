# DataEntry Date/Time Separation

## Changements effectués

### Problème résolu
L'ancien système mélangeait date et heure dans un seul champ `dateConsultation`, rendant les agrégations analytiques difficiles (par jour, semaine, mois). L'affichage dans la table était également surchargé.

### Solution implémentée

#### Backend
1. **Modèle DataEntry** (`backend/src/models/dataEntry.js`)
   - Ajout du champ `dateOnly` (DATEONLY) pour stocker la date au format YYYY-MM-DD
   - Ajout du champ `timeConsultation` (TIME) pour stocker l'heure au format HH:MM:SS (optionnel)
   - Ces champs sont automatiquement calculés depuis `dateConsultation`
   - Ajout d'indexes pour optimiser les requêtes analytics:
     - Index simple sur `dateOnly`
     - Index composite sur `(dateOnly, dispensaireId)`

2. **Resolvers GraphQL** (`backend/src/graphql/resolvers/dataEntry.js`)
   - `createDataEntry`: Calcule automatiquement `dateOnly` et `timeConsultation` depuis `dateConsultation`
   - `updateDataEntry`: Recalcule les champs si `dateConsultation` est modifié
   - Toutes les dates sont stockées en UTC (ISO 8601)

3. **Schema GraphQL** (`backend/src/graphql/schema.graphql`)
   - Ajout de `dateOnly: String` au type `DataEntry`
   - Ajout de `timeConsultation: String` au type `DataEntry`

4. **Migration** (`backend/src/database/migrations/001-add-dateonly-timeconsultation.js`)
   - Script de migration pour ajouter les nouveaux champs
   - Backfill automatique des données existantes
   - Possibilité de rollback

#### Frontend
1. **Formulaire de création/modification** (`web/src/components/CreateDataEntryModal.jsx`)
   - Séparation de l'input `datetime-local` en deux champs:
     - Input `date` pour la date (obligatoire)
     - Input `time` pour l'heure (optionnel)
   - Combinaison automatique en ISO UTC lors de la soumission
   - Si l'heure n'est pas fournie, utilise minuit (00:00:00)

2. **Table des consultations** (`web/src/pages/DataEntries.jsx`)
   - Affichage uniquement de la date (JJ/MM/YYYY) dans la colonne
   - Heure complète affichée dans un tooltip au survol
   - Améliore la lisibilité de la table

## Utilisation

### Créer une consultation
```javascript
// Avec date et heure
{
  dateConsultation: "2024-01-15T14:30:00Z",
  // dateOnly et timeConsultation sont calculés automatiquement
}

// Avec date seule
{
  dateConsultation: "2024-01-15T00:00:00Z",
  // dateOnly: "2024-01-15", timeConsultation: null
}
```

### Queries analytics
```graphql
# Agrégation par jour
query {
  dataEntries(filter: { dateOnly: "2024-01-15" }) {
    dataEntries {
      id
      dateOnly
      timeConsultation
    }
  }
}
```

## Compatibilité
- ✅ Les anciennes données sont automatiquement converties lors de la migration
- ✅ Le champ `dateConsultation` reste présent et fonctionnel
- ✅ Les nouveaux champs sont optionnels (nullable)
- ✅ Pas de breaking changes pour les API existantes

## Bénéfices
1. **Analytics**: Agrégations fiables par jour/semaine/mois grâce à `dateOnly`
2. **Performance**: Indexes optimisés pour les requêtes analytics
3. **UX**: Interface plus claire avec séparation date/heure
4. **Lisibilité**: Table allégée avec date seule (heure en tooltip)
5. **Flexibilité**: Heure optionnelle pour les cas où seule la date importe
