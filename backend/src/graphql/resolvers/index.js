import authResolvers from './auth.js';
import userResolvers from './user.js';
import dispensaireResolvers from './dispensaire.js';
import dataEntryResolvers from './dataEntry.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...(dispensaireResolvers.Query || {}),
    ...(dataEntryResolvers.Query || {})
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...(dispensaireResolvers.Mutation || {}),
    ...(dataEntryResolvers.Mutation || {})
  },
  User: userResolvers.User,
  Dispensaire: dispensaireResolvers.Dispensaire || {},
  DataEntry: dataEntryResolvers.DataEntry || {}
};