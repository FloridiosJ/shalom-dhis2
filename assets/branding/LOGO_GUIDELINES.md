# 🎨 Guide d'Utilisation du Logo Shalom DHIS2

Ce document décrit l'ensemble des assets du logo Shalom DHIS2, leurs usages, et les procédures de maintenance.

## 📁 Structure des Assets

```
assets/branding/
├── logos/                  # Logos principaux
│   ├── shalom-logo.svg           # Logo complet (SVG master)
│   ├── shalom-logo-*.png         # Versions PNG (512, 1024, 256, 128)
│   ├── shalom-mark.svg           # Mark/Icône seul (SVG master)
│   ├── shalom-mark-*.png         # Mark PNG (512, 256, 128, 72, 48)
│   ├── shalom-logo-mono.svg      # Version monochrome (SVG)
│   └── shalom-logo-mono-*.png    # Monochrome PNG (512, 256)
├── icons/                  # Icônes et favicons
│   ├── favicon.svg               # Favicon (SVG master)
│   ├── favicon-*.png             # Favicon PNG (16, 32, 48)
│   └── app-icon-*.png            # App icons (96, 144, 192, 512, 1024)
├── splash/                 # Splash screens
│   ├── shalom-splash.svg         # Splash screen (SVG master)
│   └── shalom-splash-*.png       # Splash PNG (différentes résolutions)
├── badges/                 # Badges départements
│   ├── badge-general.svg         # Médecine Générale
│   ├── badge-maternity.svg       # Maternité
│   └── badge-pediatrics.svg      # Pédiatrie
├── social/                 # Réseaux sociaux
│   └── social-preview.svg        # Preview image (1200x630)
├── generate-assets.js      # Script de génération
└── package.json           # Dépendances du générateur
```

## 🎯 Utilisation des Assets

