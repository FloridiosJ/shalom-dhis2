# Prescription Structurée - Guide d'implémentation

## Vue d'ensemble

Cette fonctionnalité permet la saisie structurée des prescriptions médicamenteuses dans le système DHIS2-Shalom. Au lieu d'un simple champ texte libre, les utilisateurs peuvent maintenant enregistrer chaque médicament prescrit avec ses détails (dose, fréquence, durée, notes).

## Objectifs

- **Analyse des données** : Permettre une analyse fiable de la consommation médicamenteuse et de l'adhérence aux protocoles
- **Génération de statistiques** : Top médicaments prescrits, durée moyenne de traitement, etc.
- **Qualité des données** : Améliorer la qualité des données pour l'analytics et le reporting
- **Standardisation** : Utilisation d'une liste normalisée de médicaments via autocomplete

## Architecture Technique

### Backend

#### Nouveau Modèle : `PrescriptionItem`

**Fichier** : `backend/src/models/prescriptionItem.js`

**Champs** :
- `id` (UUID) : Identifiant unique
- `dataEntryId` (UUID) : Référence vers la consultation (DataEntry)
- `medicament` (STRING) : Nom du médicament (obligatoire)
- `dose` (STRING) : Dosage (ex: 500mg, 2 comprimés)
- `frequence` (STRING) : Fréquence d'administration (ex: 3x/jour)
- `duree` (STRING) : Durée du traitement (ex: 7 jours)
- `notes` (TEXT) : Notes complémentaires
- `ordre` (INTEGER) : Ordre d'affichage
- `isActive` (BOOLEAN) : Statut actif/inactif

**Relations** :
- `belongsTo` DataEntry : Chaque item de prescription appartient à une consultation
- `hasMany` dans DataEntry : Une consultation peut avoir plusieurs items de prescription

#### GraphQL Schema

**Types ajoutés** :

```graphql
type PrescriptionItem {
  id: ID!
  dataEntryId: ID!
  dataEntry: DataEntry
  medicament: String!
  dose: String
  frequence: String
  duree: String
  notes: String
  ordre: Int!
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  formattedPrescription: String!
}

input PrescriptionItemInput {
  medicament: String!
  dose: String
  frequence: String
  duree: String
  notes: String
  ordre: Int
}
```

**Modifications dans DataEntry** :
- Ajout du champ `prescriptionItems: [PrescriptionItem!]!`
- Le champ `prescription` (texte libre) est maintenu pour rétrocompatibilité

#### Resolvers

**Fichier** : `backend/src/graphql/resolvers/prescriptionItem.js`

**Query** :
- `prescriptionItems(dataEntryId: ID!)` : Récupère tous les items de prescription d'une consultation

**Mutations dans dataEntry** :
- `createDataEntry` et `updateDataEntry` gèrent maintenant `prescriptionItems: [PrescriptionItemInput!]`

### Frontend

#### Composant : `CreateDataEntryModal`

**Fichier** : `web/src/components/CreateDataEntryModal.jsx`

**Nouveaux États** :
```javascript
const [prescriptionItems, setPrescriptionItems] = useState([]);
```

**Nouveaux Handlers** :
- `handleAddPrescriptionItem()` : Ajoute un nouveau médicament
- `handleRemovePrescriptionItem(itemId)` : Retire un médicament
- `handlePrescriptionItemChange(itemId, field, value)` : Modifie un champ

#### UI/UX

**Saisie structurée** :
- Champs pour : Médicament, Dose, Fréquence, Durée, Notes
- Autocomplete via `datalist` HTML5 pour les médicaments, fréquences et durées
- Bouton "+ Ajouter un médicament" pour ajouter plusieurs prescriptions
- Bouton "✕" pour retirer un médicament

**Champ texte libre** :
- Maintenu pour cas exceptionnels
- Message informatif encourageant l'utilisation de la structure

#### Listes Standardisées

**Fichier** : `web/src/constants/medications.js`

**Exports** :
- `COMMON_MEDICATIONS` : ~80 médicaments courants (antibiotiques, antipaludéens, analgésiques, etc.)
- `COMMON_FREQUENCIES` : Fréquences d'administration (1x/jour, 2x/jour, etc.)
- `COMMON_DURATIONS` : Durées de traitement (3 jours, 7 jours, etc.)

#### Affichage dans le tableau

**Fichier** : `web/src/pages/DataEntries.jsx`

Les prescriptions structurées sont affichées dans la colonne "Prescription" :
- Chaque médicament sur une ligne avec dose, fréquence, durée
- Le champ prescription libre s'affiche en note italique si présent
- Affichage lisible et compact

### Migration Base de Données

**Fichier** : `backend/src/database/migrations/002-add-prescription-items-table.js`

- Crée la table `prescription_items`
- Ajoute les index pour performance (dataEntryId, medicament, ordre)
- Support du `CASCADE` sur suppression de consultation

## Utilisation

### Créer une prescription structurée

