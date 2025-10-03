export const userTypeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    role: String!
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    users: [User]
    me: User
  }

  extend type Mutation {
    register(email: String!, password: String!, role: String): User
    login(email: String!, password: String!): String
  }
`;