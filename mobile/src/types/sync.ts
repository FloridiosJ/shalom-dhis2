/**
 * Sync-related TypeScript types for the synchronization feature
 */

/**
 * Sync status states
 */
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

/**
 * Last sync result information
 */
export interface LastSyncInfo {
  status: 'success' | 'error';
  timestamp: string; // ISO 8601 format
  itemsSynced?: number;
}

/**
 * Sync queue statistics
 */
export interface SyncQueueStats {
  pendingCount: number;
  errorCount: number;
}

/**
 * Individual sync error details
 */
export interface SyncError {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  retryable: boolean;
}

/**
 * Sync progress information
 */
export interface SyncProgress {
  current: number;
  total: number;
}

/**
 * Complete sync state
 */
export interface SyncState {
  status: SyncStatus;
  lastSync: LastSyncInfo | null;
  queueStats: SyncQueueStats;
  errors: SyncError[];
  progress: SyncProgress | null;
  isOffline: boolean;
}
