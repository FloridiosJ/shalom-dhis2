FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./src ./src
COPY ./public ./public

# Build de l'application
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev"]