1. Dans le modal de consultation, après avoir sélectionné patient et diagnostic
2. Cliquer sur "+ Ajouter un médicament"
3. Remplir les champs :
   - **Médicament** (obligatoire) : Commencer à taper, l'autocomplete propose des médicaments
   - **Dose** (optionnel) : Ex: "500mg", "2 comprimés"
   - **Fréquence** (optionnel) : Ex: "3x/jour", "Matin et soir"
   - **Durée** (optionnel) : Ex: "7 jours", "2 semaines"
   - **Notes** (optionnel) : Précisions pour ce médicament
4. Ajouter d'autres médicaments si nécessaire
5. Le champ "Prescription libre" est disponible pour cas exceptionnels

### Modifier une prescription

1. Éditer la consultation
2. Les prescriptions existantes sont chargées automatiquement
3. Modifier, ajouter ou supprimer des médicaments
4. Sauvegarder

### Visualiser les prescriptions

- Dans le tableau des consultations, colonne "Prescription"
- Chaque médicament est listé avec ses détails
- Format compact et lisible

## Analytics et Rapports

Les données structurées permettent maintenant :

### Analyses possibles
1. **Top médicaments prescrits** : Compter par `medicament`
2. **Durée moyenne de traitement** : Analyser le champ `duree`
3. **Fréquence d'administration** : Analyser le champ `frequence`
4. **Prescriptions par type de consultation** : Croiser avec `DataEntry.typeConsultation`
5. **Adhérence aux protocoles** : Vérifier la cohérence des prescriptions

### Exemples de requêtes GraphQL

**Récupérer toutes les prescriptions d'une consultation** :
```graphql
query GetConsultationWithPrescriptions($id: ID!) {
  dataEntry(id: $id) {
    id
    diagnostic
    prescriptionItems {
      medicament
      dose
      frequence
      duree
      notes
      formattedPrescription
    }
  }
}
```

**Statistiques des médicaments** :
```javascript
// Dans le backend, créer une query pour compter les médicaments
const medicationStats = await PrescriptionItem.findAll({
  attributes: [
    'medicament',
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  group: ['medicament'],
  order: [[sequelize.literal('count'), 'DESC']],
  limit: 10
});
```

## Rétrocompatibilité

- Le champ `prescription` (texte libre) dans `DataEntry` est maintenu
- Les anciennes consultations avec prescriptions textuelles continuent de fonctionner
- Les nouvelles consultations peuvent utiliser :
  - Uniquement les prescriptions structurées
  - Uniquement le champ texte libre (déconseillé)
  - Les deux (la structure prévaut, le texte libre sert de note)

## Extensibilité

### Ajouter des médicaments à la liste

Éditer `web/src/constants/medications.js` et ajouter dans `COMMON_MEDICATIONS`.

### Personnaliser les fréquences/durées

Éditer les constantes `COMMON_FREQUENCIES` et `COMMON_DURATIONS` dans le même fichier.

### Ajouter des validations

Dans `CreateDataEntryModal.jsx`, fonction `validate()`, ajouter des règles de validation.

### Créer des rapports

Dans `backend/src/graphql/resolvers/reports.js`, créer des queries pour analyser les `PrescriptionItem`.

## Tests

### Tests unitaires suggérés
1. Création d'une prescription avec items
2. Modification d'items existants
3. Suppression d'items
4. Validation des champs obligatoires
5. Autocomplete des médicaments

### Tests d'intégration
1. Créer une consultation avec prescriptions structurées
2. Éditer et modifier les prescriptions
3. Supprimer une consultation (vérifier le CASCADE)
4. Récupérer les prescriptions via GraphQL

## Sécurité

- Les mutations de prescription sont protégées par authentification
- Un utilisateur ne peut modifier que ses propres consultations (sauf admin)
- Le champ `medicament` a une validation de longueur (max 500 caractères)
- Tous les champs sont nettoyés (trim) avant enregistrement

## Performance

- Index sur `dataEntryId` pour requêtes rapides
- Index sur `medicament` pour statistiques
- Index composite sur `(dataEntryId, ordre)` pour tri
- Chargement lazy des `prescriptionItems` via GraphQL

## Améliorations Futures

1. **Base de données de médicaments** : Créer un modèle `Medication` avec référence ID au lieu de texte libre
2. **Interactions médicamenteuses** : Alertes pour combinaisons dangereuses
3. **Dosages standards** : Suggérer des dosages selon le médicament
4. **Calculateur de dose** : Selon poids/âge du patient
5. **Historique de prescription** : Voir les prescriptions précédentes du patient
6. **Impression ordonnance** : Générer PDF formaté
7. **Statistiques avancées** : Dashboard avec graphiques
8. **Export données** : Pour analyses externes (Excel, CSV)

## Support et Maintenance

Pour toute question ou problème :
1. Consulter les logs du serveur backend
2. Vérifier que la table `prescription_items` existe
3. Vérifier que les relations Sequelize sont bien chargées
4. Tester les requêtes GraphQL dans le playground

---

**Date de création** : 28 Octobre 2025  
**Version** : 1.0.0  
**Auteur** : GitHub Copilot pour FloridiosJ/shalom-dhis2
