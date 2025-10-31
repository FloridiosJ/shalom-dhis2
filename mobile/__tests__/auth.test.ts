/**
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  logout,
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
} from '../src/services/auth';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  ApolloClient: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(),
  })),
  InMemoryCache: jest.fn(),
  gql: jest.fn((strings: TemplateStringsArray) => strings[0]),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getToken', () => {
    it('should return token when it exists', async () => {
      const mockToken = 'test-token-123';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);

      const token = await getToken();

      expect(token).toBe(mockToken);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('auth-token');
    });

    it('should return null when token does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const token = await getToken();

      expect(token).toBeNull();
    });

    it('should return null on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error'),
      );

      const token = await getToken();

      expect(token).toBeNull();
    });
  });

  describe('setToken', () => {
    it('should store token successfully', async () => {
      const mockToken = 'test-token-123';
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await setToken(mockToken);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'auth-token',
        mockToken,
      );
    });

    it('should throw error on storage failure', async () => {
      const mockToken = 'test-token-123';
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage error'),
      );

      await expect(setToken(mockToken)).rejects.toThrow();
    });
  });

  describe('removeToken', () => {
    it('should remove token successfully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await removeToken();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth-token');
    });

    it('should throw error on removal failure', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(
        new Error('Storage error'),
      );

      await expect(removeToken()).rejects.toThrow();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-token');

      const result = await isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when token does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear token on logout', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await logout();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth-token');
    });

    it('should throw error on logout failure', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(
        new Error('Storage error'),
      );

      await expect(logout()).rejects.toThrow();
    });
  });
});
