# ConsultationPicker et CategoriePicker - Guide Visuel

## Vue d'ensemble

Ce document présente visuellement les deux nouveaux composants de sélection pour l'écran de nouvelle consultation mobile.

---

## 1. ConsultationPicker

### Écran principal (champ fermé)

```
┌─────────────────────────────────────────────┐
│ Type de consultation *                      │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Sélectionner un type de consultation│ ▼ │
│ └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Écran principal (avec sélection)

```
┌─────────────────────────────────────────────┐
│ Type de consultation *                      │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Consultation Curative               │ ⓧ ▼│
│ │ Consultation pour traitement...     │   │
│ └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Modal de sélection

```
╔═════════════════════════════════════════════╗
║ Type de consultation              [✕]       ║
╠═════════════════════════════════════════════╣
║ ┌─────────────────────────────────────────┐║
║ │ 🔍 Rechercher un type...               │║
║ └─────────────────────────────────────────┘║
╠═════════════════════════════════════════════╣
║ Consultation Curative                    ›  ║
║ Consultation pour traitement de maladies    ║
║─────────────────────────────────────────────║
║ Consultation Préventive                  ›  ║
║ Consultation de prévention et dépistage     ║
║─────────────────────────────────────────────║
║ Consultation Prénatale                   ›  ║
║ Suivi de grossesse et consultation...       ║
║─────────────────────────────────────────────║
║ Consultation Post-Natale                 ›  ║
║ Suivi après accouchement                    ║
║─────────────────────────────────────────────║
║ Accouchement                             ›  ║
║ Accompagnement et suivi d'accouchement      ║
║─────────────────────────────────────────────║
║ Vaccination                              ›  ║
║ Administration de vaccins                   ║
║─────────────────────────────────────────────║
║ ... (6 autres types)                        ║
╚═════════════════════════════════════════════╝
```

### Avec recherche

```
╔═════════════════════════════════════════════╗
║ Type de consultation              [✕]       ║
╠═════════════════════════════════════════════╣
║ ┌─────────────────────────────────────────┐║
║ │ 🔍 natal                               │║
║ └─────────────────────────────────────────┘║
╠═════════════════════════════════════════════╣
║ Consultation Prénatale                   ›  ║
║ Suivi de grossesse et consultation...       ║
║─────────────────────────────────────────────║
║ Consultation Post-Natale                 ›  ║
║ Suivi après accouchement                    ║
╚═════════════════════════════════════════════╝
```

---

## 2. CategoriePicker

### Écran principal (champ fermé)

```
┌─────────────────────────────────────────────┐
│ Catégorie de maladie *                      │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Sélectionner une catégorie...       │ ▼ │
│ └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Écran principal (avec sélection complète)

```
┌─────────────────────────────────────────────┐
│ Catégorie de maladie *                      │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Maladies Infectieuses →             │ ⓧ ▼│
│ │ Infections Respiratoires            │   │
│ │ Pneumonie, bronchite, grippe        │   │
│ └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Modal - Étape 1: Catégories principales

```
╔═════════════════════════════════════════════╗
║ Catégorie de maladie              [✕]       ║
╠═════════════════════════════════════════════╣
║ ┌─────────────────────────────────────────┐║
║ │ 🔍 Rechercher une catégorie...         │║
║ └─────────────────────────────────────────┘║
╠═════════════════════════════════════════════╣
║ Maladies Infectieuses                    ›  ║
║ Infections bactériennes, virales...         ║
║ 4 sous-catégories                           ║
║─────────────────────────────────────────────║
║ Maladies Parasitaires                    ›  ║
║ Infections parasitaires diverses            ║
║ 3 sous-catégories                           ║
║─────────────────────────────────────────────║
║ Maladies Chroniques                      ›  ║
║ Pathologies de longue durée                 ║
║ 4 sous-catégories                           ║
║─────────────────────────────────────────────║
║ Troubles Nutritionnels                   ›  ║
║ Malnutrition et carences                    ║
║ 4 sous-catégories                           ║
║─────────────────────────────────────────────║
║ Santé Maternelle                         ›  ║
║ Pathologies liées à la grossesse...         ║
║ 4 sous-catégories                           ║
║─────────────────────────────────────────────║
║ ... (5 autres catégories)                   ║
╚═════════════════════════════════════════════╝
```

### Modal - Étape 2: Sous-catégories

```
╔═════════════════════════════════════════════╗
║ ‹ Maladies Infectieuses           [✕]       ║
╠═════════════════════════════════════════════╣
║ ┌─────────────────────────────────────────┐║
║ │ 🔍 Rechercher une sous-catégorie...    │║
║ └─────────────────────────────────────────┘║
╠═════════════════════════════════════════════╣
║ Infections Respiratoires              ✓     ║
║ Pneumonie, bronchite, grippe                ║
║─────────────────────────────────────────────║
║ Infections Digestives                 ✓     ║
║ Diarrhée, gastro-entérite, dysenterie       ║
║─────────────────────────────────────────────║
║ Infections Cutanées                   ✓     ║
║ Dermite, gale, mycoses                      ║
║─────────────────────────────────────────────║
║ Infections Urinaires                  ✓     ║
║ Cystite, pyélonéphrite                      ║
╚═════════════════════════════════════════════╝
```

