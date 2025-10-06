import { gql } from 'apollo-server-express';

export const eventTypes = gql`
  # Enums
  enum OutilsEvent {
    présentiel
    visio
  }

  enum EventStatus {
    planifie
    en_cours
    termine
    annule
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

  enum EventSortField {
    date
    type_event
    createdAt
    nombreParticipants
  }

  # Résultat paginé pour les événements
  type EventConnection {
    events: [Event!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  # Statistiques des événements
  type EventStats {
    totalEvents: Int!
    eventsByType: [TypeEventCount!]!
    eventsByOutils: [OutilsEventCount!]!
    eventsByStatus: [StatusEventCount!]!
    eventsThisMonth: Int!
    eventsToday: Int!
    upcomingEvents: Int!
  }

  type TypeEventCount {
    type_event: String!
    count: Int!
  }

  type OutilsEventCount {
    outils: OutilsEvent!
    count: Int!
  }

  type StatusEventCount {
    status: EventStatus!
    count: Int!
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

    # Événements à venir
    upcomingEvents(
      dispensaireId: ID
      limit: Int = 10
    ): [Event!]!

    # Événements du jour
    todayEvents(dispensaireId: ID): [Event!]!

    # Statistiques des événements
    eventStats(
      dispensaireId: ID
      userId: ID
    ): EventStats!

    # Recherche d'événements
    searchEvents(
      query: String!
      dispensaireId: ID
      limit: Int = 10
    ): [Event!]!
  }

  extend type Mutation {
    # Créer un événement
    createEvent(input: CreateEventInput!): EventResponse!

    # Modifier un événement
    updateEvent(id: ID!, input: UpdateEventInput!): EventResponse!

    # Supprimer un événement (soft delete)
    deleteEvent(id: ID!): EventResponse!

    # Démarrer un événement
    startEvent(id: ID!): EventResponse!

    # Terminer un événement
    completeEvent(id: ID!, nombreParticipants: Int): EventResponse!

    # Annuler un événement
    cancelEvent(id: ID!, raison: String): EventResponse!
  }

  # Type DateTime custom
  scalar DateTime
`;

export default eventTypes;