import {useState, useEffect, useCallback} from 'react';
import {gql} from '@apollo/client';
import {apolloClient} from '../services/apollo';
import {useSyncQueue} from './useSyncQueue';

/**
 * Dashboard statistics type
 */
export interface DashboardStats {
  consultationsCount: number; // Pending consultations count
  patientsRecentsCount: number; // New patients count (this month)
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

// GraphQL query to fetch dashboard statistics
const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboard {
      newPatientsThisMonth
    }
    dataEntries(
      filter: { status: en_cours }
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
 * - New patients count (this month from Dashboard query)
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

      // Fetch dashboard statistics
      const result = await apolloClient.query<{
        dashboard: {
          newPatientsThisMonth: number;
        };
        dataEntries: {
          totalCount: number;
        };
      }>({
        query: GET_DASHBOARD_STATS,
        fetchPolicy: 'network-only',
      });

      const dashboardStats: DashboardStats = {
        consultationsCount: result.data?.dataEntries?.totalCount || 0,
        patientsRecentsCount: result.data?.dashboard?.newPatientsThisMonth || 0,
        syncRequiredCount: syncState?.queueStats?.pendingCount || 0,
      };

      setStats(dashboardStats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard stats'));
      
      // Set fallback stats on error
      setStats({
        consultationsCount: 0,
        patientsRecentsCount: 0,
        syncRequiredCount: syncState?.queueStats?.pendingCount || 0,
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
