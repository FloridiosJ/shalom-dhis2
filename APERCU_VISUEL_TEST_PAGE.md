# Aperçu Visuel - Page Test Fitoriana Stats

## Vue d'ensemble de la page

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    Statistiques Fitoriana - Test                           ║
║          Section "MAHAKASIKA NY ASA FITORIANA" du rapport Tatitra          ║
╚════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────┐
│ Filtres                                                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Date début: [2024-10-01]        Date fin: [2025-01-11]                 │
│                                                                           │
│  Dispensaires (optionnel):                                               │
│  ☐ Ampitsopitsoka    ☐ Boeny Aranta    ☐ Mahatsinjo    ☐ Antsahalava   │
│  Tous les dispensaires si aucun sélectionné                              │
│                                                                           │
│  Religions (optionnel):                                                   │
│  ☐ Kristianina    ☐ Musulman    ☐ traditionnelle                        │
│  Toutes les religions si aucune sélectionnée                             │
│                                                                           │
│  [ Actualiser ]                                                           │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ Informations                                                              │
├──────────────────────────────────────────────────────────────────────────┤
│  Période:                    2024-10-01 → 2025-01-11                     │
│  Total consultations:        1,247                                        │
│  Tranches d'âge:            3                                             │
│  Dispensaires:              7                                             │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ Tableau Fitoriana                                                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────┬──────────────┬──────────────┬──────────────┐│
│  │                        │ Ampitsopitsoka│ Boeny Aranta │ Mahatsinjo  ││
│  │  Tranche d'âge         ├──────┬───────┼──────┬───────┼──────┬──────┤│
│  │                        │ Lahy │ Vavy  │ Lahy │ Vavy  │ Lahy │ Vavy ││
│  ├────────────────────────┼──────┼───────┼──────┼───────┼──────┼──────┤│
│  │ Zaza (12 taona noho    │  8   │  10   │  87  │  124  │  45  │  52  ││
│  │ midina)                │      │       │      │       │      │      ││
│  ├────────────────────────┼──────┼───────┼──────┼───────┼──────┼──────┤│
│  │ Tanora (13 taona -     │  15  │  20   │  45  │  60   │  30  │  38  ││
│  │ 30 taona)              │      │       │      │       │      │      ││
│  ├────────────────────────┼──────┼───────┼──────┼───────┼──────┼──────┤│
│  │ Olon-dehibe            │  25  │  30   │  55  │  70   │  40  │  48  ││
│  │ maherin'ny 30 taona    │      │       │      │       │      │      ││
│  └────────────────────────┴──────┴───────┴──────┴───────┴──────┴──────┘│
│                                                                           │
│  (Tableau continue avec les autres dispensaires + Fitambarany)           │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ ▼ Voir la réponse JSON complète (debug)                                  │
├──────────────────────────────────────────────────────────────────────────┤
│ {                                                                         │
│   "dateFrom": "2024-10-01",                                              │
│   "dateTo": "2025-01-11",                                                │
│   "totalConsultations": 1247,                                            │
│   "rows": [ ... ]                                                         │
│ }                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

## Accès depuis la page Reports

```
╔════════════════════════════════════════════════════════════════════════════╗
║                         Rapports & Analytics                               ║
╚════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────┐
│ [Dispensaire: Tous ▼]  [Période: Mois ▼]  [📅 2024-10-01]  [📅 2025-01-11]│
└──────────────────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────┐
                    │ 📄 Rapport Tatitra         │ ← Export PDF
                    └────────────────────────────┘
                    
                    ┌────────────────────────────┐
                    │ 👁️ Preview Tatitra         │ ← Aperçu HTML
                    └────────────────────────────┘
                    
                    ┌────────────────────────────┐
                    │ 🧪 Test Fitoriana Stats    │ ← NOUVELLE PAGE DE TEST
                    └────────────────────────────┘

[Stats KPI cards...]
```

## Couleurs et styles

### Boutons
- **Rapport Tatitra**: Violet (gradient 135deg, #8b5cf6 → #7c3aed)
- **Preview Tatitra**: Violet-bleu (gradient 135deg, #667eea → #764ba2)
- **Test Fitoriana Stats**: Vert (gradient 135deg, #10b981 → #059669) ← NOUVEAU

### Tableau
- **En-têtes dispensaires**: Bleu clair (#bee3f8)
- **En-têtes Fitambarany**: Vert clair (#9ae6b4)
- **Cellules totaux**: Fond vert très clair (#f0fff4), texte vert foncé (#22543d)
- **Lignes alternées**: Fond gris très clair (#f7fafc)

### États
- **Chargement**: Spinner bleu (#4299e1) avec animation rotation
- **Erreur**: Fond rouge clair (#fed7d7), bordure rouge (#fc8181)
- **Succès**: Fond blanc avec ombre douce

## Interactions

### Filtres interactifs
1. Sélection de dates via date picker
2. Cases à cocher pour dispensaires (multi-sélection)
3. Cases à cocher pour religions (multi-sélection)
4. Bouton "Actualiser" pour relancer la requête

### Responsive
- Desktop: Tableau complet avec tous les dispensaires visibles
- Tablette: Scroll horizontal si nécessaire
- Mobile: Tableau compact avec scroll, boutons empilés verticalement

### Validation temps réel
- Dates invalides: Bordure rouge
- Champs requis: Indication visuelle
- État de chargement: Désactivation des contrôles

## Exemples d'utilisation

### Cas 1: Vue complète
```
Filtres:
  Date début: 2024-10-01
  Date fin: 2025-01-11
  Dispensaires: (tous)
  Religions: (toutes)

Résultat: 1,247 consultations sur 7 dispensaires
```

### Cas 2: Musulmans uniquement
```
Filtres:
  Date début: 2024-10-01
  Date fin: 2025-01-11
  Dispensaires: (tous)
  Religions: ✓ Musulman

Résultat: 156 consultations de patients Musulmans
```

### Cas 3: 4 premiers dispensaires
```
Filtres:
  Date début: 2024-10-01
  Date fin: 2025-01-11
  Dispensaires: ✓ Ampitsopitsoka, ✓ Boeny Aranta, 
                ✓ Mahatsinjo, ✓ Antsahalava
  Religions: (toutes)

Résultat: Tableau avec 4 dispensaires + Fitambarany
```

## Notes d'implémentation

### Technologies utilisées
- **React** avec hooks (useState, useQuery)
- **React Query** pour le fetching de données
- **CSS Modules** pour le styling scopé
- **GraphQL** pour les requêtes API

### Performance
- Cache des résultats pendant 1 minute
- Chargement différé des données
- Skeleton screens pendant le chargement
- Optimisation des re-renders

### Accessibilité
- Labels ARIA sur tous les contrôles
- Navigation au clavier
- Contraste de couleurs suffisant
- Messages d'état annoncés
