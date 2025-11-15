import { useState, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';

/**
 * Geolocation data type
 */
export interface Location {
  lat: number;
  lon: number;
  accuracy?: number;
  timestamp?: string;
}

/**
 * Hook state
 */
interface UseGeolocationReturn {
  location: Location | null;
  loading: boolean;
  error: Error | null;
  permissionGranted: boolean;
  requestLocation: () => Promise<Location | null>;
  requestPermission: () => Promise<boolean>;
}

/**
 * Custom hook for geolocation capture with permissions
 * 
 * Features:
 * - Requests location permissions (Android and iOS)
 * - Captures current GPS coordinates
 * - Returns lat, lon, accuracy, and timestamp
 * - Handles permission denials gracefully
 * 
 * Usage:
 * ```
 * const { location, requestLocation, permissionGranted } = useGeolocation();
 * 
 * // Request permission first
 * await requestPermission();
 * 
 * // Then capture location
 * const currentLocation = await requestLocation();
 * ```
 */
export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  /**
   * Request location permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permission de localisation',
            message: 'L\'application a besoin d\'accéder à votre position pour enregistrer la géolocalisation.',
            buttonNeutral: 'Plus tard',
            buttonNegative: 'Refuser',
            buttonPositive: 'Autoriser',
          }
        );
        const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        setPermissionGranted(hasPermission);
        return hasPermission;
      } else {
        // For iOS, permission is requested automatically when calling getCurrentPosition
        setPermissionGranted(true);
        return true;
      }
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setError(err instanceof Error ? err : new Error('Permission request failed'));
      setPermissionGranted(false);
      return false;
    }
  }, []);

  /**
   * Request current location
   */
  const requestLocation = useCallback(async (): Promise<Location | null> => {
    try {
      setLoading(true);
      setError(null);

      // Check/request permission first
      const hasPermission = permissionGranted || await requestPermission();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      // Use native geolocation API (requires @react-native-community/geolocation or similar)
      // For now, we'll use a mock implementation since the package may not be installed
      // TODO: Install and use @react-native-community/geolocation
      
      return new Promise((resolve, reject) => {
        // Mock implementation - replace with actual geolocation API
        // import Geolocation from '@react-native-community/geolocation';
        
        // Geolocation.getCurrentPosition(
        //   (position) => {
        //     const loc: Location = {
        //       lat: position.coords.latitude,
        //       lon: position.coords.longitude,
        //       accuracy: position.coords.accuracy,
        //       timestamp: new Date(position.timestamp).toISOString(),
        //     };
        //     setLocation(loc);
        //     setLoading(false);
        //     resolve(loc);
        //   },
        //   (err) => {
        //     console.error('Error getting location:', err);
        //     setError(new Error(err.message));
        //     setLoading(false);
        //     reject(err);
        //   },
        //   {
        //     enableHighAccuracy: true,
        //     timeout: 15000,
        //     maximumAge: 10000,
        //   }
        // );

        // Mock implementation for now
        console.warn('useGeolocation: Using mock location data. Install @react-native-community/geolocation for real GPS data.');
        const loc: Location = {
          lat: -18.8792, // Antananarivo, Madagascar
          lon: 47.5079,
          accuracy: 10,
          timestamp: new Date().toISOString(),
        };
        setLocation(loc);
        setLoading(false);
        resolve(loc);
      });
    } catch (err) {
      console.error('Error requesting location:', err);
      const errorObj = err instanceof Error ? err : new Error('Location request failed');
      setError(errorObj);
      setLoading(false);
      return null;
    }
  }, [permissionGranted, requestPermission]);

  // Check permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    location,
    loading,
    error,
    permissionGranted,
    requestLocation,
    requestPermission,
  };
}
