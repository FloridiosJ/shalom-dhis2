import authResolvers from './auth.js';
import userResolvers from './user.js';
import organisationResolvers from './organisation.js';
import dispensaireResolvers from './dispensaire.js';
import dataEntryResolvers from './dataEntry.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...(organisationResolvers.Query || {}),
    ...(dispensaireResolvers.Query || {}),
    ...(dataEntryResolvers.Query || {})
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...(organisationResolvers.Mutation || {}),
    ...(dispensaireResolvers.Mutation || {}),
    ...(dataEntryResolvers.Mutation || {})
  },
  User: userResolvers.User,
  Organisation: organisationResolvers.Organisation || {},
  Dispensaire: dispensaireResolvers.Dispensaire || {},
  DataEntry: dataEntryResolvers.DataEntry || {}
};