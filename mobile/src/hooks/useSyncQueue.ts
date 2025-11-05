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
    // Capture current state to avoid stale closures
    let totalItems = 0;
    setSyncState(prev => {
      totalItems = prev.queueStats.pendingCount;
      return {
        ...prev,
        status: 'syncing',
        progress: {current: 0, total: totalItems},
      };
    });

    // Simulate sync progress
    for (let i = 1; i <= totalItems; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSyncState(prev => ({
        ...prev,
        progress: {current: i, total: totalItems},
      }));
    }

    // Complete sync using functional update
    const now = new Date().toISOString();

    setSyncState(prev => {
      const hasErrors = prev.errors.length > 0;
      const newLastSync: LastSyncInfo = {
        status: hasErrors ? 'error' : 'success',
        timestamp: now,
        itemsSynced: totalItems,
      };

      return {
        ...prev,
        status: hasErrors ? 'error' : 'success',
        lastSync: newLastSync,
        queueStats: {
          pendingCount: 0,
          errorCount: hasErrors ? prev.errors.length : 0,
        },
        progress: null,
      };
    });

    // Reset to idle after 2 seconds
    setTimeout(() => {
      setSyncState(prev => ({
        ...prev,
        status: 'idle',
      }));
    }, 2000);
  }, []);

  /**
   * Retry a specific error
   */
  const retryError = useCallback(async (errorId: string) => {
    // Use functional update to avoid dependency on syncState
    setSyncState(prev => {
      // Find the error
      const errorToRetry = prev.errors.find(e => e.id === errorId);
      if (!errorToRetry) {
        return prev;
      }

      // Remove error from list (simulate successful retry)
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
  }, []);

  /**
   * Retry all errors
   */
  const retryAllErrors = useCallback(async () => {
    // Get error IDs from current state
    let errorIds: string[] = [];
    setSyncState(prev => {
      errorIds = prev.errors.map(e => e.id);
      return prev;
    });

    // Retry each error sequentially
    for (const errorId of errorIds) {
      await retryError(errorId);
    }
  }, [retryError]);

  return {
    syncState,
    startSync,
    retryError,
    retryAllErrors,
    isSyncing: syncState.status === 'syncing',
    hasErrors: syncState.errors.length > 0,
  };
}
