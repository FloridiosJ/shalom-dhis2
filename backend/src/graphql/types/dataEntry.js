import { gql } from 'apollo-server-express';

export const dataEntryTypes = gql`
  # Enums
  enum ConsultationStatus {
    en_cours
    termine
    suivi_requis
  }

  # Type principal DataEntry
  type DataEntry {
    id: ID!
    patientId: ID!
    diagnostic: String!
    prescription: String!
    userId: ID!
    dispensaireId: ID!
    dateConsultation: DateTime!
    status: ConsultationStatus!
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    patient: Patient!
    user: User!
    dispensaire: Dispensaire!
    
    # Champs calculés
    summary: String!
  }

  # Input pour création d'entrée de données
  input CreateDataEntryInput {
    patientId: ID!
    diagnostic: String!
    prescription: String!
    dispensaireId: ID!
    dateConsultation: DateTime
    notes: String
  }

  # Input pour modification d'entrée de données
  input UpdateDataEntryInput {
    diagnostic: String
    prescription: String
    dateConsultation: DateTime
    status: ConsultationStatus
    notes: String
    patientId: ID 
    dispensaireId: ID
  }

  # Réponse de création/modification d'entrée de données
  type DataEntryResponse {
    dataEntry: DataEntry
    success: Boolean!
    message: String!
    errors: [String!]
  }

  # Input pour filtrer les entrées de données
  input DataEntryFilterInput {
    patientId: ID
    userId: ID
    dispensaireId: ID
    status: ConsultationStatus
    dateFrom: DateTime
    dateTo: DateTime
    search: String
  }

  # Input pour tri des entrées de données
  input DataEntrySortInput {
    field: DataEntrySortField!
    direction: SortDirection!
  }

  enum DataEntrySortField {
    dateConsultation
    createdAt
    updatedAt
  }

  # Résultat paginé pour les entrées de données
  type DataEntryConnection {
    dataEntries: [DataEntry!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  # Statistiques des consultations
  type ConsultationStats {
    totalConsultations: Int!
    consultationsByStatus: [StatusCount!]!
    consultationsThisMonth: Int!
    consultationsToday: Int!
    patientsSeen: Int!
  }

  type StatusCount {
    status: ConsultationStatus!
    count: Int!
  }

  extend type Query {
    # Récupérer une entrée de données par ID
    dataEntry(id: ID!): DataEntry

    # Liste des entrées de données avec filtres et pagination
    dataEntries(
      filter: DataEntryFilterInput
      sort: DataEntrySortInput
      pagination: PaginationInput
    ): DataEntryConnection!

    # Consultations d'un patient
    patientConsultations(
      patientId: ID!
      limit: Int = 10
    ): [DataEntry!]!

    # Statistiques des consultations
    consultationStats(
      dispensaireId: ID
      userId: ID
    ): ConsultationStats!

    # Consultations récentes
    recentConsultations(
      dispensaireId: ID
      limit: Int = 10
    ): [DataEntry!]!
  }

  extend type Mutation {
    # Créer une entrée de données
    createDataEntry(input: CreateDataEntryInput!): DataEntryResponse!

    # Modifier une entrée de données
    updateDataEntry(id: ID!, input: UpdateDataEntryInput!): DataEntryResponse!

    # Supprimer une entrée de données
    deleteDataEntry(id: ID!): DataEntryResponse!

    # Marquer une consultation comme terminée
    completeConsultation(id: ID!): DataEntryResponse!

    # Marquer une consultation comme nécessitant un suivi
    requireFollowUp(id: ID!, notes: String): DataEntryResponse!
  }

  # Type DateTime custom
  scalar DateTime
`;

export default dataEntryTypes;