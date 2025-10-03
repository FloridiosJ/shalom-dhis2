export const authTypeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Mutation {
    register(email: String!, password: String!, role: String!): User!
    login(email: String!, password: String!): AuthPayload!
  }
`;