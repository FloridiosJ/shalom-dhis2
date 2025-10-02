# frontend-prompts.md

## Carte : Frontend – Initialisation du projet

**Prompt pour `package.json` et initialisation React**
```text
Créer un projet React avec Vite :
- Installer React, React Router DOM, Axios, TailwindCSS
- Configurer TailwindCSS avec postcss.config.js et tailwind.config.js
- Ajouter alias `@` pointant vers src/
```

**Prompt pour structure de base**
```text
Créer la structure suivante :
- src/
  - components/
  - pages/
  - services/
  - hooks/
  - context/
  - App.jsx
  - main.jsx
```

---

## Carte : Frontend – Authentification

**Prompt pour `services/auth.js`**
```text
Créer un service Axios pour :
- login(email, password) → POST /auth/login
- register(user) → POST /auth/register
- logout() → POST /auth/logout
Sauvegarder le JWT dans localStorage et l’envoyer dans Authorization header.
```

**Prompt pour `context/AuthContext.jsx`**
```text
Créer un contexte React pour gérer l’auth :
- stocker user et token
- fournir login, logout
- persister user/token dans localStorage
- protéger les routes privées
```

**Prompt pour `pages/Login.jsx`**
```text
Créer une page Login avec formulaire :
- email, password
- bouton "Se connecter"
- en cas de succès → rediriger vers /dashboard
- afficher erreurs en cas d’échec
```

---

## Carte : Frontend – Gestion des organisations

**Prompt pour `services/organisations.js`**
```text
Créer un service Axios pour :
- getAll()
- getById(id)
- create(data)
- update(id, data)
- remove(id)
```

**Prompt pour `pages/Organisations.jsx`**
```text
Créer une page Organisations :
- liste des organisations (nom, type)
- bouton Ajouter organisation
- bouton Modifier, Supprimer
- utiliser un tableau responsive
```

**Prompt pour `components/OrganisationForm.jsx`**
```text
Créer un formulaire réutilisable pour Organisation :
- input name
- select type
- select parentId optionnel
- bouton Enregistrer
```

---

## Carte : Frontend – Gestion des dispensaires

**Prompt pour `services/dispensaires.js`**
```text
Créer un service Axios CRUD pour dispensaires.
```

**Prompt pour `pages/Dispensaires.jsx`**
```text
Créer une page CRUD des dispensaires :
- tableau des dispensaires avec organisation liée
- bouton Ajouter, Modifier, Supprimer
```

**Prompt pour `components/DispensaireForm.jsx`**
```text
Créer un formulaire pour Dispensaire :
- input name
- select organisationId
- bouton Enregistrer
```

---

## Carte : Frontend – Gestion des données (Data Entries)

**Prompt pour `services/data_entries.js`**
```text
Créer un service Axios CRUD pour data_entries.
```

**Prompt pour `pages/DataEntries.jsx`**
```text
Créer une page DataEntries :
- tableau listant indicator, value, date
- bouton Ajouter/Modifier/Supprimer
- filtres par date et organisation
```

**Prompt pour `components/DataEntryForm.jsx`**
```text
Créer formulaire pour data_entry :
- input indicator
- input value (number)
- input date (date)
- select dispensaireId
```

---

## Carte : Frontend – Dashboard et visualisations

**Prompt pour `pages/Dashboard.jsx`**
```text
Créer une page Dashboard :
- affichage de stats (nombre d’orgas, dispensaires, data_entries)
- graphiques (Recharts) :
  - courbe d’évolution des data_entries
  - répartition par organisation
```

**Prompt pour `components/Navbar.jsx`**
```text
Créer une barre de navigation avec :
- lien vers Dashboard, Organisations, Dispensaires, DataEntries
- bouton Logout
```

**Prompt pour `components/ProtectedRoute.jsx`**
```text
Créer un composant qui :
- vérifie si user est connecté
- sinon redirige vers /login
```

---

## Carte : Frontend – Tests

**Prompt pour tests Cypress**
```text
Écrire tests e2e avec Cypress :
- login → dashboard
- CRUD organisations
- CRUD dispensaires
- CRUD data_entries
```

