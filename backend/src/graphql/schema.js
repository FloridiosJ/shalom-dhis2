import { authTypeDefs } from './types/auth.js';
import { authResolvers } from './resolvers/auth.js';

// Définition du schéma de base
const baseTypeDefs = `#graphql
  # Type vide requis pour Query et Mutation
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

// Combinaison de tous les types
export const typeDefs = `#graphql
  ${baseTypeDefs}
  ${authTypeDefs}
  # Ajoutez ici d'autres typeDefs (organisation, dispensaire, etc.)
`;

// Combinaison de tous les resolvers
export const resolvers = {
  Query: {
    _empty: () => null,
    // Ajoutez ici d'autres queries
  },
  Mutation: {
    _empty: () => null,
    ...authResolvers.Mutation,
    // Ajoutez ici d'autres mutations
  }
};