# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- Dependencies ----
FROM base AS deps
RUN npm install --legacy-peer-deps

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx expo prebuild  # génère les fichiers natifs si besoin
RUN npm run build:web   # build pour web via Expo (Vite-like)

# ---- Production ----
FROM nginx:alpine AS prod
COPY --from=build /app/web-build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
