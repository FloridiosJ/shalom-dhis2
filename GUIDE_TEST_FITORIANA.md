# Guide d'utilisation - Test Fitoriana Stats

## Accès à la page de test

### Depuis la page Reports
1. Naviguez vers **Reports & Analytics**
2. Cliquez sur le bouton vert **"🧪 Test Fitoriana Stats"**

### Accès direct
Allez directement à l'URL: `/fitoriana-stats-test`

## Interface de test

La page de test comprend plusieurs sections:

### 1. Filtres
- **Date début / Date fin** (obligatoires): Sélectionnez la période à analyser
- **Dispensaires** (optionnel): Cochez les dispensaires à inclure (tous si aucun sélectionné)
- **Religions** (optionnel): Cochez Kristianina, Musulman, ou traditionnelle
- Bouton **"Actualiser"** pour relancer la requête

### 2. Informations
Affiche les métadonnées de la requête:
- Période sélectionnée
- Nombre total de consultations
- Nombre de tranches d'âge (3)
- Nombre de dispensaires

### 3. Tableau Fitoriana
Tableau structuré avec:
- **Lignes**: Tranches d'âge (Zaza, Tanora, Olon-dehibe)
- **Colonnes**: Chaque dispensaire avec Lahy/Vavy
- **Dernières colonnes**: Fitambarany (totaux) Lahy/Vavy

### 4. JSON Debug (repliable)
Section dépliable montrant la réponse JSON complète pour validation

## Exemples de tests

### Test 1: Toutes les consultations
- Dates: Dernier trimestre
- Dispensaires: Tous
- Religions: Toutes
- **Résultat**: Vue complète de toutes les statistiques

### Test 2: Statistiques Musulmans uniquement
- Dates: Dernier trimestre
- Dispensaires: Tous
- Religions: ✓ Musulman
- **Résultat**: Uniquement les consultations de patients Musulmans
- **Usage**: Section "Isan'ny Hasila nitady fitsaboana tao"

### Test 3: Non-chrétiens
- Dates: Dernier trimestre
- Dispensaires: Tous
- Religions: ✓ Musulman, ✓ traditionnelle
- **Résultat**: Consultations de patients non-chrétiens

### Test 4: Dispensaires spécifiques (Split 4/3)
**Tableau 1:**
- Dates: Dernier trimestre
- Dispensaires: ✓ (4 premiers dispensaires)
- Religions: Toutes

**Tableau 2:**
- Dates: Dernier trimestre
- Dispensaires: ✓ (3 derniers dispensaires)
- Religions: Toutes

## Structure du tableau

```
┌─────────────────────────────────┬──────────────────┬──────────────────┬──────────────────┐
│                                 │  Ampitsopitsoka  │  Boeny Aranta    │  Fitambarany     │
│  Tranche d'âge                  ├────────┬─────────┼────────┬─────────┼────────┬─────────┤
│                                 │  Lahy  │  Vavy   │  Lahy  │  Vavy   │  Lahy  │  Vavy   │
├─────────────────────────────────┼────────┼─────────┼────────┼─────────┼────────┼─────────┤
│ Zaza (12 taona noho midina)     │    8   │   10    │   87   │   124   │   95   │  134    │
├─────────────────────────────────┼────────┼─────────┼────────┼─────────┼────────┼─────────┤
│ Tanora (13 taona - 30 taona)    │   15   │   20    │   45   │   60    │   60   │   80    │
├─────────────────────────────────┼────────┼─────────┼────────┼─────────┼────────┼─────────┤
│ Olon-dehibe maherin'ny 30 taona │   25   │   30    │   55   │   70    │   80   │  100    │
└─────────────────────────────────┴────────┴─────────┴────────┴─────────┴────────┴─────────┘
```

## Validation

### Vérification des totaux
Les totaux Fitambarany doivent être égaux à la somme de tous les dispensaires:
- Fitambarany Lahy = Σ (Lahy de chaque dispensaire)
- Fitambarany Vavy = Σ (Vavy de chaque dispensaire)

### Vérification des tranches d'âge
- **Zaza**: Patients de 0 à 12 ans
- **Tanora**: Patients de 13 à 30 ans
- **Olon-dehibe**: Patients de plus de 30 ans

Aucun patient ne doit être compté deux fois.

### Vérification des filtres
- **Religion**: Si "Musulman" est sélectionné, seuls les patients musulmans apparaissent
- **Dispensaires**: Si certains sont cochés, seuls ceux-là apparaissent dans le tableau
- **Dates**: Seules les consultations dans la période sont comptées

## États de chargement

### Chargement initial
Un spinner et un message "Chargement des statistiques..." s'affichent.

### Erreur
Si une erreur survient, un message d'erreur rouge s'affiche avec les détails.

### Données vides
Si aucune consultation ne correspond aux critères, tous les compteurs affichent 0.

## Notes techniques

### Performance
- Les requêtes utilisent des index sur les colonnes dateConsultation, dispensaireId, religion
- Le cache React Query conserve les résultats pendant 1 minute
- Les filtres côté client évitent les requêtes inutiles

### Format de réponse
```json
{
  "dateFrom": "2025-01-01",
  "dateTo": "2025-03-31",
  "totalConsultations": 500,
  "rows": [
    {
      "label": "Zaza (12 taona noho midina)",
      "ageGroup": "ZAZA",
      "valuesByDispensaire": [
        {
          "dispensaireName": "Ampitsopitsoka",
          "values": { "lahy": 8, "vavy": 10 }
        }
      ],
      "fitambarany": { "lahy": 95, "vavy": 134 }
    }
  ]
}
```

## Compatibilité

- **Navigateurs**: Chrome, Firefox, Safari, Edge (versions récentes)
- **Appareils**: Desktop, tablette, mobile (responsive)
- **Authentification**: Nécessite d'être connecté

## Support

En cas de problème:
1. Vérifier la connexion au backend GraphQL
2. Vérifier les logs de la console navigateur (F12)
3. Vérifier que les dates sont valides
4. Essayer avec "Tous les dispensaires" et "Toutes les religions"
5. Consulter la section JSON debug pour voir la réponse brute

## Prochaines étapes

Cette page de test permet de valider le resolver backend. Une fois validé:
1. Intégrer dans la page TatitraPreview pour l'affichage final
2. Utiliser dans la génération PDF du rapport Tatitra
3. Ajouter des graphiques basés sur ces données (optionnel)
