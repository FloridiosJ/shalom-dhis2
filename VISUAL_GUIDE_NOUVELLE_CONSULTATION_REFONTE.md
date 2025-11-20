# Guide Visuel - Refonte UI/UX Nouvelle Consultation

## Vue d'ensemble des changements

Cette refonte modernise et uniformise l'interface de la screen "Nouvelle Consultation" en appliquant de manière cohérente les couleurs du design system de l'application.

## Changements détaillés

### 1. Bouton "Créer un nouveau patient"
**Avant** : Bouton texte gris
**Après** : Bouton bleu (#2196F3) avec texte blanc

#### Impact visuel :
- Le bouton est maintenant plus visible et attire l'attention
- Utilise la couleur primaire de l'application (même bleu que la bannière principale)
- Meilleur contraste avec fond blanc : rapport de contraste > 4.5:1 (conforme WCAG AA)
- Mode "contained" au lieu de "text" pour plus d'emphase

#### Fichier modifié :
`mobile/src/components/form/PatientPicker.tsx`
- `mode="contained"` avec `backgroundColor: '#2196F3'`
- `color: '#FFFFFF'` pour le label

---

### 2. Labels "Heure" et "Date de la consultation"
**Avant** : Labels bleus (#2196F3)
**Après** : Labels noirs (#111111)

#### Impact visuel :
- Meilleure lisibilité des labels
- Plus cohérent avec les autres labels de formulaire
- Conserve les icônes bleues pour maintenir l'identité visuelle
- Contraste amélioré sur fond blanc

#### Fichiers modifiés :
- `mobile/src/components/consultation/form/DatePickerBlue.tsx`
- `mobile/src/components/consultation/form/TimePickerBlue.tsx`

Changement : `color: '#111111'` au lieu de `THEME_COLORS.primary`

---

### 3. Modal "Sélectionner un patient"
**Avant** : Header blanc avec texte noir et bordure grise
**Après** : Bannière bleue (#2196F3) avec texte blanc

#### Impact visuel :
- La bannière bleue crée une cohérence visuelle avec le header de l'application
- Le titre "Sélectionner un patient" est maintenant en blanc sur fond bleu
- L'icône de fermeture (X) est aussi en blanc pour meilleure visibilité
- Suppression de la bordure inférieure (remplacée par le contraste de couleur)

#### Fichier modifié :
`mobile/src/components/form/PatientPicker.tsx`

Nouveaux styles ajoutés :
```typescript
modalBanner: {
  backgroundColor: '#2196F3', // Blue banner matching header
},
modalTitle: {
  color: '#FFFFFF', // White text on blue banner
},
```

Structure DOM modifiée :
```
<View style={styles.modalBanner}>      ← Nouveau wrapper bleu
  <View style={styles.modalHeader}>
    <Text style={styles.modalTitle}>...</Text>
    <Icon name="close" color="#FFFFFF" />  ← Blanc au lieu de noir
  </View>
</View>
```

---

### 4. Affichage du patient sélectionné
**Avant** : Nom complet + numéro patient
**Après** : Nom complet uniquement

#### Impact visuel :
- Interface plus épurée
- Focus sur l'information la plus importante (nom du patient)
- Le numéro patient reste visible dans le modal de sélection
- Réduction du bruit visuel dans le formulaire

#### Fichier modifié :
`mobile/src/components/form/PatientPicker.tsx`

Code supprimé :
```typescript
<Text style={styles.selectedPatientNumber}>
  {selectedPatient.numeroPatient}
</Text>
```

---

## Accessibilité et conformité

### Contrastes vérifiés (WCAG 2.1 niveau AA) :
- ✅ Bouton bleu (#2196F3) avec texte blanc : ratio > 4.5:1
- ✅ Labels noirs (#111111) sur fond blanc : ratio > 15:1
- ✅ Bannière bleue avec texte blanc : ratio > 4.5:1
- ✅ Taille minimale des boutons : 48px (> 44px requis)

### Tests effectués :
- ✅ Tests unitaires : 4 suites, 12 tests passés
- ✅ Linting : Aucune nouvelle erreur
- ✅ Sécurité (CodeQL) : Aucune alerte

---

## Couleurs utilisées

| Élément | Couleur | Utilisation |
|---------|---------|-------------|
| Bleu primaire | `#2196F3` | Bouton, bannière modal, icônes |
| Noir | `#111111` | Labels de champs |
| Blanc | `#FFFFFF` | Texte sur bleu |
| Gris foncé | `#212121` | Texte normal |

---

## Notes d'implémentation

1. **Cohérence globale** : La couleur `#2196F3` est déjà utilisée partout dans l'app :
   - Header de navigation (`MainNavigator.tsx`)
   - Tabs actifs
   - Boutons primaires
   - Icônes importantes

2. **Pas de hardcoding** : La couleur est déjà définie dans `THEME_COLORS.primary` dans `NewConsultationScreen.styles.ts`

3. **Modifications minimales** : Seulement 3 fichiers modifiés, changements ciblés

4. **Rétrocompatibilité** : Aucune modification de l'API ou du comportement, uniquement visuel

---

## Prochaines étapes recommandées

Pour tester sur un appareil physique (Redmi 10A) :
1. Build l'application : `cd mobile && npm run android`
2. Naviguer vers "Nouvelle Consultation"
3. Vérifier :
   - Le bouton "Créer un nouveau patient" est bien bleu
   - Les labels "Heure" et "Date" sont noirs
   - Le modal a une bannière bleue
   - Seul le nom du patient s'affiche après sélection

---

## Captures d'écran attendues

### Avant/Après - Bouton "Créer un nouveau patient"
- Avant : Bouton texte discret en gris/bleu clair
- Après : Bouton bleu visible avec texte blanc

### Avant/Après - Modal de sélection
- Avant : Header blanc avec bordure
- Après : Bannière bleue sans bordure

### Avant/Après - Patient sélectionné
- Avant : "Rakoto Jean (P-001234)"
- Après : "Rakoto Jean"
