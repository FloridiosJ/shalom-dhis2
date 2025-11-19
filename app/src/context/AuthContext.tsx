import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ApolloClient } from '@apollo/client';
import { useMutation, useApolloClient } from '@apollo/client/react';
import { 
  LOGIN_MUTATION, 
  ME_QUERY,
  User, 
  LoginInput, 
  LoginMutationResult,
  MeQueryResult
} from '../services/authService';
import {
  saveAuthToken,
  getAuthToken,
  saveUserData,
  getUserData,
  clearAuthData,
} from '../utils/secureStore';

/**
 * Auth context state interface
 */
interface AuthContextState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

/**
 * Create Auth Context
 */
const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginMutation] = useMutation<LoginMutationResult>(LOGIN_MUTATION);
  const apolloClient = useApolloClient();

  /**
   * Restore session from secure storage on mount
   */
  const restoreSession = async () => {
    try {
      setIsLoading(true);
      const storedToken = await getAuthToken();
      const storedUser = await getUserData();

      if (storedToken && storedUser) {
        // Verify token is still valid by fetching current user
        try {
          const { data } = await apolloClient.query<MeQueryResult>({
            query: ME_QUERY,
            fetchPolicy: 'network-only',
          });

          if (data?.me) {
            setToken(storedToken);
            setUser(data.me);
            // Update stored user data with fresh data
            await saveUserData(data.me);
          } else {
            // Token invalid, clear data
            await clearAuthData();
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login function
   */
  const login = async (input: LoginInput) => {
    try {
      setIsLoading(true);
      const { data } = await loginMutation({
        variables: { input },
      });

      if (data?.login) {
        const { token: newToken, user: newUser } = data.login;
        
        // Save to secure storage
        await saveAuthToken(newToken);
        await saveUserData(newUser);

        // Update state
        setToken(newToken);
        setUser(newUser);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear secure storage
      await clearAuthData();

      // Clear Apollo cache
      await apolloClient.clearStore();

      // Clear state
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Restore session on mount
   */
  useEffect(() => {
    restoreSession();
  }, []);

  const value: AuthContextState = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use Auth context
 */
export const useAuth = (): AuthContextState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
