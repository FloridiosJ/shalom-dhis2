# mobile-prompts.md

## Carte : Mobile – Initialisation

**Prompt pour `package.json` et initialisation Expo**
```text
Créer une application React Native avec Expo :
- Installer React Navigation, Axios, AsyncStorage
- Créer une structure de base :
  - src/
    - screens/
    - components/
    - services/
    - context/
    - App.js
```

---

## Carte : Mobile – Authentification

**Prompt pour `services/auth.js`**
```text
Créer un service Axios mobile pour :
- login(email, password) → POST /auth/login
- logout() → POST /auth/logout
Sauvegarder le token JWT dans AsyncStorage.
```

**Prompt pour `context/AuthContext.js`**
```text
Créer un AuthContext React Native :
- stocker user et token
- login(email, password)
- logout()
- persister dans AsyncStorage
- protéger les routes avec NavigationContainer
```

**Prompt pour `screens/LoginScreen.js`**
```text
Créer un écran de login :
- inputs email, password
- bouton Se connecter
- en cas de succès → naviguer vers Dashboard
```

---

## Carte : Mobile – Synchronisation offline

**Prompt pour `services/data_entries.js`**
```text
Créer un service pour CRUD data_entries en offline :
- sauvegarder temporairement dans AsyncStorage si pas de réseau
- synchroniser avec backend via /sync dès que connexion rétablie
```

**Prompt pour `hooks/useSync.js`**
```text
Créer un hook React Native :
- détecter la connexion (NetInfo)
- si reconnecté → envoyer les données offline vers backend
- vider le cache après succès
```

---

## Carte : Mobile – Gestion des données

**Prompt pour `screens/DataEntryList.js`**
```text
Créer un écran listant les data_entries :
- afficher indicator, value, date
- bouton Ajouter
```

**Prompt pour `screens/DataEntryForm.js`**
```text
Créer un formulaire pour data_entry :
- inputs indicator, value, date
- select dispensaire
- bouton Enregistrer
- si offline → stocker localement
```

**Prompt pour `components/DispensaireSelector.js`**
```text
Créer un composant select pour choisir un dispensaire lié à l’utilisateur.
```

---

## Carte : Mobile – Dashboard

**Prompt pour `screens/DashboardScreen.js`**
```text
Créer un écran Dashboard mobile :
- afficher nombre de data_entries synchronisées
- afficher nombre en attente de synchro
- graphique basique avec Victory Native
```

---

## Carte : Mobile – Navigation

**Prompt pour `App.js`**
```text
Configurer navigation avec React Navigation :
- AuthStack : Login
- AppStack : Dashboard, DataEntryList, DataEntryForm
- ProtectedRoute basé sur AuthContext
```

