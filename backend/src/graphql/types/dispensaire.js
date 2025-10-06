export const dispensaireTypeDefs = `#graphql
  type Dispensaire {
    id: ID!
    name: String!
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    dispensaires: [Dispensaire]
  }

  extend type Mutation {
    createDispensaire(name: String!): Dispensaire
    updateDispensaire(id: ID!, name: String): Dispensaire
    deleteDispensaire(id: ID!): Boolean
  }
`;