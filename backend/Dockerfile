# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- Development ----
FROM base AS development
RUN npm install --legacy-peer-deps
COPY . .
CMD ["npm", "run", "start:dev"]

# ---- Build ----
FROM base AS build
RUN npm install --legacy-peer-deps
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---- Production ----
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]