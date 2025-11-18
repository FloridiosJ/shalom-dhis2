import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getAuthToken } from './secureStore';

/**
 * Get the GraphQL endpoint from environment or use default
 */
const getGraphQLEndpoint = (): string => {
  // You can set this in .env file as EXPO_PUBLIC_GRAPHQL_ENDPOINT
  // For now, using a placeholder that should be configured
  const endpoint = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';
  return endpoint;
};

/**
 * Create HTTP Link
 */
const httpLink = createHttpLink({
  uri: getGraphQLEndpoint(),
});

/**
 * Auth Link - adds authorization header to requests
 */
const authLink = setContext(async (_, { headers }) => {
  const token = await getAuthToken();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

/**
 * Create and configure Apollo Client
 */
export const createApolloClient = () => {
  return new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Add any custom cache policies here
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
};
