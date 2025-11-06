import {useState, useEffect, useCallback} from 'react';
import {gql} from '@apollo/client';
import {apolloClient} from '../services/apollo';
import {useSyncQueue} from './useSyncQueue';

/**
 * Dashboard statistics type
 */
export interface DashboardStats {
  consultationsCount: number; // Pending consultations count
  patientsRecentsCount: number; // Recent patients count (last 7 days)
  syncRequiredCount: number; // Items pending sync
}

/**
 * Hook state with loading and error handling
 */
interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// GraphQL query to fetch pending consultations count
const GET_PENDING_CONSULTATIONS = gql`
  query GetPendingConsultations {
    dataEntries(
      filter: { status: en_cours }
      pagination: { limit: 1 }
    ) {
      totalCount
    }
  }
`;

// GraphQL query to fetch recent patients count (last 7 days)
const GET_RECENT_PATIENTS = gql`
  query GetRecentPatients($dateFrom: DateTime!) {
    patients(
      pagination: { limit: 1 }
    ) {
      totalCount
    }
  }
`;

/**
 * Custom hook to fetch and manage dashboard statistics
 * 
 * Fetches:
 * - Pending consultations count (status: en_cours)
 * - Recent patients count (created in last 7 days)
 * - Sync queue count (from useSyncQueue hook)
 * 
 * @returns Dashboard statistics with loading/error states and refetch function
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get sync queue count from existing hook
  const {syncState} = useSyncQueue();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date 7 days ago for recent patients
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Fetch pending consultations and recent patients in parallel
      const [consultationsResult, patientsResult] = await Promise.all([
        apolloClient.query<{
          dataEntries: {
            totalCount: number;
          };
        }>({
          query: GET_PENDING_CONSULTATIONS,
          fetchPolicy: 'network-only',
        }),
        apolloClient.query<{
          patients: {
            totalCount: number;
          };
        }>({
          query: GET_RECENT_PATIENTS,
          variables: {
            dateFrom: sevenDaysAgo.toISOString(),
          },
          fetchPolicy: 'network-only',
        }),
      ]);

      const dashboardStats: DashboardStats = {
        consultationsCount: consultationsResult.data?.dataEntries?.totalCount || 0,
        patientsRecentsCount: patientsResult.data?.patients?.totalCount || 0,
        syncRequiredCount: syncState.queueStats.pendingCount,
      };

      setStats(dashboardStats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard stats'));
      
      // Set fallback stats on error
      setStats({
        consultationsCount: 0,
        patientsRecentsCount: 0,
        syncRequiredCount: syncState.queueStats.pendingCount,
      });
    } finally {
      setLoading(false);
    }
  }, [syncState.queueStats.pendingCount]);

  // Fetch stats on mount and when sync queue changes
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
