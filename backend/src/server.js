import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/db.js';
import { resolvers } from './graphql/resolvers/index.js';
import { authenticateToken } from './middleware/auth.js';
import { runSeeders } from './database/seeders/index.js';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Fonction pour démarrer le serveur
async function startServer() {
  try {
    // Test de connexion à la base de données
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    // Synchroniser les modèles avec la base de données
    console.log('🔄 Synchronizing database models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized successfully.');

    // Exécuter les seeders
    console.log('🌱 Running seeders...');
    await runSeeders();
    console.log('✅ Seeders executed successfully.');

    // Charger le schéma GraphQL depuis le fichier
    console.log('📋 Loading GraphQL schema...');
    const typeDefs = readFileSync(
      join(__dirname, 'graphql', 'schema.graphql'),
      'utf-8'
    );
    console.log('✅ GraphQL schema loaded successfully.');

    // Créer le serveur Apollo
    console.log('🚀 Starting Apollo Server...');
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async ({ req }) => {
        try {
          const token = req.headers.authorization?.replace('Bearer ', '') || '';
          const user = token ? await authenticateToken(token) : null;
          return { user };
        } catch (error) {
          console.error('Context creation error:', error);
          return { user: null };
        }
      },
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
          message: error.message,
          locations: error.locations,
          path: error.path,
          extensions: {
            code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
            ...error.extensions
          }
        };
      },
      introspection: true,
      playground: true
    });

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(50));
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`🚀 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
      console.log(`🏥 GraphQL Playground: http://localhost:${PORT}${server.graphqlPath}`);
      console.log('='.repeat(50));
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();