FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./src ./src

EXPOSE 19000

CMD ["npx", "expo", "start", "--tunnel"]