### Logo Principal (`shalom-logo.svg`)
- **Usage**: Header d'application, README, documentation, présentations
- **Dimensions**: SVG scalable, PNG disponibles en 128, 256, 512, 1024px
- **Couleurs**: Vert principal (#2E7D32), Rouge cœur (#E53935), Vert accent (#4CAF50)
- **Zone de protection**: Minimum 20px d'espace autour du logo

### Mark/Icône (`shalom-mark.svg`)
- **Usage**: App icon, favicon, petit espace où le texte n'est pas lisible
- **Dimensions**: SVG scalable, PNG disponibles en 48, 72, 128, 256, 512px
- **Symbole**: Croix médicale avec cœur central, symbole reconnaissable

### Version Monochrome (`shalom-logo-mono.svg`)
- **Usage**: Impressions N&B, fax, cas où la couleur n'est pas disponible
- **Couleur**: Noir (#000000) avec différents niveaux d'opacité

### Badges Départements
- **badge-general.svg**: Médecine Générale (vert #2E7D32)
- **badge-maternity.svg**: Maternité (rose #E91E63)
- **badge-pediatrics.svg**: Pédiatrie (bleu #2196F3)
- **Usage**: Headers spécifiques, rapports par département, navigation

### Splash Screen (`shalom-splash.svg`)
- **Usage**: Écran de démarrage mobile (Android/iOS)
- **Background**: Blanc (#FFFFFF) pour cohérence
- **Dimensions**: Adapté pour différentes résolutions d'écran

### Favicon (`favicon.svg`)
- **Usage**: Navigateur web, onglets, bookmarks
- **Dimensions**: 16x16, 32x32, 48x48 pixels
- **Format**: SVG pour navigateurs modernes, PNG pour compatibilité

### Social Preview (`social-preview.svg`)
- **Usage**: Open Graph, Twitter Card, partages réseaux sociaux
- **Dimensions**: 1200x630 pixels (ratio recommandé)

## 🛠️ Génération des Assets

### Installation des dépendances

```bash
cd assets/branding
npm install
```

### Générer tous les assets PNG depuis les SVG

```bash
cd assets/branding
npm run generate
```

Cette commande génère automatiquement toutes les versions PNG à partir des fichiers SVG maîtres.

### Régénérer (nettoyer puis générer)

```bash
cd assets/branding
npm run regenerate
```

### Nettoyer tous les PNG

```bash
cd assets/branding
npm run clean
```

## 📱 Intégration Mobile (React Native)

### 1. Installation des packages requis

```bash
cd mobile
npm install react-native-svg react-native-bootsplash --save
npm install --save-dev @bam.tech/react-native-make
```

### 2. Configurer le Splash Screen

```bash
npx react-native-bootsplash generate \
  ../assets/branding/splash/shalom-splash-1080x1920.png \
  --background-color=#FFFFFF \
  --logo-width=200 \
  --assets-output=assets/bootsplash
```

Pour plus d'informations: [react-native-bootsplash](https://github.com/zoontek/react-native-bootsplash)

#### ⚠️ Dépannage: Erreur Sharp "undefined symbol"

Si vous rencontrez l'erreur `undefined symbol: vips_fail_on_get_type` lors de l'exécution de la génération du splash screen, cela indique un conflit avec les bindings natifs de Sharp. Solutions:

**Option 1: Réinstaller react-native-bootsplash**
```bash
cd mobile
rm -rf node_modules/react-native-bootsplash
npm install react-native-bootsplash --force
```

**Option 2: Utiliser une version compatible de Sharp**
```bash
cd mobile
npm install sharp@0.32.6 --save-dev --force
rm -rf node_modules/react-native-bootsplash/node_modules/sharp
```

**Option 3: Utiliser l'outil en ligne**
Si les erreurs persistent, vous pouvez générer le splash screen manuellement:
1. Visitez: https://github.com/zoontek/react-native-bootsplash#assets-generation
2. Suivez les instructions pour générer les assets localement
3. Placez les fichiers générés dans votre projet

**Option 4: Régénérer les bindings natifs**
```bash
cd mobile
npm rebuild sharp
npx react-native-bootsplash generate ../assets/branding/splash/shalom-splash-1080x1920.png --background-color=#FFFFFF --logo-width=200
```

### 3. Générer les icônes d'application

#### Android et iOS (icône unique)
```bash
cd mobile
npx react-native set-icon --path ../assets/branding/icons/app-icon-1024.png
```

#### Android (Adaptive Icons)
```bash
cd mobile
npx react-native set-icon \
  --background ../assets/branding/splash/white-bg.png \
  --foreground ../assets/branding/logos/shalom-mark-512.png
```

Pour plus d'informations: [@bam.tech/react-native-make](https://github.com/bamlab/react-native-make)

### 4. Utiliser le composant AppLogo

```tsx
import {AppLogo} from './src/components/AppLogo';

// Logo complet avec texte
<AppLogo width={200} height={200} showText={true} variant="full" />

// Mark/Icône seulement
<AppLogo width={60} height={60} showText={false} variant="mark" />

// Version monochrome
<AppLogo width={150} height={150} showText={true} variant="mono" />
```

## 🌐 Intégration Web

### Favicon dans HTML

```html
<!-- Dans web/index.html -->
<link rel="icon" type="image/svg+xml" href="/assets/branding/icons/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/branding/icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/branding/icons/favicon-16.png">
```

### Meta Tags pour Réseaux Sociaux

```html
<!-- Open Graph -->
<meta property="og:image" content="/assets/branding/social/social-preview.svg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="/assets/branding/social/social-preview.svg">
```

## ♿ Accessibilité

### Texte Alternatif
Toujours fournir un texte alternatif descriptif:

```tsx
// React Native
<AppLogo accessible={true} accessibilityLabel="Logo Shalom DHIS2 - Système de gestion de santé" />

// HTML
<img src="logo.png" alt="Logo Shalom DHIS2 - Système de gestion de santé pour dispensaires">
```

### Contraste
- Le vert principal (#2E7D32) a un ratio de contraste de 4.5:1 avec le blanc
- Le rouge du cœur (#E53935) est utilisé comme accent, pas pour du texte principal
- Version monochrome disponible pour les cas de faible contraste

### Tailles Minimales
- Logo complet: minimum 100px de largeur
- Mark/Icône: minimum 24px de largeur
- Favicon: 16px (standard minimal)

## 🎨 Charte Graphique

### Couleurs Principales

| Couleur | Hex | Usage |
|---------|-----|-------|
| Vert Principal | `#2E7D32` | Logo, croix médicale, texte principal |
| Vert Clair | `#4CAF50` | Accents, éléments décoratifs |
| Rouge | `#E53935` | Cœur, élément distinctif |
| Gris Texte | `#666666` | Sous-titres, texte secondaire |
| Noir | `#000000` | Version monochrome |

### Départements

| Département | Couleur | Hex |
|-------------|---------|-----|
| Médecine Générale | Vert | `#2E7D32` |
| Maternité | Rose | `#E91E63` |
| Pédiatrie | Bleu | `#2196F3` |

### Typographie
- Police principale: Arial, sans-serif (pour compatibilité maximale)
- Titre "SHALOM": Bold
- Sous-titres: Regular

### Proportions
- Le cœur occupe environ 40% du centre de la croix
- La croix est centrée dans le cercle de fond
- Zone de protection: 10% de la largeur totale du logo

## 🔄 Maintenance et Mise à Jour

### Modifier le Logo

1. **Modifier le SVG maître** dans `/assets/branding/logos/shalom-logo.svg`
2. **Régénérer tous les assets**:
   ```bash
   cd assets/branding
   npm run regenerate
   ```
3. **Mettre à jour les apps mobiles**:
   ```bash
   cd mobile
   npx react-native set-icon --path ../assets/branding/icons/app-icon-1024.png
   npx react-native generate-bootsplash ../assets/branding/splash/shalom-splash-1080x1920.png --background-color=#FFFFFF
   ```

### Ajouter une Nouvelle Variante

1. Créer le nouveau SVG dans le dossier approprié
2. Ajouter la génération dans `generate-assets.js`:
   ```javascript
   await svgToPng(newSvg, outputPath, width, height);
   ```
3. Exécuter `npm run generate`
4. Mettre à jour ce guide

### Checklist de Déploiement

- [ ] Tous les SVG maîtres sont à jour
- [ ] Les PNG ont été régénérés (`npm run generate`)
- [ ] Le composant `AppLogo` reflète les changements
- [ ] Les icônes d'app mobile sont à jour
- [ ] Le splash screen est configuré
- [ ] Les favicons web sont déployés
- [ ] Les meta tags sociaux sont à jour
- [ ] La documentation est à jour
- [ ] Tests visuels sur Android et iOS
- [ ] Tests sur navigateurs (Chrome, Safari, Firefox)

## 📝 Historique des Versions

### Version 1.0.0 (2025-11-05)
- Création initiale du système de branding complet
- Logo principal avec croix médicale et cœur
- 3 badges départements (Maternité, Pédiatrie, Médecine Générale)
- Splash screen pour mobile
- Favicon et app icons
- Script de génération automatique
- Composant React Native AppLogo
- Documentation complète

## 🤝 Contribution

Pour toute modification du branding:
1. Suivre les guidelines d'accessibilité
2. Maintenir la cohérence visuelle
3. Mettre à jour la documentation
4. Tester sur tous les supports (mobile, web, impression)
5. Obtenir une validation avant déploiement

## 📞 Support

Pour toute question sur l'utilisation des assets:
- Consulter ce guide en premier
- Vérifier les exemples d'intégration
- Contacter l'équipe de développement

---

**Note**: Ce guide est un document vivant. Mettez-le à jour à chaque modification du système de branding.
