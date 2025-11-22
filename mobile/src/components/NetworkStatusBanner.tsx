import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNetwork} from '../contexts/NetworkContext';
import {useLocalSync} from '../hooks/useLocalSync';

/**
 * Network status banner component
 * Shows connection status and pending sync items
 * 
 * Features:
 * - Shows offline indicator when disconnected
 * - Shows pending sync count when items are waiting
 * - Auto-hides when online and no pending items
 * - Uses Material Design colors
 */
export const NetworkStatusBanner: React.FC = () => {
  const {isConnected, isInternetReachable} = useNetwork();
  const {pendingCount} = useLocalSync();

  const isOffline = !isConnected || isInternetReachable === false;

  // Don't show banner if online and no pending items
  if (!isOffline && pendingCount === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.banner,
        isOffline ? styles.offlineBanner : styles.pendingBanner,
      ]}
      accessibilityRole="alert"
      accessibilityLive="polite">
      <Icon
        name={isOffline ? 'wifi-off' : 'sync'}
        size={20}
        color="#FFF"
        style={styles.icon}
      />
      <Text variant="bodyMedium" style={styles.text}>
        {isOffline
          ? 'Mode hors ligne'
          : `${pendingCount} élément${pendingCount > 1 ? 's' : ''} en attente de synchronisation`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  offlineBanner: {
    backgroundColor: '#FF9800', // Orange for offline
  },
  pendingBanner: {
    backgroundColor: '#2196F3', // Blue for pending sync
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#FFF',
    flex: 1,
  },
});
