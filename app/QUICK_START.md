# 🚀 Quick Start Guide - Application Mobile Expo

## ⚡ Démarrage en 3 Minutes

### Étape 1: Installation
```bash
cd app
npm install
```

### Étape 2: Lancement

**Option A - Avec USB (Plus rapide)**
```bash
npm run android
```
Prérequis: Débogage USB activé sur le téléphone

**Option B - Sans câble (QR Code)**
```bash
npm start
```
Puis scanner le QR code avec Expo Go

### Étape 3: Tester!
L'application devrait s'ouvrir avec:
- Écran d'accueil "Bonjour! 👋"
- Bouton "Obtenir ma position" pour tester le GPS
- Bouton pour aller à l'écran de détails

---

## 📱 Sur Téléphone Android (Première fois)

### Activer Mode Développeur
1. Ouvrir **Paramètres**
2. Aller dans **À propos du téléphone**
3. Appuyer **7 fois** sur "Version MIUI"
4. Message "Vous êtes développeur!" apparaît ✅

### Activer Débogage USB
1. Ouvrir **Paramètres** > **Paramètres supplémentaires**
2. Ouvrir **Options pour les développeurs**
3. Activer **Débogage USB** ✅
4. Activer **Installer via USB** ✅
5. Connecter via USB et accepter l'autorisation

### Vérifier Connexion
```bash
adb devices
# Devrait afficher: XXXXXXX    device
```

### Vérifier Java (Important pour builds)
```bash
java -version
# Devrait afficher: openjdk version "17.x.x" ou "11.x.x"
# JDK 17 est recommandé et pleinement compatible
```

---

## 🔧 Commandes Utiles

```bash
npm start          # Lancer avec QR code
npm run android    # Lancer directement sur Android (USB)
npm run clear      # Nettoyer le cache
npm run tunnel     # Mode tunnel (problèmes réseau)
```

---

## 🏗️ Build APK

```bash
# 1. Installer EAS CLI
npm install -g eas-cli

# 2. Se connecter
eas login

# 3. Build APK
eas build --platform android --profile preview

# 4. Attendre ~10-15 minutes
# 5. Télécharger et installer l'APK
```

---

## 📚 Documentation Complète

| Document | Contenu | Taille |
|----------|---------|--------|
| [README.md](README.md) | Guide complet (USB, QR, EAS, bonnes pratiques) | 12KB |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Exemples de code pour toutes les APIs | 6.7KB |
| [VISUAL_GUIDE.md](VISUAL_GUIDE.md) | Mockups UI et diagrammes | 16KB |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Rapport complet d'implémentation | 12KB |

---

## ✅ Checklist de Vérification

### Avant de Commencer
- [ ] Node.js 18+ installé (`node --version`)
- [ ] npm 9+ installé (`npm --version`)
- [ ] Téléphone Android disponible

### Pour USB
- [ ] Cable USB fonctionnel
- [ ] Mode développeur activé
- [ ] Débogage USB activé
- [ ] `adb devices` montre l'appareil

### Pour QR Code
- [ ] Expo Go installé sur le téléphone
- [ ] Téléphone et PC sur même Wi-Fi
- [ ] Pare-feu désactivé (si problèmes)

### Installation
- [ ] `cd app` ✅
- [ ] `npm install` ✅
- [ ] `npm start` ou `npm run android` ✅

---

## 🎯 Structure du Projet

```
app/
├── src/
│   ├── navigation/
│   │   └── Navigation.tsx      # Configuration navigation
│   └── screens/
│       ├── HomeScreen.tsx      # Écran accueil + GPS
│       └── DetailsScreen.tsx   # Écran détails
├── App.tsx                     # Point d'entrée
├── app.json                    # Config Expo
├── eas.json                    # Config builds
└── package.json                # Dépendances
```

---

## 🛠️ Technologies Utilisées

- **Expo SDK 54** - Framework
- **TypeScript** - Langage
- **React Navigation** - Navigation
- **React Native Paper** - UI Material Design
- **expo-location** - Géolocalisation (exemple fonctionnel)
- **@apollo/client** - GraphQL
- **expo-notifications** - Notifications
- **expo-image-picker** - Sélection photos
- **expo-secure-store** - Stockage sécurisé

---

## 🐛 Problèmes Courants

### "java.lang.String cannot be cast to java.lang.Boolean"
```bash
# Cette erreur vient de propriétés Expo incompatibles avec Android 11
# Solution: Déjà corrigé dans app.json (propriétés newArchEnabled, 
# edgeToEdgeEnabled et predictiveBackGestureEnabled retirées)
```

### "Failed to download remote update"
```bash
# Cette erreur signifie qu'un projectId EAS invalide est dans app.json
# Solution: Retirer la section extra.eas de app.json pour développement local
# Le projet fonctionne sans configuration EAS
```

### "Unable to resolve module"
```bash
rm -rf node_modules package-lock.json
npm install
npm start -- --clear
```

### Appareil non détecté (adb)
```bash
adb kill-server
adb start-server
adb devices
```

### QR Code ne fonctionne pas
```bash
npm start -- --tunnel
# OU
npm start -- --lan
```

### Cache problématique
```bash
npm run clear
# OU
npx expo start -c
```

---

## 📞 Support

- 📖 Documentation: [README.md](README.md)
- 🌐 Expo Docs: https://docs.expo.dev/
- 🧭 Navigation Docs: https://reactnavigation.org/
- 💬 GitHub Issues: Pour les problèmes spécifiques

---

## 🎉 Prêt!

L'application est maintenant prête à être utilisée!

**Test rapide:**
1. `cd app && npm install`
2. `npm start` (QR) ou `npm run android` (USB)
3. Cliquer sur "Obtenir ma position"
4. Voir les coordonnées GPS s'afficher ✅

**Pour la suite:**
- Voir [DEVELOPMENT.md](DEVELOPMENT.md) pour ajouter des fonctionnalités
- Voir [README.md](README.md) pour la documentation complète
- Voir [VISUAL_GUIDE.md](VISUAL_GUIDE.md) pour les mockups UI

---

## ✨ Features Disponibles

- ✅ Navigation entre écrans
- ✅ Géolocalisation GPS
- ✅ UI Material Design
- ✅ Prêt pour Apollo GraphQL
- ✅ Prêt pour notifications
- ✅ Prêt pour sélection photos
- ✅ Prêt pour stockage sécurisé

**Tout est configuré et prêt à l'emploi!** 🚀
