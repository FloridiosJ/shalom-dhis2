# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies with better error handling and retry logic
COPY package*.json ./

# Set npm config for better stability
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm install --legacy-peer-deps --prefer-offline --no-audit

# Bundle app source
COPY . .

# Expose API port
EXPOSE 4000

# Start the server
CMD ["node", "src/server.js"]