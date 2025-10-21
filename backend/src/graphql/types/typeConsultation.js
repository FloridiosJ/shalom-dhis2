import { gql } from 'apollo-server-express';

export const typeConsultationTypeDefs = gql`
  type TypeConsultation {
    code: String!
    label: String!
    description: String
    isActive: Boolean!
    dataEntriesCount: Int
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    typeConsultations(isActive: Boolean): [TypeConsultation!]!
    typeConsultation(code: String!): TypeConsultation
  }

  extend type Mutation {
    updateTypeConsultation(
      code: String!
      input: UpdateTypeConsultationInput!
    ): TypeConsultation!
  }

  input UpdateTypeConsultationInput {
    label: String
    description: String
    isActive: Boolean
  }
`;