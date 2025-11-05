# Guide Visuel - Écran Détail Consultation Patient

## Vue d'ensemble de l'écran

L'écran de détail de consultation est divisé en 4 sections principales, chacune dans une carte (Card) distincte avec ombrage et arrondis.

## Structure de l'écran

```
┌─────────────────────────────────────────┐
│  📅 Consultation du 15/03/24            │  ← Header avec date
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ ❤️  Signes vitaux               │  │
│  ├─────────────────────────────────┤  │
│  │  ⚖️ Poids        🌡️ Température │  │  ← Grid 2 colonnes
│  │  68 kg          38.5 °C        │  │
│  │                                 │  │
│  │  💓 Pression     ❤️ Pouls       │  │
│  │  120/80         92 bpm         │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ 🩺 Diagnostic et Traitement     │  │
│  ├─────────────────────────────────┤  │
│  │ 📋 Motif de consultation        │  │
│  │ Fièvre, maux de tête, frissons │  │
│  │                                 │  │
│  │ 💼 Diagnostic                   │  │
│  │ Paludisme simple                │  │
│  │                                 │  │
│  │ 💊 Traitement prescrit          │  │
│  │ Artemether-Lumefantrine...      │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ 📝 Notes de l'agent             │  │
│  ├─────────────────────────────────┤  │
│  │▌La patiente a bien réagi...    │  │  ← Bordure gauche bleue
│  │▌Recommander repos et...        │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ ← Retour à la fiche patient     │  │  ← Bouton outlined
│  └─────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## Détail des composants

### 1. VitalsCard - Signes vitaux

**Layout**: Grid 2x2 responsive
- Chaque item a un fond gris clair (#F5F5F5)
- Icône colorée + label en haut
- Valeur en gros (Headline)
- Unité en petit en bas

**Couleurs des icônes**:
- Poids: Vert (#4CAF50)
- Température: Orange (#FF9800)
- Pression: Rouge (#F44336)
- Pouls: Rose (#E91E63)

**État vide**:
```
┌─────────────────────────────────┐
│ ❤️  Signes vitaux               │
├─────────────────────────────────┤
│         ⚠️                      │
│   Aucun signe vital             │
│   enregistré                    │
└─────────────────────────────────┘
```

### 2. ConsultationDiagnosisCard - Diagnostic et Traitement

**Layout**: Sections verticales avec icônes
- Chaque section: icône + label + texte
- Sections n'apparaissent que si données disponibles

**Icônes**:
- 📋 Motif: Orange (#FF9800)
- 💼 Diagnostic: Rouge (#F44336)
- 💊 Traitement: Vert (#4CAF50)

**État vide**:
```
┌─────────────────────────────────┐
│ 🩺 Diagnostic et Traitement     │
├─────────────────────────────────┤
│         ⚠️                      │
│   Aucune information            │
│   médicale disponible           │
└─────────────────────────────────┘
```

### 3. AgentNotesCard - Notes de l'agent

**Layout**: Zone de texte avec bordure
- Background gris clair (#F5F5F5)
- Bordure gauche bleue (4px, #2196F3)
- Texte avec line-height confortable (22px)

**État vide**:
```
┌─────────────────────────────────┐
│ 📝 Notes de l'agent             │
├─────────────────────────────────┤
│         ⚠️                      │
│   Aucune note disponible        │
└─────────────────────────────────┘
```

### 4. BackToPatientButton - Bouton de retour

**Style**: Bouton outlined
- Bordure bleue (#2196F3, 1.5px)
- Texte bleu (#2196F3)
- Icône flèche à gauche
- Hauteur minimum 48px (accessibilité)

## Palette de couleurs

### Couleurs principales
- **Primaire**: #2196F3 (Bleu Material)
- **Background**: #F5F5F5 (Gris très clair)
- **Cards**: #FFFFFF (Blanc)

### Couleurs de texte
- **Titre principal**: #212121 (Noir quasi-pur)
- **Texte secondaire**: #757575 (Gris moyen)
- **Texte désactivé**: #9E9E9E (Gris clair)
- **Placeholder**: #BDBDBD (Gris très clair)

### Couleurs fonctionnelles
- **Succès/Santé**: #4CAF50 (Vert)
- **Attention**: #FF9800 (Orange)
- **Urgence**: #F44336 (Rouge)
- **Info**: #2196F3 (Bleu)
- **Empathie**: #E91E63 (Rose)

## Typographie

### Variants utilisés (react-native-paper)
- **headlineSmall**: Date de consultation (header)
- **titleLarge**: Titres de cards
- **titleSmall**: Labels de sections
- **headlineSmall**: Valeurs de signes vitaux
- **bodyLarge**: Texte principal
- **bodyMedium**: Texte secondaire
- **bodySmall**: Labels et unités

### Poids de police
- **Bold (700)**: Titres, valeurs importantes
- **Semi-bold (600)**: Sous-titres, labels
- **Regular (400)**: Texte courant

## Espacements

### Padding
- **Horizontal écran**: 16px
- **Vertical écran**: 16px
- **Padding card**: 12-16px
- **Espacement entre cards**: 16px

### Margins
- **Entre sections**: 16px
- **Entre éléments**: 8-12px
- **Bottom spacer**: 16-24px

## Accessibilité (a11y)

### Tailles minimales
- **Boutons**: 48x48px minimum
- **Zones tactiles**: 44x44px minimum
- **Text principal**: 16px minimum

### Contrastes
- Texte principal/background: 13.6:1 (AAA)
- Texte secondaire/background: 4.6:1 (AA)
- Boutons/background: Conforme AAA

### Labels ARIA
Tous les éléments ont:
- `accessibilityRole` approprié
- `accessibilityLabel` descriptif
- `accessibilityHint` pour actions

## Comportements responsive

### Mobile portrait (320-480px)
- Grid 2 colonnes pour signes vitaux
- Cards pleine largeur (minus 32px margins)
- Scroll vertical automatique

### Mobile landscape / Tablette
- Même layout (optimisé pour portrait)
- Plus d'espace vertical visible
- Scroll moins fréquent

### SafeAreaView
- Protection automatique des zones:
  - Notch iPhone
  - Home indicator
  - Status bar
  - Navigation bar

## Animations et transitions

### Transitions existantes (React Navigation)
- Slide de droite à gauche (Android)
- Modal push (iOS)
- Fade in/out pour overlays

### Futures améliorations possibles
- Skeleton loading pour cards
- Slide up pour boutons
- Fade in pour sections

## États de l'écran

### 1. État normal
- Toutes les cards visibles
- Données affichées
- Bouton retour actif

### 2. État chargement
```
┌─────────────────────────────────┐
│           🔄                    │
│       Chargement...             │
└─────────────────────────────────┘
```

### 3. État données partielles
- Cards avec données: affichées normalement
- Cards sans données: état vide affiché
- Pas d'erreur, juste placeholder

### 4. État erreur (future)
- Affichage message d'erreur
- Bouton retry
- Bouton retour toujours accessible

## Exemples de données

### Consultation complète
```typescript
{
  id: "1",
  dateConsultation: "2024-03-15T10:00:00Z",
  motifConsultation: "Fièvre, maux de tête, frissons.",
  diagnostic: "Paludisme simple",
  prescription: "Artemether-Lumefantrine (Coartem) 20/120mg...",
  agentNotes: "La patiente a bien réagi au traitement initial...",
  vitalSigns: {
    weight: 68,
    temperature: 38.5,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    pulse: 92
  }
}
```

### Consultation minimale
```typescript
{
  id: "2",
  dateConsultation: "2024-03-16T10:00:00Z",
  diagnostic: "Consultation de routine",
  prescription: "",
  notes: ""
}
```

## Flux utilisateur

1. **Liste patients** → Clic sur patient
2. **Détail patient** → Voir historique consultations
3. **Liste consultations** → Clic sur une consultation
4. **Détail consultation** ← Vous êtes ici!
5. **Bouton retour** → Retour au détail patient

## Points d'extension futurs

### Fonctionnalités additionnelles possibles
1. **Bouton édition** - Modifier la consultation
2. **Impression/Export PDF** - Partager la consultation
3. **Photos/Attachments** - Voir images médicales
4. **Historique modifications** - Audit trail
5. **Signature agent** - Validation consultation
6. **Rendez-vous suivi** - Planifier prochain RDV

### Nouveaux types de données
1. **Examens complémentaires** - Résultats labo
2. **Allergies** - Affichage alertes
3. **Médicaments contre-indiqués** - Warnings
4. **Vaccinations** - Statut vaccination
5. **Antécédents** - Historique médical

---

**Note**: Ce guide visuel est un complément à la documentation technique CONSULTATION_DETAIL_IMPLEMENTATION.md
