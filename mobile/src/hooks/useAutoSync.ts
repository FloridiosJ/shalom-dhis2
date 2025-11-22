import {useEffect, useCallback, useRef} from 'react';
import {useNetwork} from '../contexts/NetworkContext';
import {useLocalSync} from './useLocalSync';
import {AppState, AppStateStatus} from 'react-native';

/**
 * Hook for automatic synchronization on network reconnection
 * 
 * Features:
 * - Monitors network state changes
 * - Automatically triggers sync when connection is restored
 * - Handles app foreground/background transitions
 * - Implements exponential backoff for failed syncs
 * 
 * Usage:
 * ```tsx
 * function App() {
 *   useAutoSync();
 *   return <YourApp />;
 * }
 * ```
 */
export function useAutoSync() {
  const {isConnected, isInternetReachable} = useNetwork();
  const {syncNow, pendingCount, isSyncing} = useLocalSync();
  
  const previousConnectionState = useRef<boolean>(false);
  const retryCount = useRef<number>(0);
  const maxRetries = 3;
  const appState = useRef<AppStateStatus>(AppState.currentState || 'active');

  // Handle network reconnection
  useEffect(() => {
    const isOnline = isConnected && isInternetReachable !== false;

    // Detect transition from offline to online
    if (isOnline && !previousConnectionState.current && pendingCount > 0) {
      console.log('🌐 Network reconnected, triggering auto-sync...');
      handleAutoSync();
    }

    previousConnectionState.current = isOnline;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isInternetReachable, pendingCount]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        // App comes to foreground
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          const isOnline = isConnected && isInternetReachable !== false;
          
          if (isOnline && pendingCount > 0) {
            console.log('📱 App foregrounded with pending items, syncing...');
            handleAutoSync();
          }
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isInternetReachable, pendingCount]);

  /**
   * Handle automatic sync with exponential backoff retry logic
   */
  const handleAutoSync = useCallback(async () => {
    if (isSyncing) {
      console.log('⏳ Sync already in progress, skipping...');
      return;
    }

    try {
      await syncNow();
      retryCount.current = 0; // Reset retry count on success
      console.log('✅ Auto-sync completed successfully');
    } catch (error) {
      console.error('❌ Auto-sync failed:', error);
      
      // Implement exponential backoff for retries
      if (retryCount.current < maxRetries) {
        retryCount.current += 1;
        const delay = Math.pow(2, retryCount.current) * 1000; // 2s, 4s, 8s
        
        console.log(
          `🔄 Retrying sync in ${delay / 1000}s (attempt ${retryCount.current}/${maxRetries})`
        );
        
        setTimeout(() => {
          handleAutoSync();
        }, delay);
      } else {
        console.error('❌ Max retry attempts reached, sync failed');
        retryCount.current = 0; // Reset for next reconnection
      }
    }
  }, [syncNow, isSyncing]);

  return {
    isAutoSyncEnabled: true,
  };
}
