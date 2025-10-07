import { gql } from 'apollo-server-express';

export const eventTypes = gql`
  # ✅ CORRIGER les valeurs d'enum - supprimer les accents
  enum OutilsEvent {
    presentiel  # ✅ au lieu de "présentiel"
    visio
  }

  enum EventStatus {
    planifie
    en_cours
    termine
    annule
  }

  enum EventSortField {
    date
    type_event
    createdAt
    nombreParticipants
  }

  # Type principal Event
  type Event {
    id: ID!
    date: DateTime!
    type_event: String!
    participant: String!
    outils: OutilsEvent!
    description: String
    lieu: String
    userId: ID!
    dispensaireId: ID
    status: EventStatus!
    nombreParticipants: Int!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Relations
    organisateur: User!
    dispensaire: Dispensaire
    
    # Champs calculés
    fullTitle: String!
    isToday: Boolean!
    isUpcoming: Boolean!
  }

  # Input pour création d'événement
  input CreateEventInput {
    date: DateTime!
    type_event: String!
    participant: String!
    outils: OutilsEvent!
    description: String
    lieu: String
    dispensaireId: ID
    nombreParticipants: Int
  }

  # Input pour modification d'événement
  input UpdateEventInput {
    date: DateTime
    type_event: String
    participant: String
    outils: OutilsEvent
    description: String
    lieu: String
    dispensaireId: ID
    status: EventStatus
    nombreParticipants: Int
    isActive: Boolean
  }

  # Réponse de création/modification d'événement
  type EventResponse {
    event: Event
    success: Boolean!
    message: String!
    errors: [String!]
  }

  # Input pour filtrer les événements
  input EventFilterInput {
    type_event: String
    outils: OutilsEvent
    status: EventStatus
    userId: ID
    dispensaireId: ID
    dateFrom: DateTime
    dateTo: DateTime
    isActive: Boolean
    search: String
  }

  # Input pour tri des événements
  input EventSortInput {
    field: EventSortField!
    direction: SortDirection!
  }

  # Résultat paginé pour les événements
  type EventConnection {
    events: [Event!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  extend type Query {
    # Récupérer un événement par ID
    event(id: ID!): Event

    # Liste des événements avec filtres et pagination
    events(
      filter: EventFilterInput
      sort: EventSortInput
      pagination: PaginationInput
    ): EventConnection!
  }

  extend type Mutation {
    # Créer un événement
    createEvent(input: CreateEventInput!): EventResponse!

    # Modifier un événement
    updateEvent(id: ID!, input: UpdateEventInput!): EventResponse!
  }
`;

export default eventTypes;