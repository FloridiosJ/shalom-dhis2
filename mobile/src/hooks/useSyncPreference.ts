import {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WIFI_ONLY_KEY = 'sync-wifi-only';

/**
 * Custom hook to manage WiFi-only sync preference
 * Persists the setting in AsyncStorage
 * @returns {object} Object containing wifiOnly state and setter function
 */
export const useSyncPreference = () => {
  const [wifiOnly, setWifiOnlyState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load preference from storage on mount
  useEffect(() => {
    loadPreference();
  }, []);

  const loadPreference = async () => {
    try {
      const value = await AsyncStorage.getItem(WIFI_ONLY_KEY);
      if (value !== null) {
        setWifiOnlyState(value === 'true');
      }
    } catch (error) {
      console.error('Error loading WiFi-only preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const setWifiOnly = useCallback(async (value: boolean) => {
    try {
      await AsyncStorage.setItem(WIFI_ONLY_KEY, value.toString());
      setWifiOnlyState(value);
    } catch (error) {
      console.error('Error saving WiFi-only preference:', error);
    }
  }, []);

  return {
    wifiOnly,
    setWifiOnly,
    loading,
  };
};
