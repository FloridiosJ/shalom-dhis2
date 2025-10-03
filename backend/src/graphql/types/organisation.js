export const organisationTypeDefs = `#graphql
  type Organisation {
    id: ID!
    name: String!
    parentId: ID
    type: String!
    children: [Organisation]
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    organisations: [Organisation]
  }

  extend type Mutation {
    createOrganisation(name: String!, parentId: ID, type: String!): Organisation
    updateOrganisation(id: ID!, name: String, parentId: ID, type: String): Organisation
    deleteOrganisation(id: ID!): Boolean
  }
`;