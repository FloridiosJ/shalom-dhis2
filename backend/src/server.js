import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { resolvers } from './graphql/resolvers/index.js';
import { initDatabase } from './database/init.js';
import authMiddleware, { getUser } from './middleware/auth.js';

// ✅ IMPORT des types au lieu de readFileSync
import { userTypes } from './graphql/types/user.js';
import { dispensaireTypes } from './graphql/types/dispensaire.js';
import { patientTypes } from './graphql/types/patient.js';
import { dataEntryTypes } from './graphql/types/dataEntry.js';
import { eventTypes } from './graphql/types/event.js';
import { gql } from 'apollo-server-express';
import { typeConsultationTypeDefs } from './graphql/types/typeConsultation.js';

// ✅ Types de base
const baseTypes = gql`
  scalar DateTime

  enum SortDirection {
    ASC
    DESC
  }

  input PaginationInput {
    page: Int = 1
    limit: Int = 10
  }

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  # Type pour l'authentification
  type AuthPayload {
    token: String!
    user: User!
  }

  input LoginInput {
    login: String!
    password: String!
  }

  extend type Mutation {
    login(input: LoginInput!): AuthPayload!
    logout: Boolean
  }
`;

// ✅ Combiner tous les types
const typeDefs = [
  baseTypes,
  userTypes,
  dispensaireTypes,
  patientTypes,
  dataEntryTypes,
  eventTypes,
  typeConsultationTypeDefs
];

async function startServer() {
  try {
    // 1. Initialize database first
    await initDatabase();
    
    // 2. Setup Express
    const app = express();
    
    // 3. Setup GraphQL
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async ({ req }) => {
        // Extraire l'utilisateur du token JWT
        const user = await getUser(req);
        
        return {
          user,
          // Ajouter des dataloaders ici si nécessaire
          dataloaders: {
            // userLoader: new DataLoader(...),
            // dispensaireLoader: new DataLoader(...),
          }
        };
      },
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