import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSyncQueue} from '../hooks/useSyncQueue';
import SyncProgressBar from '../components/SyncProgressBar';
import SyncQueue from '../components/SyncQueue';
import SyncErrorList from '../components/SyncErrorList';

/**
 * SyncStatusScreen - Main synchronization screen
 * Displays sync status, queue statistics, progress, and errors
 * Follows mobile best practices for accessibility and UX
 */
export default function SyncScreen() {
  const {
    syncState,
    startSync,
    retryError,
    retryAllErrors,
    isSyncing,
  } = useSyncQueue();

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const renderLastSyncStatus = () => {
    if (!syncState.lastSync) {
      return null;
    }

    const isSuccess = syncState.lastSync.status === 'success';
    const iconName = isSuccess ? 'check-circle' : 'alert-circle';
    const iconColor = isSuccess ? '#4CAF50' : '#F44336';
    const statusText = isSuccess ? 'Dernière synchronisation' : 'Échec de synchronisation';

    return (
      <View
        style={styles.lastSyncContainer}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={`${statusText}, ${formatDate(syncState.lastSync.timestamp)}`}>
        <View style={styles.lastSyncHeader}>
          <Icon name={iconName} size={24} color={iconColor} style={styles.lastSyncIcon} />
          <Text variant="bodyMedium" style={styles.lastSyncTitle}>
            {statusText}
          </Text>
        </View>
        <Text variant="bodySmall" style={styles.lastSyncDate}>
          {formatDate(syncState.lastSync.timestamp)}
        </Text>
      </View>
    );
  };

  const isSyncDisabled = isSyncing || syncState.isOffline || syncState.queueStats.pendingCount === 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        accessible={true}
        accessibilityRole="scrollbar">
        {/* Last Sync Status */}
        {renderLastSyncStatus()}

        {/* Queue Statistics */}
        <SyncQueue stats={syncState.queueStats} />

        {/* Progress Bar (only when syncing) */}
        {syncState.progress && <SyncProgressBar progress={syncState.progress} />}

        {/* Error List */}
        <SyncErrorList
          errors={syncState.errors}
          onRetry={retryError}
          onRetryAll={retryAllErrors}
        />

        {/* Offline Notice */}
        {syncState.isOffline && (
          <View
            style={styles.offlineNotice}
            accessible={true}
            accessibilityRole="alert"
            accessibilityLabel="Mode hors ligne: La synchronisation n'est pas disponible">
            <Icon name="wifi-off" size={20} color="#FF9800" style={styles.offlineIcon} />
            <Text variant="bodyMedium" style={styles.offlineText}>
              Mode hors ligne
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Main Sync Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={startSync}
          disabled={isSyncDisabled}
          loading={isSyncing}
          icon={isSyncing ? undefined : 'sync'}
          style={styles.syncButton}
          labelStyle={styles.syncButtonLabel}
          contentStyle={styles.syncButtonContent}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Synchroniser maintenant"
          accessibilityHint={
            isSyncing
              ? 'Synchronisation en cours'
              : syncState.isOffline
              ? 'Non disponible en mode hors ligne'
              : syncState.queueStats.pendingCount === 0
              ? 'Aucune donnée à synchroniser'
              : 'Lancer la synchronisation des données'
          }
          accessibilityState={{
            disabled: isSyncDisabled,
            busy: isSyncing,
          }}>
          {isSyncing ? 'Synchronisation en cours...' : 'Synchroniser maintenant'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  lastSyncContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  lastSyncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lastSyncIcon: {
    marginRight: 8,
  },
  lastSyncTitle: {
    color: '#212121',
    fontWeight: '600',
  },
  lastSyncDate: {
    color: '#757575',
    marginLeft: 32,
  },
  offlineNotice: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  offlineIcon: {
    marginRight: 12,
  },
  offlineText: {
    color: '#E65100',
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 4,
  },
  syncButton: {
    borderRadius: 12,
    elevation: 0,
  },
  syncButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  syncButtonContent: {
    height: 56, // Accessibility: minimum touch target height
    paddingVertical: 8,
  },
});
