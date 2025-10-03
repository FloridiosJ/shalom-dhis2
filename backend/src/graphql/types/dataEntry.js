export const dataEntryTypeDefs = `#graphql
  type DataEntry {
    id: ID!
    dispensaireId: ID!
    indicator: String!
    value: Int!
    date: String!
    createdAt: String
    updatedAt: String
  }

  input DataEntryInput {
    dispensaireId: ID!
    indicator: String!
    value: Int!
    date: String!
  }

  extend type Query {
    dataEntries: [DataEntry]
  }

  extend type Mutation {
    createDataEntry(dispensaireId: ID!, indicator: String!, value: Int!, date: String!): DataEntry
    updateDataEntry(id: ID!, indicator: String, value: Int, date: String): DataEntry
    deleteDataEntry(id: ID!): Boolean
    syncDataEntries(entries: [DataEntryInput!]!): [DataEntry]
  }
`;