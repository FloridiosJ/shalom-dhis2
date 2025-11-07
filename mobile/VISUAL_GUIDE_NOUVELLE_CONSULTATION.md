# Guide Visuel - Nouvelle Consultation Refactorisée

## 📱 Structure de la Page

### Avant vs Après

#### AVANT (Ancienne Version)
```
┌─────────────────────────────────────┐
│  Header: "Nouvelle Consultation"    │ ← SUPPRIMÉ
│  Badge: "Sauvegardé"                │ ← SUPPRIMÉ
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Patient (Section Title)     │   │ ← SUPPRIMÉ
│  │ [Patient Picker]            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Date et Heure (Title)       │   │ ← SUPPRIMÉ
│  │ [Date] | [Heure]            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Informations Cliniques      │   │
│  │ [Diagnostic] *              │   │ ← MODIFIÉ
│  │ [Prescriptions]             │   │ ← MODIFIÉ
│  │ [Notes]                     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Pièces Jointes              │   │ ← SUPPRIMÉ
│  │ [Attachment Field]          │   │ ← SUPPRIMÉ
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [Enregistrer] | [Envoyer]          │ ← MODIFIÉ
└─────────────────────────────────────┘
```

#### APRÈS (Nouvelle Version)
```
┌─────────────────────────────────────┐
│  Navigation Bar (app header)        │
├─────────────────────────────────────┤
│                                     │
│  [Patient Picker]                   │ ← Sans titre
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🕐 Heure *                  │   │ ← Ligne 1, Bleu
│  │ [Time Picker]               │   │
│  │                             │   │
│  │ 📅 Date de la consultation *│   │ ← Ligne 2, Bleu
│  │ [Date Picker]               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Informations Cliniques      │   │
│  │                             │   │
│  │ Type consultation *         │   │ ← NOUVEAU
│  │ [Input]                     │   │
│  │                             │   │
│  │ Catégories de maladie *     │   │ ← NOUVEAU
│  │ [Input]                     │   │
│  │                             │   │
│  │ Prescriptions structurées   │   │ ← Renommé
│  │ [Multiline Input]           │   │
│  │                             │   │
│  │ Notes                       │   │
│  │ [Multiline Input]           │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│        [Enregistrer]                │ ← Un seul bouton, Bleu
└─────────────────────────────────────┘
```

## 🎨 Palette de Couleurs

```
PRIMARY (Bleu)     : #2196F3  ████ Headers, labels date/heure, bouton
BACKGROUND         : #F5F5F5  ████ Fond général
CARD BACKGROUND    : #FFFFFF  ████ Cartes/sections
TEXT PRIMARY       : #212121  ████ Texte principal
TEXT SECONDARY     : #757575  ████ Texte secondaire
BORDER             : #E0E0E0  ████ Bordures
ERROR              : #D32F2F  ████ Erreurs
SUCCESS            : #4CAF50  ████ Succès
```

## 🔷 Composants Détaillés

### 1. Time Picker (Heure)
```
┌─────────────────────────────────────┐
│ 🕐 Heure *         [Label en #2196F3]
├─────────────────────────────────────┤
│ 🕐  14:30                        ▼ │ ← Icône bleue
└─────────────────────────────────────┘
   Min Height: 48px (Accessibilité)
```

### 2. Date Picker (Date de la consultation)
```
┌─────────────────────────────────────┐
│ 📅 Date de la consultation *  [Bleu]
├─────────────────────────────────────┤
│ 📅  06/11/2025                   ▼ │ ← Icône bleue
└─────────────────────────────────────┘
   Min Height: 48px (Accessibilité)
```

### 3. Consultation Input (Standard)
```
┌─────────────────────────────────────┐
│ Type consultation *                 │
│ ┌─────────────────────────────────┐ │
│ │ Consultation générale           │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### 4. Consultation Input (Multiline)
```
┌─────────────────────────────────────┐
│ Prescriptions structurées           │
│ ┌─────────────────────────────────┐ │
│ │ Paracétamol 500mg               │ │
│ │ 3 fois par jour pendant 5 jours │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### 5. Bouton Enregistrer
```
┌─────────────────────────────────────┐
│                                     │
│     ┌─────────────────────────┐    │
│     │    Enregistrer          │    │ ← Bleu #2196F3
│     └─────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
   Full width, Min Height: 48px
```

## 📋 Flux Utilisateur

### Scénario: Créer une nouvelle consultation

1. **Sélection du patient**
   ```
   Utilisateur → Clique sur Patient Picker
              → Recherche ou sélectionne un patient
              → Patient sélectionné affiché
   ```

2. **Saisie de l'heure**
   ```
   Utilisateur → Clique sur champ "Heure"
              → Sélecteur d'heure s'ouvre (roue iOS / picker Android)
              → Sélectionne l'heure
              → Heure affichée au format 24h (ex: 14:30)
   ```

3. **Saisie de la date**
   ```
   Utilisateur → Clique sur champ "Date de la consultation"
              → Calendrier s'ouvre
              → Sélectionne la date (max: aujourd'hui)
              → Date affichée au format DD/MM/YYYY
   ```

4. **Informations cliniques**
   ```
   Utilisateur → Saisit "Type consultation" (requis)
              → Saisit "Catégories de maladie" (requis)
              → Saisit "Prescriptions structurées" (optionnel)
              → Saisit "Notes" (optionnel)
   ```

