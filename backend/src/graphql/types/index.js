import { userTypeDefs } from './user.js';
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
  ${dispensaireTypeDefs}
  ${dataEntryTypeDefs}
`;