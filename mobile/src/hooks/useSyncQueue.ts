import {useState, useCallback, useEffect} from 'react';
import {SyncState, LastSyncInfo} from '../types/sync';
import {useLocalSync} from './useLocalSync';
import {useNetwork} from '../contexts/NetworkContext';

/**
 * Custom hook for managing sync queue state and operations
 * Integrates with useLocalSync for real data and useNetwork for connectivity
 */
export function useSyncQueue() {
  const {isConnected, isInternetReachable} = useNetwork();
  const {
    pendingCount: realPendingCount,
    syncQueue,
    syncStatus,
    isSyncing: realIsSyncing,
    syncNow: realSyncNow,
    retryItem: realRetryItem,
  } = useLocalSync();

  // Derive sync state from useLocalSync and network status
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'idle',
    lastSync: null,
    queueStats: {
      pendingCount: 0,
      errorCount: 0,
    },
    errors: [],
    progress: null,
    isOffline: !isConnected || isInternetReachable === false,
  });

  // Update sync state based on useLocalSync data
  useEffect(() => {
    const errorItems = syncQueue.filter(item => item.status === 'error');
    const errors = errorItems.map(item => ({
      id: item.clientTempId,
      title: `Échec d'envoi ${item.type === 'patient' ? 'du patient' : 'de la consultation'}`,
      description: item.error || 'Erreur de synchronisation',
      timestamp: item.createdAt,
      retryable: true,
    }));

    const lastSync: LastSyncInfo | null = syncStatus?.lastSyncAt
      ? {
          status: syncStatus.lastSyncStatus === 'success' ? 'success' : 'error',
          timestamp: syncStatus.lastSyncAt,
          itemsSynced: syncStatus.itemsSynced,
        }
      : null;

    setSyncState(prev => ({
      ...prev,
      status: realIsSyncing ? 'syncing' : prev.status,
      lastSync,
      queueStats: {
        pendingCount: realPendingCount,
        errorCount: errorItems.length,
      },
      errors,
      isOffline: !isConnected || isInternetReachable === false,
    }));
  }, [
    syncQueue,
    syncStatus,
    realPendingCount,
    realIsSyncing,
    isConnected,
    isInternetReachable,
  ]);

  /**
   * Start synchronization process
   */
  const startSync = useCallback(async () => {
    // Use real sync from useLocalSync
    try {
      setSyncState(prev => ({
        ...prev,
        status: 'syncing',
        progress: {current: 0, total: realPendingCount},
      }));

      await realSyncNow();

      setSyncState(prev => ({
        ...prev,
        status: prev.errors.length > 0 ? 'error' : 'success',
        progress: null,
      }));

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSyncState(prev => ({
          ...prev,
          status: 'idle',
        }));
      }, 2000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncState(prev => ({
        ...prev,
        status: 'error',
        progress: null,
      }));
    }
  }, [realSyncNow, realPendingCount]);

  /**
   * Retry a specific error
   */
  const retryError = useCallback(
    async (errorId: string) => {
      await realRetryItem(errorId);
    },
    [realRetryItem]
  );

  /**
   * Retry all errors
   */
  const retryAllErrors = useCallback(async () => {
    const errorIds = syncState.errors.map(e => e.id);

    for (const errorId of errorIds) {
      await retryError(errorId);
    }
  }, [retryError, syncState.errors]);

  return {
    syncState,
    startSync,
    retryError,
    retryAllErrors,
    isSyncing: syncState.status === 'syncing' || realIsSyncing,
    hasErrors: syncState.errors.length > 0,
  };
}
