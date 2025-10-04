# frontend_prompts.md

## Carte : Frontend – Initialisation du projet

### Prompt pour `package.json` et initialisation React
Créer un projet React avec **Vite** :
- Installer :  
  - react  
  - react-dom  
  - react-router-dom  
  - axios  
  - @tanstack/react-query  
  - tailwindcss  
  - postcss  
  - autoprefixer  
- Configurer **TailwindCSS** avec `postcss.config.js` et `tailwind.config.js`.
- Ajouter un alias `@` pointant vers `src/` dans `vite.config.js`.

### Prompt pour structure de base
Créer la structure suivante :
src/
components/
pages/
services/
hooks/
context/
App.jsx
main.jsx


---

## Carte : Frontend – Authentification

### Prompt pour `services/auth.js`
Créer un service Axios pour :
- `login(email, password)` → POST `/auth/login`
- `register(user)` → POST `/auth/register`
- `logout()` → POST `/auth/logout`
- Configurer **un Axios interceptor** :  
  → Ajoute automatiquement `Authorization: Bearer <token>` si `localStorage` contient un token.

### Prompt pour `context/AuthContext.jsx`
Créer un contexte React pour gérer l’authentification :
- stocker `user` et `token`
- fournir `login` et `logout`
- persister `user/token` dans `localStorage`
- ajouter un état `isLoading`
- créer un hook `useAuth()` pour accéder facilement au contexte
- protéger les routes privées avec `ProtectedRoute`

### Prompt pour `pages/Login.jsx`
Créer une page Login avec formulaire :
- Champs : `email`, `password`
- Bouton **Se connecter**
- En cas de succès → rediriger vers `/dashboard`
- Afficher erreurs en cas d’échec
- Ajouter un loader pendant la requête

---

## Carte : Frontend – Gestion des organisations

### Prompt pour `services/organisations.js`
Créer un service Axios CRUD :
- `getAll()`
- `getById(id)`
- `create(data)`
- `update(id, data)`
- `remove(id)`

### Prompt pour `pages/Organisations.jsx`
Créer une page Organisations :
- Afficher une liste des organisations (nom, type)
- Boutons Ajouter / Modifier / Supprimer
- Utiliser un tableau responsive
- Utiliser **React Query** (`useQuery`, `useMutation`) pour gérer les données

### Prompt pour `components/OrganisationForm.jsx`
Créer un formulaire réutilisable pour Organisation :
- Input `name`
- Select `type`
- Select `parentId` (optionnel)
- Bouton **Enregistrer**

---

## Carte : Frontend – Gestion des dispensaires

### Prompt pour `services/dispensaires.js`
Créer un service Axios CRUD pour les dispensaires.

### Prompt pour `pages/Dispensaires.jsx`
Créer une page CRUD des dispensaires :
- Tableau listant les dispensaires avec organisation liée
- Boutons Ajouter / Modifier / Supprimer
- Utiliser React Query pour la gestion des données

### Prompt pour `components/DispensaireForm.jsx`
Créer un formulaire pour Dispensaire :
- Input `name`
- Select `organisationId`
- Bouton **Enregistrer**

---

## Carte : Frontend – Gestion des données (Data Entries)

### Prompt pour `services/data_entries.js`
Créer un service Axios CRUD pour les `data_entries`.

### Prompt pour `pages/DataEntries.jsx`
Créer une page DataEntries :
- Tableau listant `indicator`, `value`, `date`
- Boutons Ajouter / Modifier / Supprimer
- Filtres par date et organisation
- Utiliser React Query pour la gestion des données

### Prompt pour `components/DataEntryForm.jsx`
Créer un formulaire pour DataEntry :
- Input `indicator`
- Input `value` (number)
- Input `date` (date)
- Select `dispensaireId`

---

## Carte : Frontend – Dashboard et visualisations

### Prompt pour `pages/Dashboard.jsx`
Créer une page Dashboard :
- Afficher des stats globales :
  - nombre d’organisations
  - nombre de dispensaires
  - nombre de data_entries
- Ajouter graphiques (avec **Recharts**) :
  - Courbe d’évolution des `data_entries`
  - Répartition par organisation
- Ajouter une section "5 dernières entrées"

### Prompt pour `components/Navbar.jsx`
Créer une barre de navigation avec :
- Liens vers Dashboard, Organisations, Dispensaires, DataEntries
- Bouton Logout

### Prompt pour `components/ProtectedRoute.jsx`
Créer un composant qui :
- Vérifie si l’utilisateur est connecté
- Sinon → redirige vers `/login`

---

## Carte : Frontend – Tests

### Prompt pour tests Cypress
Écrire des tests e2e avec Cypress :
- Login → accès au dashboard
- CRUD organisations
- CRUD dispensaires
- CRUD data_entries
- Cas particulier :  
  → Token supprimé ou expiré → l’utilisateur est redirigé automatiquement vers `/login`.

---

## ⚡ Notes pour Copilot
- Toujours utiliser **React Query** pour les appels API (évite de gérer manuellement les états de chargement/erreurs).  
- Utiliser **Axios interceptor** pour injecter automatiquement le token.  
- Prévoir un `Skeleton Loader` pour le dashboard et les pages CRUD.  
- Préférer l’utilisation de bibliothèques UI comme **daisyUI** ou **shadcn/ui** pour accélérer le développement.  
