# Shalom DHIS2 Mobile App

Application mobile Expo TypeScript pour le projet Shalom DHIS2.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancement de l'application](#lancement-de-lapplication)
  - [Méthode 1: Avec USB (adb)](#méthode-1-avec-usb-adb)
  - [Méthode 2: Sans USB (QR Code)](#méthode-2-sans-usb-qr-code)
- [Commandes npm](#commandes-npm)
- [Build APK avec EAS](#build-apk-avec-eas)
- [Structure du projet](#structure-du-projet)
- [Technologies utilisées](#technologies-utilisées)
- [Bonnes pratiques](#bonnes-pratiques)
- [Dépannage](#dépannage)

## 🚀 Prérequis

### Environnement de développement

- **Node.js**: Version 18.x ou supérieure
- **npm**: Version 9.x ou supérieure
- **Expo Go**: Application mobile (télécharger sur Google Play Store)
- **Android Debug Bridge (adb)**: Pour connexion USB
- **JDK (Java Development Kit)**: Version 17 ou 11 recommandée pour Android builds
- **Appareil de test**: Xiaomi Redmi 10A, Android 11, MIUI 12.5.16

### Installation des outils

```bash
# Vérifier les versions installées
node --version
npm --version
java -version  # Devrait être JDK 11 ou 17

# Installer Expo CLI globalement (optionnel)
npm install -g expo-cli

# Installer EAS CLI pour les builds
npm install -g eas-cli
```

## 📦 Installation

1. Cloner le repository et naviguer vers le dossier app:

```bash
cd app
```

2. Installer les dépendances:

```bash
npm install
```

3. Vérifier l'installation:

```bash
npm list --depth=0
```

## 🎯 Lancement de l'application

### Méthode 1: Avec USB (adb)

Cette méthode nécessite une connexion USB entre votre ordinateur et votre appareil Android.

#### 1. Préparer l'appareil Android

1. Activer le **Mode développeur**:
   - Aller dans `Paramètres` > `À propos du téléphone`
   - Appuyer 7 fois sur `Version MIUI` ou `Numéro de build`
   - Message "Vous êtes maintenant développeur!" apparaît

2. Activer le **Débogage USB**:
   - Aller dans `Paramètres` > `Paramètres supplémentaires` > `Options pour les développeurs`
   - Activer `Débogage USB`
   - Activer `Installer via USB` (optionnel mais recommandé)

3. Connecter l'appareil via USB et accepter l'autorisation de débogage

#### 2. Vérifier la connexion adb

```bash
# Lister les appareils connectés
adb devices

# Devrait afficher quelque chose comme:
# List of devices attached
# XXXXXXXXXX      device
```

#### 3. Lancer l'application

```bash
# Méthode 1: Avec expo-cli
npm start

# Puis dans le terminal, appuyer sur 'a' pour ouvrir sur Android
# OU
npm run android
```

L'application se lancera automatiquement sur votre appareil connecté en USB.

### Méthode 2: Sans USB (QR Code)

Cette méthode utilise le Wi-Fi et ne nécessite pas de câble USB.

#### Prérequis
- Votre ordinateur et votre téléphone doivent être sur le **même réseau Wi-Fi**
- L'application **Expo Go** doit être installée sur votre téléphone

#### 1. Installer Expo Go

- Télécharger depuis le Google Play Store: [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

#### 2. Lancer le serveur de développement

```bash
npm start
```

Cela ouvrira un navigateur avec Expo Dev Tools et affichera un QR code dans le terminal.

#### 3. Scanner le QR code

1. Ouvrir l'application **Expo Go** sur votre téléphone
2. Appuyer sur **"Scan QR Code"**
3. Scanner le QR code affiché dans le terminal
4. L'application se chargera automatiquement

#### Alternatives pour le QR Code

Si le QR code ne fonctionne pas:

```bash
# Essayer avec tunnel
npm start -- --tunnel

# OU forcer l'utilisation de l'IP LAN
npm start -- --lan
```

## 📜 Commandes npm

### Commandes de développement

```bash
# Démarrer le serveur de développement
npm start

# Démarrer et ouvrir sur Android directement
npm run android

# Démarrer en mode tunnel (si problèmes réseau)
npm start -- --tunnel

# Démarrer en mode LAN (réseau local)
npm start -- --lan

# Démarrer sur le web (navigateur)
npm run web
```

### Commandes utiles

```bash
# Nettoyer le cache d'Expo
npm start -- --clear

# Nettoyer complètement node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install

# Réinitialiser le cache Metro Bundler
npx expo start -c
```

## 🏗️ Build APK avec EAS

EAS (Expo Application Services) permet de créer des builds APK pour Android sans avoir Android Studio installé localement.

### 1. Installer EAS CLI

```bash
npm install -g eas-cli
```

### 2. Se connecter à Expo

```bash
eas login
```

Si vous n'avez pas de compte, créez-en un sur [expo.dev](https://expo.dev).

### 3. Configurer le projet

**Important**: Le projet fonctionne sans configuration EAS pour le développement local. Vous n'avez besoin de configurer EAS que si vous voulez créer des builds APK.

```bash
# 1. Créer un projet sur expo.dev
# Aller sur https://expo.dev et créer un nouveau projet

# 2. Récupérer le project ID
# Le project ID est visible dans les paramètres du projet sur expo.dev

# 3. Ajouter le project ID dans app.json
# Ajouter cette section dans app.json:
{
  "expo": {
    ...
    "extra": {
      "eas": {
        "projectId": "votre-project-id-ici"
      }
    }
  }
}
```

**Note**: Pour le développement local avec `npm start` ou `npm run android`, cette configuration n'est pas nécessaire.

### 4. Créer un build APK

```bash
# Build de preview (APK pour test)
eas build --platform android --profile preview

# Build de production
eas build --platform android --profile production

# Build local (nécessite Android Studio)
eas build --platform android --local
```

### 5. Télécharger et installer l'APK

1. Une fois le build terminé, EAS fournit un lien de téléchargement
2. Télécharger l'APK sur votre appareil Android
3. Activer l'installation depuis des sources inconnues dans les paramètres
4. Installer l'APK

#### Installation de l'APK via adb

```bash
# Télécharger l'APK localement
# Puis installer via adb
adb install chemin/vers/votre-app.apk
```

## 📁 Structure du projet

```
app/
├── assets/                 # Images, icônes, splash screen
├── src/
│   ├── components/        # Composants réutilisables
│   │   └── LoginForm.tsx  # Formulaire de connexion (presentational)
│   ├── context/           # Contexts React
│   │   └── AuthContext.tsx # Gestion de l'état d'authentification
│   ├── navigation/        # Configuration React Navigation
│   │   └── Navigation.tsx # Navigation avec routes Auth/Main
│   ├── screens/           # Écrans de l'application
│   │   ├── LoginScreen.tsx    # Écran de connexion (container)
│   │   ├── HomeScreen.tsx     # Écran d'accueil
│   │   └── DetailsScreen.tsx  # Écran de détails
│   ├── services/          # Services et APIs
│   │   └── authService.ts # Service d'authentification GraphQL
│   └── utils/             # Utilitaires
│       ├── apolloClient.ts    # Configuration Apollo Client
│       └── secureStore.ts     # Abstraction Secure Storage
├── App.tsx                # Point d'entrée principal
├── app.json              # Configuration Expo
├── eas.json              # Configuration EAS Build
├── package.json          # Dépendances et scripts
├── tsconfig.json         # Configuration TypeScript
└── README.md             # Ce fichier
```

## 🔐 Authentification et Login

L'application implémente un système d'authentification complet avec:
- **Container/Presentational pattern** pour une séparation claire des responsabilités
- **AuthContext** pour la gestion centralisée de l'état d'authentification
- **Secure Storage** pour le stockage sécurisé des tokens
- **Apollo Client** avec authentification automatique des requêtes

### Architecture d'authentification

#### 1. Composants principaux

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                             │
│  ┌──────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ApolloProvider│  │ PaperProvider  │  │ AuthProvider   │ │
│  └──────────────┘  └────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Navigation.tsx                         │
│  ┌─────────────────────┐       ┌─────────────────────┐    │
│  │   Auth Stack        │       │    Main Stack       │    │
│  │  - LoginScreen      │  ◄──► │  - HomeScreen       │    │
│  │                     │       │  - DetailsScreen    │    │
│  └─────────────────────┘       └─────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Flux de connexion

1. **Affichage du formulaire** (LoginScreen + LoginForm)
   ```
   User ──► LoginScreen ──► LoginForm
                               │
                               │ (onSubmit)
                               ▼
                         AuthContext.login()
   ```

2. **Authentification** (AuthContext)
   ```
   AuthContext.login()
        │
        ├─► Apollo Mutation (LOGIN_MUTATION)
        │        │
        │        ▼
        │   GraphQL Backend
        │        │
        │        ▼
        ├─► Receive { token, user }
        │
        ├─► Save token (SecureStore)
        ├─► Save user data (SecureStore)
        │
        └─► Update state (token, user)
   ```

3. **Navigation automatique**
   ```
   AuthContext state changes
        │
        ├─► isAuthenticated = true
        │
        └─► Navigation re-renders
                 │
                 └─► Main Stack (Home)
   ```

#### 3. Restauration de session

Au démarrage de l'app:

```typescript
// AuthContext.restoreSession()
1. Lecture du token depuis SecureStore
2. Lecture des données utilisateur depuis SecureStore
3. Validation du token avec query ME_QUERY
4. Si valide → Connexion automatique
5. Si invalide → Clear data + afficher Login
```

#### 4. Déconnexion

```typescript
// AuthContext.logout()
1. Clear SecureStore (token + user data)
2. Clear Apollo Cache
3. Reset state (token = null, user = null)
4. Navigation → LoginScreen
```

### Sécurité

#### 1. Stockage sécurisé

L'application utilise **expo-secure-store** pour stocker les données sensibles:

```typescript
// src/utils/secureStore.ts
- saveAuthToken(token)    // Token JWT chiffré
- getAuthToken()          // Lecture sécurisée
- deleteAuthToken()       // Suppression sécurisée
- saveUserData(user)      // Données utilisateur chiffrées
- clearAuthData()         // Nettoyage complet
```

**Important**:
- ✅ Les tokens sont **toujours** stockés dans SecureStore (chiffré)
- ❌ **Jamais** dans AsyncStorage (non chiffré)
- ❌ **Jamais** en clair dans le code

#### 2. Configuration Apollo Client

Apollo Client est configuré pour ajouter automatiquement le token d'authentification:

```typescript
// src/utils/apolloClient.ts
authLink = setContext(async (_, { headers }) => {
  const token = await getAuthToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});
```

Toutes les requêtes GraphQL incluent automatiquement le header `Authorization`.

#### 3. Variables d'environnement

Configurer l'endpoint GraphQL:

```bash
# .env (créer ce fichier à la racine)
EXPO_PUBLIC_GRAPHQL_ENDPOINT=http://your-backend-url:4000/graphql
```

```typescript
// Utilisation dans apolloClient.ts
const endpoint = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';
```

**Important**: Ne jamais commit le fichier `.env` avec des URLs de production!

### Pattern Container/Presentational

#### LoginScreen (Container)

Le container gère la **logique**:
- État local (loading, error)
- Appels à AuthContext
- Gestion des erreurs
- Navigation

```typescript
// src/screens/LoginScreen.tsx
export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  
  const handleLogin = async (data) => {
    try {
      await login(data);
    } catch (error) {
      // Handle error
    }
  };

  return <LoginForm onSubmit={handleLogin} />;
}
```

#### LoginForm (Presentational)

Le composant présente l'**UI**:
- Formulaire avec react-hook-form
- Validation des champs
- Affichage des erreurs
- Pas de logique métier

```typescript
// src/components/LoginForm.tsx
export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSubmit, 
  isLoading, 
  error 
}) => {
  const { control, handleSubmit } = useForm();
  
  return (
    <View>
      <TextInput ... />
      <Button onPress={handleSubmit(onSubmit)} />
    </View>
  );
};
```

### Validation des formulaires

Le formulaire utilise **react-hook-form** pour la validation:

```typescript
<Controller
  control={control}
  name="login"
  rules={{
    required: 'L\'identifiant est requis',
    minLength: {
      value: 3,
      message: 'Minimum 3 caractères',
    },
  }}
  render={({ field }) => (
    <TextInput
      value={field.value}
      onChangeText={field.onChange}
      error={!!errors.login}
    />
  )}
/>
```

### Gestion des erreurs

Les erreurs sont gérées à plusieurs niveaux:

1. **Validation du formulaire** (champ vide, format incorrect)
2. **Erreurs réseau** (pas de connexion)
3. **Erreurs GraphQL** (identifiants invalides, utilisateur inactif)
4. **Erreurs système** (SecureStore, Apollo)

Chaque type d'erreur affiche un message adapté à l'utilisateur.

### Tests manuels

Pour tester le flux de connexion:

1. **Lancer l'app**:
   ```bash
   npm start
   ```

2. **Tester les cas suivants**:
   - ✅ Connexion avec identifiants valides
   - ✅ Connexion avec identifiants invalides (erreur)
   - ✅ Connexion sans connexion internet (erreur réseau)
   - ✅ Validation des champs (minimum 3 caractères)
   - ✅ Déconnexion depuis HomeScreen
   - ✅ Fermer et rouvrir l'app (session restaurée)

3. **Identifiants de test** (selon votre backend):
   ```
   Login: admin / test / agent1
   Password: (selon configuration backend)
   ```

### Évolutions futures

Fonctionnalités prévues:

1. **Refresh token**
   - Renouvellement automatique du token
   - Gestion de l'expiration

2. **Mot de passe oublié**
   - Reset via email
   - Code de vérification

3. **Connexion biométrique**
   - Empreinte digitale
   - Face ID (iOS)

4. **Multi-rôle**
   - Permissions selon le rôle
   - Routes protégées par rôle

5. **Mode offline**
   - Connexion automatique au retour en ligne
   - Queue de synchronisation

### Dépendances d'authentification

```json
{
  "dependencies": {
    "@apollo/client": "^4.0.9",           // Client GraphQL
    "expo-secure-store": "^15.0.7",       // Stockage sécurisé
    "react-hook-form": "^7.x",            // Gestion formulaires
    "graphql": "^16.12.0"                 // GraphQL
  }
}
```

## 🛠️ Technologies utilisées

### Framework et langage
- **Expo SDK 54**: Framework React Native managé
- **React Native 0.81**: Framework mobile
- **TypeScript 5.9**: Typage statique

### Navigation
- **@react-navigation/native**: Navigation de base
- **@react-navigation/stack**: Navigation en stack

### UI et Composants
- **react-native-paper**: Bibliothèque de composants Material Design
- **expo-status-bar**: Barre d'état

### APIs natives et fonctionnalités
- **expo-location**: Géolocalisation GPS
- **expo-notifications**: Notifications locales et push
- **expo-image-picker**: Sélection d'images/photos
- **expo-secure-store**: Stockage sécurisé de données sensibles

### Data et état
- **@apollo/client**: Client GraphQL
- **@react-native-async-storage/async-storage**: Stockage persistant asynchrone

## ✅ Bonnes pratiques

### Architecture et organisation

1. **Structure des dossiers**:
   - Séparer les écrans, composants, navigation, services, utils
   - Un fichier = un composant/écran
   - Nommer les fichiers en PascalCase pour les composants

2. **TypeScript**:
   - Toujours typer les props des composants
   - Utiliser des interfaces pour les types complexes
   - Éviter `any`, préférer `unknown` si nécessaire

3. **Composants**:
   - Garder les composants petits et réutilisables
   - Extraire la logique dans des hooks personnalisés
   - Utiliser React.memo() pour les composants coûteux

### Configuration et environnement

1. **Variables d'environnement**:
   ```bash
   # Créer un fichier .env à la racine
   API_URL=https://api.example.com
   API_KEY=your-api-key
   ```
   
   ```typescript
   // Utiliser dans le code
   import Constants from 'expo-constants';
   const apiUrl = Constants.expoConfig?.extra?.apiUrl;
   ```

2. **app.json vs app.config.js**:
   - Utiliser `app.json` pour la config statique
   - Utiliser `app.config.js` pour la config dynamique (variables d'env)

### Développement

1. **Hot Reload**:
   - Modifications automatiques rechargées
   - Secouer l'appareil pour ouvrir le menu développeur
   - Activer Fast Refresh dans les paramètres

2. **Debugging**:
   ```bash
   # Logs dans le terminal
   console.log('Debug info:', data);
   
   # React Native Debugger
   # Secouer l'appareil > "Debug JS Remotely"
   ```

3. **Nettoyage des caches**:
   ```bash
   # Cache Expo
   npm start -- --clear
   
   # Cache npm
   npm cache clean --force
   
   # Réinstaller node_modules
   rm -rf node_modules && npm install
   ```

### Performance

1. **Images**:
   - Optimiser les images avant de les inclure
   - Utiliser des formats WebP si possible
   - Dimensionner correctement les images

2. **Listes**:
   - Utiliser `FlatList` au lieu de `ScrollView` pour longues listes
   - Implémenter `keyExtractor` et `getItemLayout`
   - Utiliser `windowSize` pour limiter le rendu

3. **Navigation**:
   - Lazy loading des écrans avec React.lazy()
   - Éviter les re-renders inutiles avec React.memo()
   - Utiliser `useFocusEffect` pour les actions à l'arrivée sur un écran

### Sécurité

1. **Données sensibles**:
   - Utiliser `expo-secure-store` pour tokens, passwords
   - Ne jamais commit les secrets dans le code
   - Utiliser des variables d'environnement

2. **API et requêtes**:
   - Toujours utiliser HTTPS
   - Valider les entrées utilisateur
   - Gérer les erreurs gracieusement

### Versioning

1. **Gestion des versions**:
   ```json
   // app.json
   {
     "expo": {
       "version": "1.0.0",
       "android": {
         "versionCode": 1
       }
     }
   }
   ```

2. **Updates OTA (Over-The-Air)**:
   - Expo permet des mises à jour sans passer par le store
   - Utiliser `expo publish` pour publier des updates
   - Les utilisateurs reçoivent automatiquement les updates

## 🔧 Dépannage

### Problèmes courants

#### 1. "Unable to resolve module"

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm start -- --clear
```

#### 2. Appareil non détecté (adb)

```bash
# Vérifier les drivers USB
adb devices

# Redémarrer le serveur adb
adb kill-server
adb start-server

# Sur MIUI, activer "Installer via USB"
```

#### 3. Connexion Wi-Fi ne fonctionne pas

```bash
# Essayer le mode tunnel
npm start -- --tunnel

# Vérifier que vous êtes sur le même réseau
# Désactiver le pare-feu temporairement
```

#### 4. "Metro bundler crashed"

```bash
# Nettoyer tous les caches
npm start -- --clear
watchman watch-del-all  # Si watchman installé
```

#### 5. Erreurs de build EAS

```bash
# Vérifier la configuration
eas build:configure

# Nettoyer et rebuilder
eas build --platform android --profile preview --clear-cache
```

#### 6. Permission refusée pour la géolocalisation

- Vérifier que les permissions sont dans `app.json`
- Demander les permissions au runtime dans le code
- Vérifier les paramètres de l'appareil

#### 7. Erreur "Failed to download remote update"

Cette erreur se produit si un `projectId` EAS est configuré dans `app.json` mais le projet n'existe pas sur expo.dev.

**Solution**:
- Pour le développement local, retirez la section `extra.eas.projectId` de `app.json`
- Ou configurez un vrai projet EAS sur expo.dev et ajoutez son ID

```json
// Pour développement local, app.json ne doit PAS avoir:
"extra": {
  "eas": {
    "projectId": "..."
  }
}
```

#### 8. Erreur "java.lang.String cannot be cast to java.lang.Boolean"

Cette erreur se produit avec certaines propriétés Expo SDK 54 qui ne sont pas compatibles avec Android 11 ou versions antérieures.

**Solution**:
- Retirer `newArchEnabled`, `edgeToEdgeEnabled`, et `predictiveBackGestureEnabled` de `app.json`
- Ces propriétés sont pour des versions plus récentes d'Android

```json
// Pour Android 11, retirer ces propriétés:
"newArchEnabled": true,  // ❌ Retirer
"edgeToEdgeEnabled": true,  // ❌ Retirer
"predictiveBackGestureEnabled": false  // ❌ Retirer
```

#### 9. Configuration Java/JDK

Pour le développement et les builds Android, Java est nécessaire:

**Versions compatibles**:
- ✅ **JDK 17** (Recommandé) - Compatible avec Expo SDK 54 et Android 11
- ✅ **JDK 11** - Alternative compatible

**Vérifier votre version**:
```bash
java -version
# Exemple de sortie correcte:
# openjdk version "17.0.16" 2025-07-15
```

**Note**: JDK 17 est parfaitement compatible avec l'application et Android 11. Si vous avez des problèmes, vérifiez que la variable d'environnement `JAVA_HOME` est correctement configurée.

### Logs et debugging

```bash
# Voir les logs de l'appareil Android
adb logcat | grep "ReactNative"

# Logs Expo
npm start -- --verbose

# Logs Metro bundler
npm start -- --resetCache
```

## 📱 Test sur Xiaomi Redmi 10A

L'application a été testée sur:
- **Modèle**: Xiaomi Redmi 10A
- **OS**: Android 11
- **Version MIUI**: 12.5.16 (Global Stable)

### Optimisations MIUI

MIUI peut avoir des restrictions supplémentaires:

1. **Permissions**:
   - Aller dans `Paramètres` > `Applications` > `Gérer les applications`
   - Trouver l'app et activer toutes les permissions nécessaires

2. **Autostart**:
   - Activer l'autorisation de démarrage automatique
   - Désactiver l'optimisation de batterie pour l'app

3. **Débogage USB**:
   - Activer aussi "Installer via USB" dans les options développeur

## 🤝 Contribution

Pour contribuer au projet:

1. Créer une nouvelle branche
2. Faire vos modifications
3. Tester sur l'appareil cible
4. Créer une Pull Request

## 📄 Licence

Ce projet fait partie du projet Shalom DHIS2.

## 🆘 Support

Pour toute question ou problème:
- Consulter la [documentation Expo](https://docs.expo.dev/)
- Consulter la [documentation React Navigation](https://reactnavigation.org/)
- Ouvrir une issue sur le repository GitHub
