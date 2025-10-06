import { gql } from 'apollo-server-express';

export const dispensaireTypes = gql`
  # Enum pour synoda
  enum Synoda {
    SPA
    SPSofia
    SPBM
    SPMel
  }

  # Type principal Dispensaire
  type Dispensaire {
    id: ID!
    name: String!
    fileovana: String!
    synoda: Synoda!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    users: [User!]!
    dataEntries: [DataEntry!]!
    
    # Champs calculés
    fullName: String!
    userCount: Int!
    activeUserCount: Int!
  }

  # Input pour création de dispensaire
  input CreateDispensaireInput {
    name: String!
    fileovana: String!
    synoda: Synoda!
  }

  # Input pour modification de dispensaire
  input UpdateDispensaireInput {
    name: String
    fileovana: String
    synoda: Synoda
    isActive: Boolean
  }

  # Réponse de création/modification de dispensaire
  type DispensaireResponse {
    dispensaire: Dispensaire
    success: Boolean!
    message: String!
    errors: [String!]
  }

  # Input pour filtrer les dispensaires
  input DispensaireFilterInput {
    synoda: Synoda
    isActive: Boolean
    search: String
  }

  # Résultat paginé pour les dispensaires
  type DispensaireConnection {
    dispensaires: [Dispensaire!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  extend type Query {
    # Récupérer un dispensaire par ID
    dispensaire(id: ID!): Dispensaire

    # Liste des dispensaires avec filtres et pagination
    dispensaires(
      filter: DispensaireFilterInput
      pagination: PaginationInput
    ): DispensaireConnection!

    # Dispensaires par synoda
    dispensairesBySynoda(synoda: Synoda!): [Dispensaire!]!
  }

  extend type Mutation {
    # Créer un dispensaire
    createDispensaire(input: CreateDispensaireInput!): DispensaireResponse!

    # Modifier un dispensaire
    updateDispensaire(id: ID!, input: UpdateDispensaireInput!): DispensaireResponse!

    # Supprimer un dispensaire (soft delete)
    deleteDispensaire(id: ID!): DispensaireResponse!

    # Réactiver un dispensaire
    reactivateDispensaire(id: ID!): DispensaireResponse!
  }

  # Type DateTime custom
  scalar DateTime
`;

export default dispensaireTypes;