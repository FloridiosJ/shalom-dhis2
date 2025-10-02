# backend-prompts.md

## Carte : Backend – Initialisation et configuration

**Prompt pour `server.js`**
```text
Créer un projet Node.js + Express minimal :
- Créer un fichier server.js avec Express
- Ajouter middlewares (body-parser, cors, morgan)
- Endpoint GET /health pour vérifier le service
- Charger variables d’environnement depuis .env
- Écouter sur port 4000
```

**Prompt pour `config/db.js`**
```text
Configurer Sequelize pour PostgreSQL :
- Lire variables DB depuis .env (DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME)
- Exporter une instance Sequelize connectée
- Ajouter logs en cas de succès ou d’erreur
```

**Prompt pour `.env.example`**
```text
Créer un fichier .env.example avec :
- PORT=4000
- DB_HOST=localhost
- DB_PORT=5432
- DB_USER=postgres
- DB_PASS=password
- DB_NAME=dhis_clone
- JWT_SECRET=secret_key
```

---

## Carte : Backend – Modèles et base de données

**Prompt pour `models/user.js`**
```text
Créer un modèle Sequelize "user" avec :
- id (UUID, PK)
- email (string, unique, required)
- password (string, required)
- role (enum: admin, user)
- createdAt, updatedAt
```

**Prompt pour `models/organisation.js`**
```text
Créer un modèle Sequelize "organisation" avec :
- id (UUID, PK)
- name (string, required)
- parentId (UUID, FK vers organisation)
- type (enum : SynodaLehibe, SynodamParitany, Fileovana, Fitandremana, Fiangonana)
- createdAt, updatedAt
Relation : une organisation a plusieurs enfants et un parent.
```

**Prompt pour `models/dispensaire.js`**
```text
Créer un modèle Sequelize "dispensaire" avec :
- id (UUID, PK)
- name (string, required)
- organisationId (UUID, FK vers organisation)
- createdAt, updatedAt
Relation : un dispensaire appartient à une organisation.
```

**Prompt pour `models/data_entry.js`**
```text
Créer un modèle Sequelize "data_entry" avec :
- id (UUID, PK)
- dispensaireId (UUID, FK vers dispensaire)
- indicator (string)
- value (integer)
- date (date)
- createdAt, updatedAt
Relation : un data_entry appartient à un dispensaire.
```

---

## Carte : Backend – Authentification et sécurité

**Prompt pour `routes/auth.js`**
```text
Créer routes Express pour authentification :
- POST /auth/register (admin seulement, crée un utilisateur)
- POST /auth/login (retourne JWT)
- POST /auth/logout (invalide le token côté client)
Utiliser bcrypt pour hasher mots de passe.
```

**Prompt pour middleware auth**
```text
Créer un middleware Express qui :
- Vérifie la présence d’un JWT dans Authorization header
- Vérifie la validité du token avec JWT_SECRET
- Ajoute userId et role au req.user
- Retourne 401 si token invalide ou absent
```

**Prompt pour middleware role**
```text
Créer un middleware qui vérifie le rôle de l’utilisateur :
- Autoriser uniquement admin pour certaines routes
- Retourner 403 si rôle insuffisant
```

---

## Carte : Backend – CRUD et API

**Prompt pour `routes/organisations.js`**
```text
Créer routes Express CRUD pour Organisation :
- GET /organisations
- GET /organisations/:id
- POST /organisations
- PUT /organisations/:id
- DELETE /organisations/:id
Validation : name requis, type valide, parentId optionnel.
```

**Prompt pour `routes/dispensaires.js`**
```text
Créer routes Express CRUD pour Dispensaire :
- GET /dispensaires
- GET /dispensaires/:id
- POST /dispensaires
- PUT /dispensaires/:id
- DELETE /dispensaires/:id
Validation : name requis, organisationId valide.
```

**Prompt pour `routes/data_entries.js`**
```text
Créer routes Express CRUD pour Data Entry :
- GET /data_entries
- GET /data_entries/:id
- POST /data_entries
- PUT /data_entries/:id
- DELETE /data_entries/:id
Validation : indicator string requis, value number requis, date valide.
```

**Prompt pour endpoint synchronisation mobile**
```text
Créer endpoint POST /sync pour recevoir plusieurs data_entries :
- Vérifier JWT
- Parcourir le tableau et insérer les entrées en DB
- Retourner succès et liste des entrées créées
```

---

## Carte : Backend – Tests

**Prompt pour Postman/Insomnia**
```text
Créer une collection Postman avec :
- Auth : register/login
- Organisations CRUD
- Dispensaires CRUD
- Data_entries CRUD
- Endpoint /sync
Vérifier que toutes les routes fonctionnent avec JWT.
```

