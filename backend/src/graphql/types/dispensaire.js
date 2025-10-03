export const dispensaireTypeDefs = `#graphql
  type Dispensaire {
    id: ID!
    name: String!
    organisationId: ID!
    organisation: Organisation
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    dispensaires: [Dispensaire]
  }

  extend type Mutation {
    createDispensaire(name: String!, organisationId: ID!): Dispensaire
    updateDispensaire(id: ID!, name: String, organisationId: ID): Dispensaire
    deleteDispensaire(id: ID!): Boolean
  }
`;