# docker-prompts.md

## Carte : Docker – Backend

**Prompt pour `Dockerfile` backend**
```text
Créer un Dockerfile pour backend Node.js :
- base image : node:18
- WORKDIR /app
- COPY package*.json ./
- RUN npm install
- COPY . .
- EXPOSE 4000
- CMD ["node", "server.js"]
```

**Prompt pour `.dockerignore`**
```text
Ajouter fichiers à ignorer :
- node_modules
- .env
- *.log
```

---

## Carte : Docker – Frontend

**Prompt pour `Dockerfile` frontend**
```text
Créer un Dockerfile pour frontend React (Vite) :
- base image : node:18
- WORKDIR /app
- COPY package*.json ./
- RUN npm install
- COPY . .
- RUN npm run build
- base image nginx:alpine
- COPY --from=build /app/dist /usr/share/nginx/html
- EXPOSE 80
```

---

## Carte : Docker – Mobile (optionnel)

**Prompt pour `Dockerfile` mobile**
```text
Créer un Dockerfile pour Expo CLI :
- base image : node:18
- WORKDIR /app
- COPY package*.json ./
- RUN npm install -g expo-cli
- COPY . .
- EXPOSE 19000 19001 19002
- CMD ["expo", "start", "--tunnel"]
```

---

## Carte : Docker Compose

**Prompt pour `docker-compose.yml`**
```text
Créer un fichier docker-compose.yml avec :
- service backend : build ./backend, ports 4000:4000, depends_on db
- service frontend : build ./frontend, ports 3000:80, depends_on backend
- service mobile : build ./mobile, ports 19000:19000, depends_on backend
- service db : image postgres:15, ports 5432:5432, volumes db_data:/var/lib/postgresql/data
- service pgadmin : image dpage/pgadmin4, ports 5050:80
Volumes : db_data
```

---

## Carte : Docker – Tests et scripts

**Prompt pour script `scripts/dev.sh`**
```text
Créer un script bash :
- docker compose up -d --build
- attendre que db soit prêt
- lancer migrations Sequelize
- afficher message "Backend et frontend sont démarrés"
```

**Prompt pour script `scripts/stop.sh`**
```text
Créer un script bash :
- docker compose down -v
- afficher message "Services arrêtés et volumes supprimés"
```

