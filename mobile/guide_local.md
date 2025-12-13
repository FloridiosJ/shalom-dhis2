# Guide de Configuration Locale - Application Mobile Android

Ce guide détaille toutes les étapes nécessaires pour configurer votre environnement de développement local et lancer l'application mobile sur Android avec un **targetSdkVersion 30**.

## Table des matières

1. [Prérequis](#prérequis)
2. [Installation de l'environnement](#installation-de-lenvironnement)
3. [Configuration du projet](#configuration-du-projet)
4. [Lancement de l'application](#lancement-de-lapplication)
5. [Dépannage](#dépannage)
6. [Commandes utiles](#commandes-utiles)

---

## Prérequis

### Système d'exploitation
- **Windows**: Windows 10 ou supérieur
- **macOS**: macOS 10.15 (Catalina) ou supérieur
- **Linux**: Ubuntu 20.04 ou distribution équivalente

### Outils requis

#### 1. Node.js et npm
- **Version Node.js**: >= 20
- **Version npm**: >= 10

**Installation:**
```bash
# Vérifier la version installée
node --version
npm --version

# Télécharger depuis https://nodejs.org/ (version LTS recommandée)
```

#### 2. Java Development Kit (JDK)
- **Version JDK**: JDK 17 (recommandé pour React Native 0.82)

**Installation:**

**Windows/Linux:**
```bash
# Télécharger et installer OpenJDK 17 depuis:
# https://adoptium.net/

# Ou via package manager:
# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# Vérifier l'installation
java -version
javac -version
```

**Configuration de la variable d'environnement JAVA_HOME:**

**Windows:**
1. Panneau de configuration → Système → Paramètres système avancés
2. Variables d'environnement
3. Ajouter `JAVA_HOME` pointant vers le répertoire d'installation du JDK
   - Exemple: `C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot`
4. Ajouter `%JAVA_HOME%\bin` au `PATH`

**Linux/macOS:**
```bash
# Dans ~/.bashrc ou ~/.zshrc
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64  # Ajuster selon votre installation
export PATH=$JAVA_HOME/bin:$PATH
```

#### 3. Android Studio et Android SDK

**Installation d'Android Studio:**
1. Télécharger depuis https://developer.android.com/studio
2. Installer Android Studio avec les options par défaut
3. Au premier lancement, suivre l'assistant de configuration

**Configuration du SDK Android:**
1. Ouvrir Android Studio
2. Aller dans **Tools** → **SDK Manager**
3. Dans l'onglet **SDK Platforms**, cocher:
   - ✅ Android 14.0 (API 34) - pour compileSdkVersion
   - ✅ Android 11.0 (API 30) - pour targetSdkVersion
   - ✅ Android 7.0 (API 24) - pour minSdkVersion

4. Dans l'onglet **SDK Tools**, cocher:
   - ✅ Android SDK Build-Tools 34.0.0
   - ✅ Android SDK Command-line Tools (latest)
   - ✅ Android SDK Platform-Tools
   - ✅ Android Emulator
   - ✅ NDK (Side by side) version 27.1.12297006

5. Cliquer sur **Apply** et attendre l'installation

**Configuration des variables d'environnement Android:**

**Windows:**
1. Variables d'environnement → Nouvelle variable système
2. Nom: `ANDROID_HOME`
3. Valeur: Chemin vers le SDK Android
   - Exemple: `C:\Users\VotreNom\AppData\Local\Android\Sdk`
4. Ajouter au PATH:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

**Linux/macOS:**
```bash
# Dans ~/.bashrc ou ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk  # macOS: $HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/emulator:$PATH
export PATH=$ANDROID_HOME/platform-tools:$PATH
export PATH=$ANDROID_HOME/tools:$PATH
export PATH=$ANDROID_HOME/tools/bin:$PATH
```

**Vérifier l'installation:**
```bash
# Redémarrer le terminal puis vérifier
adb --version
emulator -version
sdkmanager --version
```

#### 4. Watchman (optionnel mais recommandé pour macOS/Linux)
```bash
# macOS
brew install watchman

# Linux
# Suivre les instructions sur https://facebook.github.io/watchman/docs/install.html
```

---

## Installation de l'environnement

### 1. Cloner le repository

```bash
# Remplacer par l'URL de votre fork si nécessaire
git clone https://github.com/FloridiosJ/shalom-dhis2.git
cd shalom-dhis2/mobile
```

### 2. Installer les dépendances Node.js

```bash
npm install
```

**Note:** L'installation peut prendre 5-10 minutes selon votre connexion internet.

### 3. Configuration de l'environnement

Créer le fichier `.env` à partir du template:

```bash
cp .env.example .env
```

Éditer le fichier `.env` et configurer l'endpoint GraphQL:

```env
# Pour émulateur Android
GRAPHQL_ENDPOINT=http://10.0.2.2:4000/graphql

# Pour appareil physique (remplacer par votre IP)
# GRAPHQL_ENDPOINT=http://192.168.X.X:4000/graphql
```

**Trouver votre adresse IP:**
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
# ou
ip addr show
```

### 4. Démarrer le backend (si nécessaire)

Avant de lancer l'application mobile, assurez-vous que le backend GraphQL est en cours d'exécution:

```bash
cd ../backend
npm install
npm start
# Le backend devrait être accessible sur http://localhost:4000
```

---

## Configuration du projet

### Structure du projet Android

```
mobile/android/
├── app/
│   ├── build.gradle          # Configuration de l'app (targetSdkVersion 30)
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/mobile/
│   │   │   ├── MainActivity.kt
│   │   │   └── MainApplication.kt
│   │   └── res/              # Ressources (icônes, strings, etc.)
├── gradle/wrapper/           # Gradle wrapper (suivi dans git)
├── build.gradle             # Configuration root (SDK versions)
├── gradle.properties        # Propriétés Gradle
└── settings.gradle          # Configuration modules et autolinking
```

### Configuration SDK dans build.gradle

Le fichier `android/build.gradle` contient les versions SDK:

```gradle
buildscript {
    ext {
        // buildToolsVersion removed - each AGP version has a default build tools version
        minSdkVersion = 24           // Android 7.0
        compileSdkVersion = 34       // Android 14 (pour compilation)
        targetSdkVersion = 30        // Android 11 (version cible)
        ndkVersion = "27.1.12297006"
        kotlinVersion = "2.1.20"
        androidGradlePluginVersion = "8.7.3"
    }
}
```

**Important:**
- `targetSdkVersion = 30`: Application ciblée pour Android 11 (API 30)
- `compileSdkVersion = 34`: Utilise les APIs d'Android 14 pour compiler
- `minSdkVersion = 24`: Supporte Android 7.0 minimum
- `buildToolsVersion` a été supprimé car chaque version d'AGP a une version par défaut des build tools

### Autolinking

Le projet utilise l'autolinking de React Native CLI pour lier automatiquement les modules natifs. Configuration dans:
- `android/app/build.gradle`: `autolinkLibrariesWithApp()`
- `android/settings.gradle`: `autolinkLibrariesFromCommand()`

**Aucune configuration manuelle n'est nécessaire** pour les bibliothèques natives supportant l'autolinking.

---

## Lancement de l'application

### Option 1: Émulateur Android

#### Créer un émulateur (première fois seulement)

1. Ouvrir Android Studio
2. Aller dans **Tools** → **Device Manager**
3. Cliquer sur **Create Device**
4. Choisir un appareil (ex: Pixel 5)
5. Sélectionner l'image système **API 30 (Android 11)** ou supérieur
6. Télécharger l'image si nécessaire
7. Cliquer sur **Finish**

#### Lancer l'émulateur

```bash
# Lister les émulateurs disponibles
emulator -list-avds

# Lancer un émulateur spécifique
emulator -avd Pixel_5_API_30

# Ou depuis Android Studio: Device Manager → Play
```

### Option 2: Appareil physique

#### Activer le mode développeur

**Sur votre appareil Android:**
1. Aller dans **Paramètres** → **À propos du téléphone**
2. Appuyer 7 fois sur **Numéro de build**
3. Retourner dans **Paramètres** → **Options de développeur**
4. Activer **Débogage USB**
5. Activer **Installer via USB** (si disponible)

#### Connecter l'appareil

1. Connecter l'appareil via USB
2. Autoriser le débogage USB sur l'appareil (popup)
3. Vérifier la connexion:

```bash
adb devices
# Devrait afficher votre appareil
```

**Redmi 10A et appareils similaires:**
- Pour le Redmi 10A (Android 11 / API 30), pas de configuration supplémentaire nécessaire
- Assurez-vous que les pilotes USB sont installés (MIUI USB Driver pour Xiaomi)

### Démarrer Metro Bundler

**Dans un terminal séparé**, démarrer Metro:

```bash
cd /chemin/vers/shalom-dhis2/mobile
npm start
```

**Ou:**
```bash
npx react-native start
```

**Metro devrait démarrer avec le message:**
```
Welcome to Metro
Fast - Scalable - Integrated

...
Loading dependency graph, done.
```

**Options Metro utiles:**
```bash
# Vider le cache Metro
npm start -- --reset-cache

# Ou
npx react-native start --reset-cache
```

### Lancer l'application Android

**Dans un autre terminal** (Metro doit rester actif):

```bash
cd /chemin/vers/shalom-dhis2/mobile
npm run android
```

**Ou:**
```bash
npx react-native run-android
```

**Ce qui se passe:**
1. Gradle télécharge les dépendances (première fois seulement)
2. L'application est compilée
3. L'APK est installé sur l'émulateur/appareil
4. L'application démarre automatiquement
5. Metro charge le bundle JavaScript

**Temps estimé:**
- Première compilation: 5-15 minutes (téléchargement Gradle, dépendances, etc.)
- Compilations suivantes: 1-3 minutes

---

## Dépannage

### Problème: Gradle ne se télécharge pas

**Erreur:**
```
Could not find gradle wrapper within Android SDK
```

**Solution:**
Le wrapper Gradle est maintenant inclus dans le projet (`mobile/android/gradle/wrapper/`). Si le problème persiste:

```bash
cd mobile/android
./gradlew --version  # Linux/macOS
# ou
gradlew.bat --version  # Windows
```

### Problème: SDK non trouvé

**Erreur:**
```
SDK location not found
```

**Solution:**
1. Vérifier que `ANDROID_HOME` est bien défini
2. Créer/éditer `mobile/android/local.properties`:

```properties
sdk.dir=/chemin/vers/android/sdk

# Windows
sdk.dir=C:\\Users\\VotreNom\\AppData\\Local\\Android\\Sdk

# macOS
sdk.dir=/Users/VotreNom/Library/Android/sdk

# Linux
sdk.dir=/home/VotreNom/Android/Sdk
```

### Problème: Build Gradle échoue

**Erreur:**
```
FAILURE: Build failed with an exception
```

**Solutions:**

#### 1. Nettoyer le build
```bash
cd mobile/android
./gradlew clean
cd ../..
npm run android
```

#### 2. Vérifier les versions SDK
```bash
# Ouvrir Android Studio → SDK Manager
# Vérifier que API 30 et API 34 sont installés
```

#### 3. Supprimer les caches
```bash
cd mobile/android
./gradlew clean
rm -rf .gradle
rm -rf app/build
cd ../..
rm -rf node_modules
npm install
```

### Problème: Metro ne se connecte pas

**Erreur:**
```
Unable to load script. Make sure you're running Metro
```

**Solution:**
1. Vérifier que Metro est bien démarré
2. Sur l'émulateur/appareil:
   - Secouer l'appareil ou appuyer sur `Ctrl+M` (émulateur)
   - Aller dans **Dev Settings** → **Debug server host & port**
   - Entrer: `localhost:8081` (émulateur) ou `IP_DE_VOTRE_PC:8081` (appareil)

3. Redémarrer Metro avec cache vidé:
```bash
npm start -- --reset-cache
```

### Problème: Module natif non trouvé

**Erreur:**
```
NativeModule.XXX is null
```

**Solution:**
```bash
# 1. Nettoyer et reconstruire
cd mobile/android
./gradlew clean
cd ../..

# 2. Supprimer node_modules
rm -rf node_modules
npm install

# 3. Rebuilder l'app
npm run android
```

### Problème: Incompatibilité Worklets/Reanimated

**Erreur:**
```
[Reanimated] Your installed version of Worklets (0.6.1) is not compatible with 
installed version of Reanimated (4.x.x). Please install Worklets 0.7.x or newer.
```

**Solution:**
```bash
# Mettre à jour react-native-worklets vers 0.7.x
npm install react-native-worklets@^0.7.1

# Nettoyer et rebuilder
cd android
./gradlew clean
cd ..
npm run android
```

**Note:** react-native-reanimated 4.x nécessite react-native-worklets 0.7.x minimum. 
Si vous voyez cette erreur, mettez à jour worklets dans package.json.

### Problème: Appareil non détecté (adb)

**Solution:**

```bash
# Redémarrer le serveur adb
adb kill-server
adb start-server
adb devices

# Si l'appareil n'apparaît toujours pas:
# 1. Débrancher/rebrancher l'USB
# 2. Vérifier que le débogage USB est activé
# 3. Essayer un autre câble USB (certains ne supportent que la charge)
# 4. Installer les pilotes USB du fabricant (Xiaomi, Samsung, etc.)
```

### Problème: Erreur de permissions (Linux)

**Erreur:**
```
Permission denied
```

**Solution:**
```bash
# Rendre gradlew exécutable
cd mobile/android
chmod +x gradlew
cd ../..
```

### Problème: Conflit de ports Metro

**Erreur:**
```
Port 8081 already in use
```

**Solution:**
```bash
# Trouver et tuer le processus
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:8081 | xargs kill -9

# Ou spécifier un autre port
npm start -- --port 8082
```

### Problème: Erreurs CMake/NDK

**Solution:**
Le NDK est maintenant spécifié dans `build.gradle` (`ndkVersion = "27.1.12297006"`). Assurez-vous que cette version est installée via Android Studio → SDK Manager → SDK Tools → NDK (Side by side).

### Problème: Out of Memory (Gradle)

**Erreur:**
```
OutOfMemoryError
```

**Solution:**
Éditer `mobile/android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

---

## Commandes utiles

### Développement quotidien

```bash
# Démarrer Metro
npm start

# Lancer sur Android
npm run android

# Vider le cache Metro
npm start -- --reset-cache

# Lancer sur un appareil spécifique
npx react-native run-android --deviceId=<device-id>
```

### Build et nettoyage

```bash
# Build debug APK
cd mobile/android
./gradlew assembleDebug
# APK généré dans: android/app/build/outputs/apk/debug/app-debug.apk

# Build release APK
./gradlew assembleRelease

# Nettoyer le build
./gradlew clean

# Rebuild complet
./gradlew clean assembleDebug --rerun-tasks
```

### Debugging

```bash
# Logs Android (logcat)
adb logcat

# Filtrer les logs React Native
adb logcat *:S ReactNative:V ReactNativeJS:V

# Logs de l'application uniquement
adb logcat | grep -F "`adb shell ps | grep com.mobile | awk '{print $2}'`"

# Reverse port forwarding (pour appareil physique)
adb reverse tcp:8081 tcp:8081
adb reverse tcp:4000 tcp:4000
```

### Appareil et émulateur

```bash
# Lister les appareils connectés
adb devices

# Lister les émulateurs disponibles
emulator -list-avds

# Lancer un émulateur
emulator -avd <nom_emulateur>

# Installer l'APK manuellement
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Désinstaller l'app
adb uninstall com.mobile

# Capturer l'écran
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png
```

### Tests et linting

```bash
# Lancer les tests
npm test

# Lancer le linter
npm run lint

# Fix automatique linting
npm run lint -- --fix
```

---

## Spécificités targetSdk 30

### Permissions Android 11+

Android 11 (API 30) introduit des changements dans les permissions. Si l'application nécessite:

**Accès aux fichiers:**
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
    android:maxSdkVersion="29" />

<application
    android:requestLegacyExternalStorage="true"
    ...>
```

**Gestion des photos (react-native-image-picker):**
Les permissions sont déjà gérées automatiquement par la bibliothèque avec l'autolinking.

### Network Security

Pour permettre le trafic HTTP en clair (backend local):

Le paramètre `android:usesCleartextTraffic="${usesCleartextTraffic}"` est déjà configuré dans AndroidManifest.xml.

Pour debug: `true`
Pour production: `false` (utiliser HTTPS)

---

## Tests sur appareil cible

### Redmi 10A (Android 11 / API 30)

Configuration testée et validée pour:
- Redmi 10A
- Android 11 (API 30)
- MIUI 12.5+

**Pas de configuration spécifique requise** - l'application fonctionne directement avec les paramètres par défaut.

**Note:** Le targetSdkVersion 30 garantit la compatibilité complète avec Android 11 sans nécessiter de permissions supplémentaires pour les APIs Android 12+.

---

## Workflow recommandé

### Première installation

```bash
# 1. Installation initiale
cd mobile
npm install

# 2. Configuration
cp .env.example .env
# Éditer .env avec votre IP

# 3. Démarrer backend
cd ../backend
npm start &

# 4. Démarrer Metro
cd ../mobile
npm start &

# 5. Lancer l'app
npm run android
```

### Développement quotidien

```bash
# 1. Démarrer Metro (terminal 1)
cd mobile
npm start

# 2. Lancer l'app (terminal 2)
npm run android

# 3. Développer et sauvegarder
# Fast Refresh recharge automatiquement

# 4. Forcer un reload complet
# Secouer l'appareil → Reload
# Ou: Ctrl+M (émulateur) → Reload
```

### Après pull/changement de dépendances natives

```bash
cd mobile

# 1. Mettre à jour les dépendances
npm install

# 2. Nettoyer le build
cd android
./gradlew clean
cd ..

# 3. Rebuilder
npm run android
```

---

## Ressources complémentaires

### Documentation officielle
- [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Android Studio](https://developer.android.com/studio/intro)
- [React Native Debugging](https://reactnative.dev/docs/debugging)

### Outils utiles
- **Reactotron**: Debugger React Native (https://github.com/infinitered/reactotron)
- **Flipper**: Debugger natif React Native (https://fbflipper.com/)
- **React DevTools**: `npm install -g react-devtools && react-devtools`

### Support
- Issues GitHub: https://github.com/FloridiosJ/shalom-dhis2/issues
- React Native Community: https://reactnative.dev/community/overview

---

## Changelog du setup

### Version actuelle (Décembre 2024)
- ✅ Projet configuré avec React Native CLI 0.82.0
- ✅ targetSdkVersion fixé à 30 (Android 11)
- ✅ compileSdkVersion 34 (Android 14)
- ✅ Gradle wrapper 9.0.0 inclus dans le repository
- ✅ Autolinking configuré pour tous les modules natifs
- ✅ Package name: com.mobile
- ✅ Metro Bundler configuré
- ✅ Testé sur émulateur API 30 et Redmi 10A

---

**Note finale**: Ce guide est un document vivant. N'hésitez pas à le mettre à jour si vous rencontrez de nouveaux problèmes ou trouvez des solutions améliorées.

Bon développement ! 🚀
