import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, ActivityIndicator, IconButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SyncIndicatorProps {
  pendingCount: number;
  isSyncing: boolean;
  lastSyncAt?: string;
  lastSyncStatus?: 'success' | 'error' | 'partial';
  onSyncPress?: () => void;
  compact?: boolean;
}

/**
 * Reusable SyncIndicator component for displaying sync status
 * 
 * Features:
 * - Shows pending items count
 * - Displays sync status (idle, syncing, success, error)
 * - Shows last sync timestamp
 * - Compact mode for smaller displays
 * - Sync button
 * 
 * Usage:
 * ```
 * <SyncIndicator
 *   pendingCount={5}
 *   isSyncing={false}
 *   lastSyncAt="2025-01-15T10:30:00Z"
 *   lastSyncStatus="success"
 *   onSyncPress={handleSync}
 * />
 * ```
 */
export function SyncIndicator({
  pendingCount,
  isSyncing,
  lastSyncAt,
  lastSyncStatus,
  onSyncPress,
  compact = false,
}: SyncIndicatorProps) {
  // Format last sync timestamp
  const formatLastSync = (timestamp?: string): string => {
    if (!timestamp) return 'Jamais synchronisé';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  // Get status icon and color
  const getStatusIcon = (): { name: string; color: string } => {
    if (isSyncing) {
      return { name: 'sync', color: '#2196F3' };
    }
    
    switch (lastSyncStatus) {
      case 'success':
        return { name: 'check-circle', color: '#4CAF50' };
      case 'error':
        return { name: 'alert-circle', color: '#F44336' };
      case 'partial':
        return { name: 'alert', color: '#FF9800' };
      default:
        return { name: 'cloud-off-outline', color: '#9E9E9E' };
    }
  };

  const statusIcon = getStatusIcon();

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {isSyncing ? (
          <ActivityIndicator size="small" color="#2196F3" />
        ) : (
          <Icon name={statusIcon.name} size={20} color={statusIcon.color} />
        )}
        {pendingCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingCount}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={styles.statusInfo}>
          {isSyncing ? (
            <ActivityIndicator size="small" color="#2196F3" style={styles.icon} />
          ) : (
            <Icon name={statusIcon.name} size={24} color={statusIcon.color} style={styles.icon} />
          )}
          <View style={styles.textContainer}>
            <Text variant="bodyMedium" style={styles.statusText}>
              {isSyncing ? 'Synchronisation en cours...' : 
               pendingCount > 0 ? `${pendingCount} élément(s) en attente` :
               'Tout est synchronisé'}
            </Text>
            <Text variant="bodySmall" style={styles.lastSyncText}>
              {formatLastSync(lastSyncAt)}
            </Text>
          </View>
        </View>
        {onSyncPress && pendingCount > 0 && !isSyncing && (
          <IconButton
            icon="sync"
            size={20}
            onPress={onSyncPress}
            style={styles.syncButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    elevation: 1,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    color: '#212121',
    fontWeight: '500',
  },
  lastSyncText: {
    color: '#757575',
    marginTop: 2,
  },
  syncButton: {
    margin: 0,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
