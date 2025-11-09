# Organisation des Styles - Module Patient et Dispensaire

## Vue d'ensemble

Ce document explique l'organisation et la séparation des styles entre les modules **Patient** et **Dispensaire**. Cette séparation facilite la maintenance, évite les conflits de styles et permet des évolutions indépendantes pour chaque module.

## Structure des fichiers de styles

### Module Patient

**Fichiers :**
- `/src/pages/Patients.module.css` - Styles pour la page de liste des patients
- `/src/components/CreatePatientModal.module.css` - Styles pour le modal de création/édition de patient

**Composants concernés :**
- `Patients.jsx` - Page principale de gestion des patients
- `CreatePatientModal.jsx` - Modal de création/édition de patient

**Classes CSS spécifiques :**
- `.pageBg`, `.card`, `.header`, `.table` - Styles généraux de la page patients
- `.badgeMineur`, `.badgeMajeur` - Badges spécifiques aux patients (statut légal)
- `.badgeActive`, `.badgeInactive` - Badges de statut actif/inactif
- `.paginationWrapper`, `.paginationControls` - Pagination pour la liste de patients
- `.searchWrapper`, `.searchInput` - Recherche de patients

### Module Dispensaire

**Fichiers :**
- `/src/pages/Dispensaires.module.css` - Styles pour la page de liste des dispensaires
- `/src/components/CreateDispensaireModal.module.css` - Styles pour le modal de création/édition de dispensaire

**Composants concernés :**
- `Dispensaires.jsx` - Page principale de gestion des dispensaires
- `CreateDispensaireModal.jsx` - Modal de création/édition de dispensaire

**Classes CSS :**
- `.pageBg`, `.card`, `.header`, `.table` - Styles généraux de la page dispensaires
- `.searchWrapper`, `.searchInput` - Recherche de dispensaires
- `.iconBtnEdit`, `.iconBtnDelete` - Boutons d'action

## Convention de nommage

### Principes généraux

1. **Préfixes de modules** : Chaque fichier CSS commence par un commentaire identifiant le module
   ```css
   /* Patient Module Styles */
   /* Dispensaire Module Styles */
   ```

2. **Classes sémantiques** : Les classes utilisent des noms sémantiques liés au contexte
   - Patient : `.badgeMineur`, `.badgeMajeur` (spécifique aux patients)
   - Dispensaire : Styles génériques sans classes spécifiques patients

3. **Pas de classes globales partagées** : Chaque module a son propre ensemble complet de classes CSS, même si certaines sont similaires

## CSS Modules

Le projet utilise **CSS Modules** (fichiers `.module.css`) pour éviter les fuites de styles globaux :

- Chaque fichier `.module.css` est scopé automatiquement par le système de build
- Les classes sont importées comme objet JavaScript : `import styles from './Module.module.css'`
- Usage : `<div className={styles.className}>...</div>`
- Avantage : Pas de conflits de noms entre modules

## Responsive et Accessibilité (a11y)

### Responsive Design

Chaque module maintient sa propre logique responsive :

```css
@media (max-width: 700px) {
  .card { padding: 1.2rem 0.5rem; }
  .table { display: block; }
  .actionBtn { display: none; } /* FAB utilisé sur mobile */
}
```

### Accessibilité

- Les boutons d'action incluent des `aria-label` appropriés
- Les tableaux utilisent les attributs `scope` pour les en-têtes
- Les champs de formulaire sont liés à leurs labels
- Focus visible sur tous les éléments interactifs

## Bonnes pratiques

### ✅ À faire

1. **Utiliser uniquement les styles du module** : Patient utilise `Patients.module.css`, Dispensaire utilise `Dispensaires.module.css`
2. **Tester visuellement après modification** : Vérifier les deux modules pour éviter les régressions
3. **Maintenir la cohérence** : Les deux modules partagent un design similaire mais des styles séparés
4. **Documenter les changements majeurs** : Mettre à jour ce README si l'organisation change

### ❌ À éviter

1. **Ne pas partager de CSS entre modules** : Chaque module doit être autonome
2. **Ne pas utiliser de styles inline** : Privilégier les CSS Modules
3. **Ne pas créer de dépendances croisées** : Patient ne doit pas importer de styles Dispensaire et vice-versa
4. **Ne pas casser le responsive** : Toujours tester sur mobile après modification

## Évolution et personnalisation

### Ajouter un nouveau style

Pour ajouter un style à un module :

1. Ouvrir le fichier `.module.css` correspondant
2. Ajouter la classe avec un nom sémantique
3. L'utiliser dans le composant JSX : `className={styles.nouvelleClasse}`

### Modifier un style existant

1. Identifier le module concerné (Patient ou Dispensaire)
2. Modifier uniquement le fichier CSS de ce module
3. Vérifier qu'il n'y a pas de régression visuelle
4. Tester le responsive si nécessaire

### Partager un style commun (exceptions)

Si un style doit vraiment être partagé (rare) :

1. Créer un fichier dans `/src/styles/` (ex: `shared.module.css`)
2. Importer explicitement dans les composants qui en ont besoin
3. Documenter la raison du partage dans ce README

## Audit et Vérification

### Checklist avant commit

- [ ] Les imports CSS pointent vers les bons fichiers de module
- [ ] Aucun style Dispensaire dans Patient, et vice-versa
- [ ] Le build Vite réussit (`npm run build`)
- [ ] Le linter passe (`npm run lint`) - ignorer les warnings non liés
- [ ] Test visuel : les pages Patient et Dispensaire s'affichent correctement
- [ ] Test responsive : vérification sur mobile (< 700px)
- [ ] Pas de régression : comparer avec l'état précédent

## Fichiers concernés

```
web/src/
├── pages/
│   ├── Patients.jsx                  → utilise Patients.module.css
│   ├── Patients.module.css           → styles page patients
│   ├── Dispensaires.jsx              → utilise Dispensaires.module.css
│   └── Dispensaires.module.css       → styles page dispensaires
├── components/
│   ├── CreatePatientModal.jsx        → utilise CreatePatientModal.module.css
│   ├── CreatePatientModal.module.css → styles modal patient
│   ├── CreateDispensaireModal.jsx    → utilise CreateDispensaireModal.module.css
│   └── CreateDispensaireModal.module.css → styles modal dispensaire
└── styles/
    └── README.md                      → ce fichier
```

## Motivation du refactoring

### Avant la séparation

- Patient et Dispensaire partageaient le même fichier CSS (`Dispensaires.module.css`)
- Risque de conflits lors de modifications indépendantes
- Difficile de personnaliser un module sans affecter l'autre
- Code moins maintenable et moins clair

### Après la séparation

- ✅ Chaque module a ses propres styles
- ✅ Pas de risque de conflit
- ✅ Évolutions indépendantes facilitées
- ✅ Code plus maintenable et organisé
- ✅ Préparation pour futures personnalisations

## Support et Questions

Pour toute question sur l'organisation des styles :

1. Consulter ce README
2. Examiner les fichiers CSS existants pour voir les patterns
3. Contacter l'équipe de développement front-end

---

**Dernière mise à jour** : 2025-11-09  
**Auteur** : Refactoring de séparation des modules Patient/Dispensaire
