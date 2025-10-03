import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { resolvers } from './graphql/resolvers/index.js';
import { authMiddleware } from './middleware/auth.js';

// Load environment variables
dotenv.config();

// Load schema from file
const typeDefs = loadSchemaSync('./src/graphql/schema.graphql', {
  loaders: [new GraphQLFileLoader()]
});

// JWT Authentication middleware
const authenticateUser = async (req) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      return user;
    } catch (error) {
      console.error('JWT verification failed:', error.message);
    }
  }
  return null;
};

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(morgan('dev'));
  app.use(bodyParser.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Apollo Server setup
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
    introspection: true,
    playground: true
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
}

startServer().catch(console.error);