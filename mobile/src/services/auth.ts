import AsyncStorage from '@react-native-async-storage/async-storage';
import {gql, ApolloClient, InMemoryCache} from '@apollo/client';
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
    // Create a temporary Apollo client without auth for login
    const tempClient = new ApolloClient({
      uri: GRAPHQL_ENDPOINT,
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
  } catch (error) {
    console.error('Login error:', error);
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
