import { gql } from 'apollo-server-express';

export const patientTypes = gql`
  # Enum pour religion
  enum Religion {
    Kristianina
    Musulman
    traditionnelle
  }

  # Type principal Patient
  type Patient {
    id: ID!
    nom: String!
    age: Int!
    sexe: String!
    religion: Religion!
    village: String!
    numeroPatient: String!
    dispensaireId: ID!
    userId: ID!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    createdBy: User!
    dispensaire: Dispensaire!
    consultations: [DataEntry!]!
    
    # Champs calculés
    displayName: String!
    categorieAge: String!
    isMineur: Boolean!
  }

  # Input pour création de patient
  input CreatePatientInput {
    nom: String!
    age: Int!
    sexe: String!
    religion: Religion!
    village: String!
    dispensaireId: ID!
  }

  # Input pour modification de patient
  input UpdatePatientInput {
    nom: String
    age: Int
    sexe: String
    religion: Religion
    village: String
    dispensaireId: ID
    isActive: Boolean
  }

  # Réponse de création/modification de patient
  type PatientResponse {
    patient: Patient
    success: Boolean!
    message: String!
    errors: [String!]
    generatedNumero: String
  }

  # Input pour filtrer les patients
  input PatientFilterInput {
    dispensaireId: ID
    religion: Religion
    sexe: String
    village: String
    ageMin: Int
    ageMax: Int
    isActive: Boolean
    search: String
  }

  # Input pour tri des patients
  input PatientSortInput {
    field: PatientSortField!
    direction: SortDirection!
  }

  enum PatientSortField {
    nom
    age
    village
    createdAt
    updatedAt
  }

  enum SortDirection {
    ASC
    DESC
  }

  # Résultat paginé pour les patients
  type PatientConnection {
    patients: [Patient!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  # Statistiques des patients
  type PatientStats {
    totalPatients: Int!
    patientsByReligion: [ReligionCount!]!
    patientsBySexe: [SexeCount!]!
    patientsByAge: [AgeGroupCount!]!
    patientsByVillage: [VillageCount!]!
  }

  type ReligionCount {
    religion: Religion!
    count: Int!
  }

  type SexeCount {
    sexe: String!
    count: Int!
  }

  type AgeGroupCount {
    ageGroup: String!
    count: Int!
  }

  type VillageCount {
    village: String!
    count: Int!
  }

  extend type Query {
    # Récupérer un patient par ID
    patient(id: ID!): Patient

    # Récupérer un patient par numéro
    patientByNumero(numero: String!): Patient

    # Liste des patients avec filtres et pagination
    patients(
      filter: PatientFilterInput
      sort: PatientSortInput
      pagination: PaginationInput
    ): PatientConnection!

    # Recherche de patients
    searchPatients(
      query: String!
      dispensaireId: ID
      limit: Int = 10
    ): [Patient!]!

    # Statistiques des patients
    patientStats(dispensaireId: ID): PatientStats!
  }

  extend type Mutation {
    # Créer un patient
    createPatient(input: CreatePatientInput!): PatientResponse!

    # Modifier un patient
    updatePatient(id: ID!, input: UpdatePatientInput!): PatientResponse!

    # Supprimer un patient (soft delete)
    deletePatient(id: ID!): PatientResponse!

    # Réactiver un patient
    reactivatePatient(id: ID!): PatientResponse!
  }

  # Type DateTime custom
  scalar DateTime

  # Input de pagination
  input PaginationInput {
    page: Int = 1
    limit: Int = 10
  }
`;

export default patientTypes;