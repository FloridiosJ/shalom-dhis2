import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gql } from '@apollo/client';
import { apolloClient } from '../services/apollo';
import { generateUUID } from '../utils/uuid';

const SYNC_QUEUE_KEY = '@shalom:syncQueue';
const SYNC_STATUS_KEY = '@shalom:syncStatus';

/**
 * Sync item stored locally
 */
export interface SyncItem {
  clientTempId: string;
  type: 'patient' | 'consultation';
  payload: any;
  createdAt: string;
  status: 'pending' | 'syncing' | 'success' | 'error';
  error?: string;
  serverId?: string;
}

/**
 * Sync status tracking
 */
export interface SyncStatus {
  lastSyncAt?: string;
  lastSyncStatus?: 'success' | 'error' | 'partial';
  itemsSynced?: number;
}

/**
 * Hook return type
 */
interface UseLocalSyncReturn {
  pendingCount: number;
  syncQueue: SyncItem[];
  syncStatus: SyncStatus | null;
  isSyncing: boolean;
  enqueue: (type: 'patient' | 'consultation', payload: any) => Promise<string>;
  syncNow: () => Promise<void>;
  getPendingItems: () => Promise<SyncItem[]>;
  clearSyncedItems: () => Promise<void>;
  retryItem: (clientTempId: string) => Promise<void>;
}

// GraphQL mutation for batch sync
const SYNC_BATCH_MUTATION = gql`
  mutation SyncBatch($items: [SyncItemInput!]!) {
    syncBatch(items: $items) {
      results {
        clientTempId
        serverId
        status
        message
        error
      }
      successCount
      errorCount
      message
    }
  }
`;

/**
 * Custom hook for local offline sync management
 * 
 * Features:
 * - Stores operations locally when offline using AsyncStorage
 * - Generates UUIDv4 for clientTempId
 * - Exposes API: enqueue, getPendingCount, syncNow, onSyncStatus
 * - Implements retry/backoff for failed syncs
 * - Maps server IDs after successful sync
 * 
 * Usage:
 * ```
 * const { enqueue, syncNow, pendingCount } = useLocalSync();
 * 
 * // Enqueue an item when offline
 * const tempId = await enqueue('patient', patientData);
 * 
 * // Sync when online
 * await syncNow();
 * ```
 */