5. **Enregistrement**
   ```
   Utilisateur → Clique sur "Enregistrer"
              → Validation automatique
              → Si erreurs: messages affichés sous champs
              → Si valide: sauvegarde + navigation retour
              → Message de succès affiché
   ```

## 🔄 États du Formulaire

### État Initial
```
- Tous les champs vides sauf:
  - dateConsultation: Date du jour
  - heureConsultation: Heure actuelle
- Bouton "Enregistrer": désactivé
```

### État en Cours de Saisie
```
- Auto-save activé (debounce 1s)
- Validation temps réel (onChange)
- Erreurs affichées instantanément
- Bouton "Enregistrer": activé si formulaire valide
```

### État de Chargement
```
- Bouton "Enregistrer": 
  * Désactivé
  * Affiche ActivityIndicator
  * Texte caché
```

### État d'Erreur
```
┌─────────────────────────────────────┐
│ Type consultation *                 │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │ ← Bordure rouge
│ └─────────────────────────────────┘ │
│ ⚠️ Le type de consultation est requis
└─────────────────────────────────────┘
```

## ♿ Considérations d'Accessibilité

### Labels et Descriptions
```
<TimePickerBlue
  label="Heure"
  accessibilityLabel="Heure de la consultation: 14:30"
  accessibilityHint="Ouvre le sélecteur d'heure"
/>
```

### Tailles Tactiles Minimales
```
Tous les éléments interactifs: ≥ 48px
- Date/Time Pickers: 48px min height
- Bouton Enregistrer: 48px min height
- Inputs: 48px min height (single line)
```

### Feedback Visuel
```
États supportés:
- Normal    : Bordure grise
- Focus     : Bordure bleue
- Error     : Bordure rouge + message
- Disabled  : Opacité réduite
- Loading   : Spinner + disabled
```

## 📱 Responsive Design

### Mobile Portrait (Standard)
```
┌─────────────────┐
│                 │
│  [Full Width]   │
│                 │
│  [Full Width]   │
│                 │
└─────────────────┘
```

### Mobile Landscape
```
┌─────────────────────────────────────┐
│ [Same as portrait, scrollable]      │
│ KeyboardAvoidingView active         │
└─────────────────────────────────────┘
```

### Clavier Ouvert
```
┌─────────────────┐
│                 │
│  [Visible]      │
│                 │
├─────────────────┤
│                 │
│  [Keyboard]     │ ← Pas de recouvrement
│                 │
└─────────────────┘
KeyboardAvoidingView gère le scroll automatique
```

## 🎯 Zones Cliquables

```
Éléments interactifs:
1. Patient Picker         : Toute la zone
2. Time Picker Button     : Toute la zone (48px min)
3. Date Picker Button     : Toute la zone (48px min)
4. Text Inputs            : Toute la zone (48px min)
5. Bouton Enregistrer     : Toute la zone (48px min)
```

## 🧪 Tests à Effectuer

### Tests Fonctionnels
- [ ] Sélection d'un patient
- [ ] Saisie heure (avant et après minuit)
- [ ] Saisie date (date du jour, date passée)
- [ ] Validation date future (doit échouer)
- [ ] Saisie tous les champs requis
- [ ] Saisie avec champs optionnels vides
- [ ] Soumission avec données valides
- [ ] Soumission avec données invalides
- [ ] Auto-save (vérifier AsyncStorage)

### Tests Visuels
- [ ] Couleur bleue cohérente (#2196F3)
- [ ] Espacement entre les éléments
- [ ] Bordures et coins arrondis
- [ ] Messages d'erreur lisibles
- [ ] Loading state du bouton

### Tests d'Accessibilité
- [ ] Taille des zones tactiles ≥ 48px
- [ ] Labels présents sur tous les champs
- [ ] Navigation au clavier (Android TV)
- [ ] VoiceOver/TalkBack fonctionnel
- [ ] Contraste des couleurs suffisant

### Tests de Performance
- [ ] Temps de chargement initial
- [ ] Fluidité du scroll
- [ ] Réactivité des pickers
- [ ] Debounce de l'auto-save efficace

## 🔍 Points d'Attention

### ⚠️ Changements Breaking
```
1. Type ConsultationFormData modifié
   - Champs ajoutés: typeConsultation, categoriesMaladie
   - Champs renommés: prescriptions → prescriptionsStructurees
   - Champs supprimés: attachments

2. Brouillons existants incompatibles
   - Nécessite migration ou suppression

3. API backend doit être adaptée
   - Accepter les nouveaux champs
   - Mettre à jour les mutations GraphQL
```

### ✅ Points Positifs
```
1. Interface plus épurée
2. Code plus maintenable (componentisation)
3. Meilleure accessibilité
4. Tests complets
5. Documentation exhaustive
```

## 📸 Screenshots à Capturer

1. **Vue d'ensemble** - Formulaire vide
2. **Patient sélectionné** - Après sélection patient
3. **Time Picker ouvert** - Sélecteur d'heure
4. **Date Picker ouvert** - Calendrier
5. **Formulaire rempli** - Tous les champs valides
6. **Erreurs de validation** - Champs requis vides
7. **État de chargement** - Pendant sauvegarde
8. **Message de succès** - Après sauvegarde réussie
