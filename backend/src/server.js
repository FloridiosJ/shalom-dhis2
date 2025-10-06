import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { resolvers } from './graphql/resolvers/index.js';
import { initDatabase } from './database/init.js';
import authMiddleware from './middleware/auth.js'; // <-- IMPORT PAR DÉFAUT

async function startServer() {
  try {
    // 1. Initialize database first
    await initDatabase();
    
    // 2. Setup Express
    const app = express();
    
    // 3. Setup GraphQL
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
    
    // 4. Start server
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