import { userTypeDefs } from './user.js';
import { organisationTypeDefs } from './organisation.js';
import { dispensaireTypeDefs } from './dispensaire.js';
import { dataEntryTypeDefs } from './dataEntry.js';

export const typeDefs = `#graphql
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  ${userTypeDefs}
  ${organisationTypeDefs}
  ${dispensaireTypeDefs}
  ${dataEntryTypeDefs}
`;