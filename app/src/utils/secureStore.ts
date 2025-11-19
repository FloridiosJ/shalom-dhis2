import * as SecureStore from 'expo-secure-store';

/**
 * Keys used for secure storage
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
} as const;

/**
 * Save a value securely
 */
export const saveSecure = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw error;
  }
};

/**
 * Retrieve a value securely
 */
export const getSecure = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return null;
  }
};

/**
 * Delete a value securely
 */
export const deleteSecure = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error deleting ${key}:`, error);
    throw error;
  }
};

/**
 * Save authentication token
 */
export const saveAuthToken = async (token: string): Promise<void> => {
  await saveSecure(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Get authentication token
 */
export const getAuthToken = async (): Promise<string | null> => {
  return await getSecure(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Delete authentication token
 */
export const deleteAuthToken = async (): Promise<void> => {
  await deleteSecure(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Save user data as JSON string
 */
export const saveUserData = async (userData: any): Promise<void> => {
  await saveSecure(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
};

/**
 * Get user data and parse JSON
 */
export const getUserData = async (): Promise<any | null> => {
  const data = await getSecure(STORAGE_KEYS.USER_DATA);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

/**
 * Delete user data
 */
export const deleteUserData = async (): Promise<void> => {
  await deleteSecure(STORAGE_KEYS.USER_DATA);
};

/**
 * Clear all auth data
 */
export const clearAuthData = async (): Promise<void> => {
  await Promise.all([
    deleteAuthToken(),
    deleteUserData(),
  ]);
};
