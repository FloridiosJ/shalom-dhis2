# Shalom DHIS2 — Backend &amp; Frontend (Monorepo)

Projet: shalom-dhis2  
Repository: https://github.com/FloridiosJ/shalom-dhis2

Description
-----------
Application de gestion des dispensaires, patients et consultations avec API GraphQL.  
Contient :
- Backend Node.js / Apollo Server / Sequelize (PostgreSQL)
- Frontend React (Vite) consommant l'API GraphQL

Fonctionnalités principales
---------------------------
- Authentification (JWT)
- Gestion des utilisateurs / dispensaires / patients
- Enregistrement des consultations (DataEntry) avec catégories (hiérarchie)
- Statistiques et rapports (GraphQL resolvers pour analytics)
- Vaccinations, événements et activités spirituelles
- Seeders pour populater la base (scripts inclus)

Arborescence importante
-----------------------
- backend/src
  - server.js                 — point d'entrée du serveur
  - config/db.js              — configuration Sequelize
  - graphql/
    - schema.graphql          — schéma GraphQL
    - resolvers/              — resolvers organisés (dataEntry, patient, reports, ...)
- frontend/ (ou client)
  - src/                      — application React (Vite)
  - src/services/*            — services axios / GraphQL utilisés par le front
- database/seeders/           — seeders utilisés au démarrage

Prérequis
---------
- Node.js &gt;= 18
- PostgreSQL (ou autre DB configurée dans config/db.js)
- yarn ou npm

Variables d'environnement
-------------------------
Créez un fichier `.env` (backend) et `.env` (frontend) selon besoin.

Exemples (backend .env)
- DATABASE_URL=postgres://user:password@localhost:5432/shalom
- PORT=4000
- JWT_SECRET=une_chaine_secrete
- NODE_ENV=development

Exemples (frontend .env)
- VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
- VITE_API_URL=http://localhost:4000

Installation et démarrage (backend)
-----------------------------------
1. Installer les dépendances
   - cd backend (ou à la racine si mono-repo)
   - npm install

2. Configurer `.env` (voir section variables)

3. Lancer le serveur en développement
   - npm run dev
   - (Le serveur démarre et exécute `sequelize.sync({ alter: true })` + seeders si présents)

4. Endpoints utiles
   - GraphQL : http://localhost:4000/graphql
   - Health check : http://localhost:4000/health
   - GraphQL Playground : disponible si `introspection: true` (actif en dev)

Notes backend
-------------
- Fichier du schéma GraphQL : `backend/src/graphql/schema.graphql`
- Resolvers principaux : `backend/src/graphql/resolvers/*.js`
  - `reports.js` contient la logique d'analytics (consultationsEvolution, consultationStats, etc.)
- La couche DB utilise Sequelize. Si vous souhaitez migrer (migrations), vous pouvez adapter `config/db.js` et ajouter `sequelize-cli`.
- Le serveur exécute les seeders à chaque démarrage (voir startServer dans server.js). Modifiez si nécessaire.

Installation et démarrage (frontend)
------------------------------------
1. cd client (ou frontend)
2. npm install
3. Configurer `.env` (VITE_GRAPHQL_ENDPOINT)
4. Démarrer
   - npm run dev
5. Ouvrir l'app (par défaut Vite affiche l'URL locale, ex: http://localhost:5173)

Intégration frontend/backend
----------------------------
- Le frontend utilise `VITE_GRAPHQL_ENDPOINT` (import.meta.env) et envoie les requêtes GraphQL via axios ou Apollo selon les services.
- Les services frontend disponibles : `src/services/reports.js`, `src/services/dispensaires.js`, `src/services/dataEntries.js`, etc.

Scripts utiles
--------------
- backend
  - npm run dev        — démarre le serveur en mode dev
  - npm start          — démarre le serveur (production)
- frontend
  - npm run dev
  - npm run build
  - npm run preview

Exécuter des mutations / seed data via GraphQL
----------------------------------------------
- Vous pouvez utiliser le GraphQL Playground (http://localhost:4000/graphql) ou un client (Insomnia / Postman / Apollo Studio).
- Exemples fournis dans le repo (ex : mutations pour créer patients / consultations en masse).
- Si besoin, j'ai généré des scripts GraphQL pour créer 15 patients et 100 consultations (exemples dans les conversations précédentes) — collez-les dans Playground et exécutez (prévoir le header Authorization si l'API exige l'authentification).

Dépannage courant
-----------------
- Erreur SQL « function date_format(...) does not exist » : cela survient si du code SQL/MySQL (DATE_FORMAT) est utilisé sur Postgres. La solution est d'utiliser `to_char` (Postgres) ou d'adapter selon `sequelize.getDialect()`. (Des corrections ont déjà été apportées au resolver `consultationsEvolution` pour Postgres.)
- Erreur GraphQL "Cannot return null for non-nullable field Query.reports." : vérifier que le resolver `reports` est présent et qu'il retourne toujours un objet GlobalReports. (Un resolver `reports` adapté a été ajouté côté backend.)
- Vérifier les variables d'environnement et l'URL GraphQL côté frontend (Vite) : `VITE_GRAPHQL_ENDPOINT`.

Contribuer
----------
- Fork &amp; PR
- Respectez la structure du code et les conventions (ES modules / import/export).
- Tests : ajouter des tests unitaires si possible pour les resolvers critiques (reports, dataEntry).

Ressources / fichiers importants
--------------------------------
- server.js — point d'entrée et logique d'initialisation (DB sync + seeders)
  - Chemin : `backend/src/server.js` ou `src/server.js` selon arborescence
- schema.graphql — GraphQL schema
  - Chemin : `backend/src/graphql/schema.graphql`
- resolvers
  - `backend/src/graphql/resolvers/*.js` (dataEntry.js, dispensaire.js, reports.js, ...)

Contact
-------
Si tu veux que je:
- mette à jour le README dans le repo et crée une PR,
- ou adapte le README pour l'ajout d'instructions Docker / Kubernetes,
- ou génère des scripts d'import automatique (Node script ou mutation batch),

dis‑moi ce que tu préfères (je peux préparer le fichier README.md et l'ouvrir en PR automatiquement).

Licence
-------
(Ajoute ici la licence du projet, ex : MIT — si tu veux que je la mette, indique laquelle.)