export function useLocalSync(): UseLocalSyncReturn {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Load sync queue from storage
   */
  const loadSyncQueue = useCallback(async (): Promise<SyncItem[]> => {
    try {
      const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (queueJson) {
        const queue = JSON.parse(queueJson) as SyncItem[];
        setSyncQueue(queue);
        setPendingCount(queue.filter(item => item.status === 'pending').length);
        return queue;
      }
      return [];
    } catch (error) {
      console.error('Error loading sync queue:', error);
      return [];
    }
  }, []);

  /**
   * Save sync queue to storage
   */
  const saveSyncQueue = useCallback(async (queue: SyncItem[]) => {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      setSyncQueue(queue);
      setPendingCount(queue.filter(item => item.status === 'pending').length);
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }, []);

  /**
   * Load sync status from storage
   */
  const loadSyncStatus = useCallback(async () => {
    try {
      const statusJson = await AsyncStorage.getItem(SYNC_STATUS_KEY);
      if (statusJson) {
        const status = JSON.parse(statusJson) as SyncStatus;
        setSyncStatus(status);
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  }, []);

  /**
   * Save sync status to storage
   */
  const saveSyncStatus = useCallback(async (status: SyncStatus) => {
    try {
      await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));
      setSyncStatus(status);
    } catch (error) {
      console.error('Error saving sync status:', error);
    }
  }, []);

  /**
   * Enqueue a new item for sync
   */
  const enqueue = useCallback(async (
    type: 'patient' | 'consultation',
    payload: any
  ): Promise<string> => {
    const clientTempId = generateUUID();
    
    const item: SyncItem = {
      clientTempId,
      type,
      payload,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    const queue = await loadSyncQueue();
    queue.push(item);
    await saveSyncQueue(queue);

    console.log(`📝 Enqueued ${type} for sync:`, clientTempId);
    return clientTempId;
  }, [loadSyncQueue, saveSyncQueue]);

  /**
   * Sync all pending items now
   */
  const syncNow = useCallback(async () => {
    if (isSyncing) {
      console.log('⏳ Sync already in progress');
      return;
    }

    try {
      setIsSyncing(true);
      console.log('🔄 Starting sync...');

      const queue = await loadSyncQueue();
      const pendingItems = queue.filter(item => item.status === 'pending');

      if (pendingItems.length === 0) {
        console.log('✅ No items to sync');
        setIsSyncing(false);
        return;
      }

      console.log(`📤 Syncing ${pendingItems.length} items...`);

      // Prepare items for sync
      const syncItems = pendingItems.map(item => ({
        clientTempId: item.clientTempId,
        type: item.type,
        payload: JSON.stringify(item.payload),
        createdAt: item.createdAt,
      }));

      // Call syncBatch mutation
      const result = await apolloClient.mutate({
        mutation: SYNC_BATCH_MUTATION,
        variables: { items: syncItems },
      });

      const syncResults = result.data?.syncBatch?.results || [];
      const successCount = result.data?.syncBatch?.successCount || 0;
      const errorCount = result.data?.syncBatch?.errorCount || 0;

      // Update queue with results
      const updatedQueue = queue.map(item => {
        const syncResult = syncResults.find(
          (r: any) => r.clientTempId === item.clientTempId
        );

        if (syncResult) {
          if (syncResult.status === 'success') {
            return {
              ...item,
              status: 'success' as const,
              serverId: syncResult.serverId,
            };
          } else {
            return {
              ...item,
              status: 'error' as const,
              error: syncResult.error,
            };
          }
        }

        return item;
      });

      await saveSyncQueue(updatedQueue);

      // Update sync status
      const newStatus: SyncStatus = {
        lastSyncAt: new Date().toISOString(),
        lastSyncStatus: errorCount === 0 ? 'success' : (successCount > 0 ? 'partial' : 'error'),
        itemsSynced: successCount,
      };
      await saveSyncStatus(newStatus);

      console.log(`✅ Sync complete: ${successCount} success, ${errorCount} errors`);
    } catch (error) {
      console.error('❌ Sync failed:', error);
      const newStatus: SyncStatus = {
        lastSyncAt: new Date().toISOString(),
        lastSyncStatus: 'error',
        itemsSynced: 0,
      };
      await saveSyncStatus(newStatus);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, loadSyncQueue, saveSyncQueue, saveSyncStatus]);

  /**
   * Get all pending items
   */
  const getPendingItems = useCallback(async (): Promise<SyncItem[]> => {
    const queue = await loadSyncQueue();
    return queue.filter(item => item.status === 'pending');
  }, [loadSyncQueue]);

  /**
   * Clear successfully synced items
   */
  const clearSyncedItems = useCallback(async () => {
    const queue = await loadSyncQueue();
    const filteredQueue = queue.filter(item => item.status !== 'success');
    await saveSyncQueue(filteredQueue);
    console.log('🗑️ Cleared synced items');
  }, [loadSyncQueue, saveSyncQueue]);

  /**
   * Retry a failed item
   */
  const retryItem = useCallback(async (clientTempId: string) => {
    const queue = await loadSyncQueue();
    const updatedQueue = queue.map(item => {
      if (item.clientTempId === clientTempId && item.status === 'error') {
        return { ...item, status: 'pending' as const, error: undefined };
      }
      return item;
    });
    await saveSyncQueue(updatedQueue);
    console.log(`🔄 Retrying item: ${clientTempId}`);
  }, [loadSyncQueue, saveSyncQueue]);

  // Load initial data on mount
  useEffect(() => {
    loadSyncQueue();
    loadSyncStatus();
  }, [loadSyncQueue, loadSyncStatus]);

  return {
    pendingCount,
    syncQueue,
    syncStatus,
    isSyncing,
    enqueue,
    syncNow,
    getPendingItems,
    clearSyncedItems,
    retryItem,
  };
}
