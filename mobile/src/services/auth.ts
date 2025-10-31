import AsyncStorage from '@react-native-async-storage/async-storage';
import {gql, ApolloClient, InMemoryCache, createHttpLink} from '@apollo/client';
import {GRAPHQL_ENDPOINT} from '@env';
import type {AuthPayload} from '../types';

const TOKEN_KEY = 'auth-token';

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        nom
        prenom
        email
        login
        role
      }
    }
  }
`;

/**
 * Authenticate user with username and password
 * @param username Username or email
 * @param password User password
 * @returns Authentication payload with token and user info
 */
export const login = async (
  username: string,
  password: string,
): Promise<AuthPayload> => {
  try {
    // Validate GRAPHQL_ENDPOINT is configured
    if (!GRAPHQL_ENDPOINT) {
      throw new Error(
        'GRAPHQL_ENDPOINT is not configured. Please create a .env file with GRAPHQL_ENDPOINT set.',
      );
    }

    // Create a temporary Apollo client without auth for login
    const httpLink = createHttpLink({
      uri: GRAPHQL_ENDPOINT,
    });
    
    const tempClient = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
    });

    const {data} = await tempClient.mutate<{login: AuthPayload}>({
      mutation: LOGIN_MUTATION,
      variables: {
        input: {
          login: username,
          password,
        },
      },
    });

    if (!data?.login) {
      throw new Error('Invalid response from server');
    }

    // Store token securely
    await setToken(data.login.token);

    return data.login;
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('GraphQL Endpoint:', GRAPHQL_ENDPOINT);
    
    // Enhance error message for network failures
    if (error.message?.includes('Network request failed')) {
      throw new Error(
        `Network request failed. Please ensure:\n1. Backend server is running on ${GRAPHQL_ENDPOINT}\n2. You can reach the server from your device\n3. The endpoint is correctly configured in .env file`,
      );
    }
    
    throw error;
  }
};

/**
 * Logout user and clear stored token
 */
export const logout = async (): Promise<void> => {
  try {
    await removeToken();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Get stored authentication token
 * @returns Token string or null if not found
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Store authentication token
 * @param token JWT token to store
 */
export const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting token:', error);
    throw error;
  }
};

/**
 * Remove stored authentication token
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns true if token exists
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return token !== null;
};
