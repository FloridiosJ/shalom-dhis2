FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY ./src ./src
COPY ./prisma ./prisma

# Exposer le port 3000
EXPOSE 3000

# Commande pour lancer le backend en dev
CMD ["npm", "run", "start:dev"]