---

## 3. Intégration dans l'écran de nouvelle consultation

### Écran complet

```
╔═════════════════════════════════════════════╗
║ ‹ Nouvelle Consultation                     ║
╠═════════════════════════════════════════════╣
║                                             ║
║ Patient *                                   ║
║ ┌─────────────────────────────────────┐   ║
║ │ RAKOTO Jean (P-001234)             │ ▼ │
║ └─────────────────────────────────────┘   ║
║                                             ║
║ Heure *                                     ║
║ ┌─────────────────────────────────────┐   ║
║ │ 14:30                              │ 🕐 │
║ └─────────────────────────────────────┘   ║
║                                             ║
║ Date de la consultation *                   ║
║ ┌─────────────────────────────────────┐   ║
║ │ 20/11/2025                         │ 📅 │
║ └─────────────────────────────────────┘   ║
║                                             ║
║ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║ Informations Cliniques                      ║
║ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                             ║
║ Type de consultation * 🆕                   ║
║ ┌─────────────────────────────────────┐   ║
║ │ Consultation Curative              │ ⓧ ▼│
║ │ Consultation pour traitement...     │   │
║ └─────────────────────────────────────┘   ║
║                                             ║
║ Catégorie de maladie * 🆕                   ║
║ ┌─────────────────────────────────────┐   ║
║ │ Maladies Infectieuses →            │ ⓧ ▼│
║ │ Infections Respiratoires            │   │
║ └─────────────────────────────────────┘   ║
║                                             ║
║ Prescriptions structurées                   ║
║ ┌─────────────────────────────────────┐   ║
║ │ Paracétamol 500mg, 3x/jour...      │   ║
║ │                                     │   ║
║ └─────────────────────────────────────┘   ║
║                                             ║
║ Notes                                       ║
║ ┌─────────────────────────────────────┐   ║
║ │ Ajouter des commentaires...         │   ║
║ │                                     │   ║
║ └─────────────────────────────────────┘   ║
║                                             ║
╠═════════════════════════════════════════════╣
║         ┌─────────────────────┐            ║
║         │   Enregistrer       │            ║
║         └─────────────────────┘            ║
╚═════════════════════════════════════════════╝
```

---

## Légende

- **›** : Chevron indiquant une navigation vers le détail
- **✓** : Icône de validation pour la sélection
- **▼** : Flèche indiquant un menu déroulant
- **ⓧ** : Bouton pour effacer la sélection
- **✕** : Bouton pour fermer le modal
- **‹** : Bouton retour
- **🔍** : Icône de recherche
- **🕐** : Sélecteur d'heure
- **📅** : Sélecteur de date
- **🆕** : Nouveaux composants ajoutés

---

## Flux d'utilisation

### ConsultationPicker

1. L'utilisateur clique sur le champ "Type de consultation"
2. Un modal s'ouvre avec la liste des types
3. L'utilisateur peut rechercher un type (optionnel)
4. L'utilisateur clique sur un type pour le sélectionner
5. Le modal se ferme et le champ affiche la sélection
6. L'utilisateur peut effacer la sélection avec le bouton ⓧ

### CategoriePicker

1. L'utilisateur clique sur le champ "Catégorie de maladie"
2. Un modal s'ouvre avec la liste des catégories principales
3. L'utilisateur peut rechercher une catégorie (optionnel)
4. L'utilisateur clique sur une catégorie principale
5. Le modal affiche les sous-catégories de cette catégorie
6. L'utilisateur peut utiliser le bouton retour (‹) pour revenir
7. L'utilisateur clique sur une sous-catégorie pour la sélectionner
8. Le modal se ferme et le champ affiche la sélection complète
9. L'utilisateur peut effacer la sélection avec le bouton ⓧ

---

## Accessibilité

### Touch Targets
- Tous les boutons ont une taille minimum de 44x44 points
- Zones tactiles suffisamment espacées pour éviter les erreurs

### Feedback Visuel
- Bordure bleue sur le champ sélectionné
- Bordure rouge en cas d'erreur de validation
- Icônes claires et descriptives

### Navigation Clavier
- Support complet du Tab pour naviguer entre les champs
- Touches fléchées pour naviguer dans les listes
- Enter pour sélectionner
- Escape pour fermer les modals

### Lecteurs d'écran
- Labels ARIA appropriés sur tous les éléments interactifs
- Descriptions accessibles pour chaque option
- Annonces de changement d'état

---

## Notes d'implémentation

- Les deux composants utilisent le même style visuel que `PatientPicker`
- Compatible avec `react-hook-form` pour la gestion du formulaire
- Les données sont actuellement embarquées (constantes locales)
- Possibilité future d'intégration avec l'API GraphQL
- Tests unitaires complets fournis
