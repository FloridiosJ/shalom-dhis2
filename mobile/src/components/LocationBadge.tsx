import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Location {
  lat: number;
  lon: number;
  accuracy?: number;
  timestamp?: string;
}

interface LocationBadgeProps {
  location: Location | null;
  isCapturing?: boolean;
  onPress?: () => void;
  showCoordinates?: boolean;
  compact?: boolean;
}

/**
 * Reusable LocationBadge component for displaying geolocation status
 * 
 * Features:
 * - Shows location capture status
 * - Displays coordinates (optional)
 * - Shows accuracy information
 * - Compact mode for smaller displays
 * - Press handler for recapture
 * 
 * Usage:
 * ```
 * <LocationBadge
 *   location={{ lat: -18.8792, lon: 47.5079, accuracy: 10 }}
 *   showCoordinates={true}
 *   onPress={handleRecapture}
 * />
 * ```
 */
export function LocationBadge({
  location,
  isCapturing = false,
  onPress,
  showCoordinates = false,
  compact = false,
}: LocationBadgeProps) {
  // Format coordinates
  const formatCoordinate = (value: number, decimals: number = 4): string => {
    return value.toFixed(decimals);
  };

  // Format accuracy
  const formatAccuracy = (accuracy?: number): string => {
    if (!accuracy) return 'Précision inconnue';
    if (accuracy < 10) return 'Très précis';
    if (accuracy < 30) return 'Précis';
    if (accuracy < 100) return 'Approximatif';
    return 'Peu précis';
  };

  // Determine icon and color based on state
  const getIconAndColor = (): { icon: string; color: string } => {
    if (isCapturing) {
      return { icon: 'crosshairs-gps', color: '#2196F3' };
    }
    if (location) {
      const accuracy = location.accuracy || 0;
      if (accuracy < 30) {
        return { icon: 'map-marker-check', color: '#4CAF50' };
      }
      return { icon: 'map-marker', color: '#FF9800' };
    }
    return { icon: 'map-marker-off', color: '#9E9E9E' };
  };

  const { icon, color } = getIconAndColor();

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress || isCapturing}
        style={[styles.compactContainer, { borderColor: color }]}>
        <Icon name={icon} size={16} color={color} />
        {location && location.accuracy && (
          <Text style={[styles.compactText, { color }]}>
            ±{Math.round(location.accuracy)}m
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress || isCapturing}
      style={[styles.container, { borderColor: color }]}
      accessible={true}
      accessibilityLabel={
        location
          ? `Géolocalisation capturée, précision ${formatAccuracy(location.accuracy)}`
          : isCapturing
          ? 'Capture de la géolocalisation en cours'
          : 'Géolocalisation non disponible'
      }
      accessibilityHint={onPress ? 'Appuyez pour recapturer' : undefined}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text variant="bodyMedium" style={[styles.statusText, { color }]}>
          {isCapturing
            ? 'Capture en cours...'
            : location
            ? 'Géolocalisation capturée'
            : 'Aucune géolocalisation'}
        </Text>
        {location && (
          <>
            {showCoordinates && (
              <Text variant="bodySmall" style={styles.coordinatesText}>
                {formatCoordinate(location.lat)}°N, {formatCoordinate(location.lon)}°E
              </Text>
            )}
            <Text variant="bodySmall" style={styles.accuracyText}>
              {formatAccuracy(location.accuracy)}
              {location.accuracy && ` (±${Math.round(location.accuracy)}m)`}
            </Text>
          </>
        )}
        {!location && !isCapturing && onPress && (
          <Text variant="bodySmall" style={styles.hintText}>
            Appuyez pour capturer
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    elevation: 1,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontWeight: '500',
  },
  coordinatesText: {
    color: '#757575',
    marginTop: 2,
  },
  accuracyText: {
    color: '#757575',
    marginTop: 2,
  },
  hintText: {
    color: '#9E9E9E',
    marginTop: 4,
    fontStyle: 'italic',
  },
  compactText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
