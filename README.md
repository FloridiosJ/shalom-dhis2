# Shalom DHIS2

Système de gestion de données de santé inspiré de DHIS2, conçu pour la collecte et l'analyse de données médicales dans les dispensaires. Le projet comprend un backend GraphQL, une interface web React et une application mobile React Native.

## 📋 Table des matières

- [Architecture](#architecture)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [API GraphQL](#api-graphql)
- [Développement](#développement)
- [Déploiement](#déploiement)
- [Contribution](#contribution)

## 🏗️ Architecture

Le projet est composé de trois parties principales :

### Backend (Node.js + Express + GraphQL)
- API GraphQL avec Apollo Server
- Base de données PostgreSQL avec Sequelize ORM
- Authentification JWT
- Gestion des utilisateurs, dispensaires, patients et données médicales

### Frontend Web (React + Vite)
- Interface web responsive
- Client Apollo GraphQL
- Gestion d'état avec React Query
- Routage avec React Router

### Application Mobile (React Native)
- Application mobile pour iOS et Android
- Client Apollo GraphQL
- Navigation avec React Navigation
- UI avec React Native Paper

## ✨ Fonctionnalités

### Gestion des utilisateurs
- Authentification sécurisée avec JWT
- Rôles : Admin, Manager, Agent
- Spécialités : Sage-femme, Infirmier(ère)

### Gestion des dispensaires
- Création et gestion des centres de santé
- Association des agents aux dispensaires

### Gestion des patients
- Enregistrement des patients
- Historique médical complet
- Informations démographiques et religieuses

### Collecte de données
- Entrées de données médicales
- Consultations médicales
- Vaccinations
- Activités spirituelles
- Événements

### Rapports et analyses
- Génération de rapports statistiques
- Analyses par période
- Tableaux de bord

## 🛠️ Technologies

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Apollo Server** - Serveur GraphQL
- **Sequelize** - ORM pour PostgreSQL
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **bcrypt** - Hashage de mots de passe

### Frontend Web
- **React 18** - Bibliothèque UI
- **Vite** - Build tool
- **Apollo Client** - Client GraphQL
- **TanStack Query** - Gestion d'état serveur
- **React Router** - Routage

### Mobile
- **React Native 0.82** - Framework mobile
- **Apollo Client** - Client GraphQL
- **React Navigation** - Navigation
- **React Native Paper** - Composants UI
- **React Hook Form** - Gestion de formulaires

### DevOps
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration
- **pgAdmin** - Administration PostgreSQL

## 📦 Prérequis

- **Node.js** >= 20.x
- **npm** ou **yarn**
- **Docker** et **Docker Compose** (pour le déploiement)
- **PostgreSQL** 17 (si exécution locale sans Docker)

Pour le développement mobile :
- **Android Studio** (pour Android)
- **Xcode** (pour iOS, macOS uniquement)
- **Ruby** et **CocoaPods** (pour iOS)

## 🚀 Installation

### Avec Docker (Recommandé)

1. Cloner le repository :
```bash
git clone https://github.com/FloridiosJ/shalom-dhis2.git
cd shalom-dhis2
```

2. Créer le fichier `.env` à la racine :
```bash
DB_USER=postgres
DB_PASS=your_password
DB_NAME=dhis_clone
```

3. Démarrer les services :
```bash
docker-compose up -d
```

Les services seront disponibles sur :
- Backend : http://localhost:4000
- Frontend Web : http://localhost:5173
- pgAdmin : http://localhost:5050

### Installation locale

#### Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` dans le dossier `backend` :
```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=dhis_clone
JWT_SECRET=your_secret_key
```

Démarrer le serveur :
```bash
npm run dev
```

#### Frontend Web

```bash
cd web
npm install
```

Créer un fichier `.env` dans le dossier `web` :
```env
VITE_API_URL=http://localhost:4000/graphql
```

Démarrer le serveur de développement :
```bash
npm run dev
```

#### Application Mobile

```bash
cd mobile
npm install
```

Pour iOS (macOS uniquement) :
```bash
bundle install
cd ios && bundle exec pod install && cd ..
```

Créer un fichier `.env` dans le dossier `mobile` :
```env
API_URL=http://localhost:4000/graphql
```

Démarrer l'application :
```bash
# Android
npm run android

# iOS
npm run ios
```

## ⚙️ Configuration

### Variables d'environnement

#### Backend (.env)
- `PORT` - Port du serveur (défaut: 4000)
- `DB_HOST` - Hôte PostgreSQL
- `DB_PORT` - Port PostgreSQL (défaut: 5432)
- `DB_USER` - Utilisateur PostgreSQL
- `DB_PASS` - Mot de passe PostgreSQL
- `DB_NAME` - Nom de la base de données
- `JWT_SECRET` - Clé secrète pour JWT

#### Frontend Web (.env)
- `VITE_API_URL` - URL de l'API GraphQL

#### Mobile (.env)
- `API_URL` - URL de l'API GraphQL

## 📖 Utilisation

### Accès à l'application

1. **Backend GraphQL Playground** : http://localhost:4000/graphql
2. **Interface Web** : http://localhost:5173
3. **pgAdmin** : http://localhost:5050 (admin@admin.com / admin)

### Endpoints principaux

- `GET /health` - Vérification de l'état du serveur
- `POST /graphql` - Endpoint GraphQL principal

## 📁 Structure du projet

```
shalom-dhis2/
├── backend/                  # Backend Node.js + GraphQL
│   ├── src/
│   │   ├── config/          # Configuration (DB)
│   │   ├── database/        # Migrations et seeders
│   │   ├── graphql/         # Schema et resolvers GraphQL
│   │   ├── middleware/      # Middlewares (auth)
│   │   ├── models/          # Modèles Sequelize
│   │   ├── utils/           # Utilitaires
│   │   └── server.js        # Point d'entrée
│   ├── Dockerfile
│   └── package.json
├── web/                     # Frontend React + Vite
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/           # Pages de l'application
│   │   ├── routes/          # Configuration des routes
│   │   ├── services/        # Services API
│   │   ├── context/         # Contexts React
│   │   └── hooks/           # Hooks personnalisés
│   ├── Dockerfile
│   └── package.json
├── mobile/                  # Application React Native
│   ├── src/
│   │   ├── services/        # Services API
│   │   └── types/           # Types TypeScript
│   ├── App.tsx              # Point d'entrée
│   └── package.json
├── docker-compose.yml       # Configuration Docker Compose
└── README.md               # Documentation

```

## 🔌 API GraphQL

### Types principaux

- **User** - Utilisateurs du système
- **Dispensaire** - Centres de santé
- **Patient** - Patients enregistrés
- **DataEntry** - Entrées de données médicales
- **Consultation** - Consultations médicales
- **Vaccination** - Vaccinations
- **Event** - Événements
- **ActiviteSpirituelle** - Activités spirituelles

### Mutations principales

```graphql
# Authentification
mutation Login($login: String!, $password: String!) {
  login(login: $login, password: $password) {
    token
    user { id nom prenom role }
  }
}

# Créer un patient
mutation CreatePatient($input: PatientInput!) {
  createPatient(input: $input) {
    id nom prenom
  }
}

# Créer une consultation
mutation CreateDataEntry($input: DataEntryInput!) {
  createDataEntry(input: $input) {
    id dateConsultation
  }
}
```

### Queries principales

```graphql
# Lister les patients
query GetPatients($dispensaireId: ID!) {
  patients(dispensaireId: $dispensaireId) {
    id nom prenom dateNaissance
  }
}

# Obtenir les statistiques
query GetReports($dispensaireId: ID!, $startDate: DateTime, $endDate: DateTime) {
  reports(dispensaireId: $dispensaireId, startDate: $startDate, endDate: $endDate) {
    totalPatients
    totalConsultations
  }
}
```

## 👨‍💻 Développement

### Backend

```bash
cd backend
npm run dev        # Mode développement avec nodemon
npm start          # Mode production
```

### Frontend Web

```bash
cd web
npm run dev        # Serveur de développement
npm run build      # Build de production
npm run preview    # Prévisualiser le build
```

### Mobile

```bash
cd mobile
npm start          # Démarrer Metro
npm run android    # Lancer sur Android
npm run ios        # Lancer sur iOS
npm test           # Exécuter les tests
npm run lint       # Linter le code
```

### Base de données

Les migrations et seeders sont exécutés automatiquement au démarrage du backend. Pour réinitialiser la base de données :

```bash
docker-compose down -v
docker-compose up -d
```

## 🐳 Déploiement

### Avec Docker Compose

```bash
# Production
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Supprimer les volumes
docker-compose down -v
```

### Services déployés

- **db** - PostgreSQL 17
- **backend** - API GraphQL (port 4000)
- **web** - Frontend React (port 5173)
- **pgadmin** - Interface d'administration PostgreSQL (port 5050)

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Guidelines

- Suivez les conventions de code existantes
- Ajoutez des tests pour les nouvelles fonctionnalités
- Mettez à jour la documentation si nécessaire
- Assurez-vous que tous les tests passent

## 📄 Licence

Ce projet est développé pour la gestion des données de santé des dispensaires.

## 👥 Auteurs

- **FloridiosJ** - [GitHub](https://github.com/FloridiosJ)

## 🙏 Remerciements

Inspiré par le projet DHIS2 (District Health Information Software 2).
