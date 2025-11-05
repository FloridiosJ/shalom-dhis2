import {useState, useCallback, useEffect} from 'react';
import {SyncState, LastSyncInfo} from '../types/sync';

/**
 * Custom hook for managing sync queue state and operations
 * Currently uses mock data - ready to be connected to real sync service
 */
export function useSyncQueue() {
  // Initialize with mock data
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'idle',
    lastSync: {
      status: 'success',
      timestamp: '2023-12-08T14:35:00Z',
      itemsSynced: 3,
    },
    queueStats: {
      pendingCount: 5,
      errorCount: 2,
    },
    errors: [
      {
        id: 'error-1',
        title: 'Échec d\'envoi du formulaire Z',
        description: 'Erreur réseau',
        timestamp: new Date().toISOString(),
        retryable: true,
      },
      {
        id: 'error-2',
        title: 'Fichier patient invalide',
        description: 'Données corrompues',
        timestamp: new Date().toISOString(),
        retryable: true,
      },
    ],
    progress: null,
    isOffline: false,
  });

  // Monitor network status
  useEffect(() => {
    // TODO: Implement actual network monitoring
    // For now, we'll keep isOffline as false
  }, []);

  /**
   * Start synchronization process
   */
  const startSync = useCallback(async () => {
    setSyncState(prev => ({
      ...prev,
      status: 'syncing',
      progress: {current: 0, total: prev.queueStats.pendingCount},
    }));

    // Simulate sync progress
    const totalItems = syncState.queueStats.pendingCount;
    for (let i = 1; i <= totalItems; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSyncState(prev => ({
        ...prev,
        progress: {current: i, total: totalItems},
      }));
    }

    // Complete sync
    const now = new Date().toISOString();
    const hasErrors = syncState.errors.length > 0;

    const newLastSync: LastSyncInfo = {
      status: hasErrors ? 'error' : 'success',
      timestamp: now,
      itemsSynced: totalItems,
    };

    setSyncState(prev => ({
      ...prev,
      status: hasErrors ? 'error' : 'success',
      lastSync: newLastSync,
      queueStats: {
        pendingCount: 0,
        errorCount: hasErrors ? prev.errors.length : 0,
      },
      progress: null,
    }));

    // Reset to idle after 2 seconds
    setTimeout(() => {
      setSyncState(prev => ({
        ...prev,
        status: 'idle',
      }));
    }, 2000);
  }, [syncState.queueStats.pendingCount, syncState.errors.length]);

  /**
   * Retry a specific error
   */
  const retryError = useCallback(async (errorId: string) => {
    // Find the error
    const errorToRetry = syncState.errors.find(e => e.id === errorId);
    if (!errorToRetry) {
      return;
    }

    // Remove error from list (simulate successful retry)
    setSyncState(prev => {
      const newErrors = prev.errors.filter(e => e.id !== errorId);
      return {
        ...prev,
        errors: newErrors,
        queueStats: {
          ...prev.queueStats,
          errorCount: newErrors.length,
        },
      };
    });

    // TODO: Implement actual retry logic with backend
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, [syncState.errors]);

  /**
   * Retry all errors
   */
  const retryAllErrors = useCallback(async () => {
    const errorIds = syncState.errors.map(e => e.id);
    for (const errorId of errorIds) {
      await retryError(errorId);
    }
  }, [syncState.errors, retryError]);

  return {
    syncState,
    startSync,
    retryError,
    retryAllErrors,
    isSyncing: syncState.status === 'syncing',
    hasErrors: syncState.errors.length > 0,
  };
}
