import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { resolvers } from './graphql/resolvers/index.js';
import authMiddleware from './middleware/auth.js';

async function startServer() {
  try {
    const app = express();
    
    // Lire le schéma unique
    const typeDefs = readFileSync('./src/graphql/schema.graphql', 'utf-8');
    
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: authMiddleware,
      introspection: true,
      playground: true
    });
    
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });
    
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();