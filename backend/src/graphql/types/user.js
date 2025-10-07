import { gql } from 'apollo-server-express';

export const userTypes = gql`
  # Enums
  enum UserRole {
    admin
    manager
    agent
  }

  enum AgentSpecialite {
    sage_femme
    infirmier
    infirmiere
  }

  # Type principal User
  type User {
    id: ID!
    nom: String!
    prenom: String!
    email: String # ✅ Ajouter le champ email
    login: String!
    role: UserRole!
    specialite: AgentSpecialite
    dispensaireId: ID
    dispensaire: Dispensaire
    isActive: Boolean!
    lastLoginAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Champ calculé
    fullName: String!
  }

  # Input pour création d'utilisateur
  input CreateUserInput {
    nom: String!
    prenom: String!
    email: String # ✅ Ajouter le champ email
    login: String
    password: String
    role: UserRole!
    specialite: AgentSpecialite
    dispensaireId: ID
  }

  # Input pour modification d'utilisateur
  input UpdateUserInput {
    nom: String
    prenom: String
    email: String # ✅ Ajouter le champ email
    login: String
    password: String
    role: UserRole
    specialite: AgentSpecialite
    dispensaireId: ID
    isActive: Boolean
  }

  # Réponse de création/modification d'utilisateur
  type UserResponse {
    user: User
    success: Boolean!
    message: String!
    errors: [String!]
    generatedLogin: String
    generatedPassword: String
  }

  # Input pour filtrer les utilisateurs
  input UserFilterInput {
    role: UserRole
    dispensaireId: ID
    isActive: Boolean
    specialite: AgentSpecialite
    search: String
  }

  # Input pour pagination
  input PaginationInput {
    page: Int = 1
    limit: Int = 10
  }

  # Résultat paginé pour les utilisateurs
  type UserConnection {
    users: [User!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  extend type Query {
    # Récupérer un utilisateur par ID
    user(id: ID!): User

    # Liste des utilisateurs avec filtres et pagination
    users(
      filter: UserFilterInput
      pagination: PaginationInput
    ): UserConnection!
  }

  extend type Mutation {
    # Créer un utilisateur
    createUser(input: CreateUserInput!): UserResponse!

    # Modifier un utilisateur
    updateUser(id: ID!, input: UpdateUserInput!): UserResponse!

    # Supprimer un utilisateur (soft delete)
    deleteUser(id: ID!): UserResponse!

    # Réactiver un utilisateur
    reactivateUser(id: ID!): UserResponse!

    # Changer le mot de passe d'un utilisateur
    changeUserPassword(
      id: ID!
      newPassword: String
      generateNew: Boolean = false
    ): UserResponse!
  }

  # Type DateTime custom
  scalar DateTime
`;

export default userTypes;