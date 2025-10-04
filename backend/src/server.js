import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';
import { resolvers } from './graphql/resolvers/index.js';
import { authMiddleware } from './middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

async function startServer() {
  try {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(morgan('dev'));
    app.use(bodyParser.json());

    // Load schema from file with absolute path
    const typeDefs = loadSchemaSync(path.join(__dirname, './graphql/schema.graphql'), {
      loaders: [new GraphQLFileLoader()]
    });

    // Create executable schema
    const schema = addResolversToSchema({
      schema: typeDefs,
      resolvers
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // Apollo Server setup
    const apolloServer = new ApolloServer({
      schema,
      context: authMiddleware,
      introspection: true,
      playground: true,
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return error;
      }
    });

    await apolloServer.start();

    // Apply Apollo GraphQL middleware
    apolloServer.applyMiddleware({ 
      app,
      path: '/graphql',
      cors: true
    });

    const PORT = process.env.PORT || 4000;
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 GraphQL playground available at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);