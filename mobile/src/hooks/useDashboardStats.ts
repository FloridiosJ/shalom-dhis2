import {useState, useEffect, useCallback} from 'react';
import {gql} from '@apollo/client';
import {apolloClient} from '../services/apollo';

/**
 * Dashboard statistics type
 */
export interface DashboardStats {
  consultationsCount: number; // Consultations count (this month)
  patientsRecentsCount: number; // New patients count (this month)
  syncRequiredCount: number; // Sync count (always 0 for now)
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
      consultationsThisMonth
      newPatientsThisMonth
    }
  }
`;

/**
 * Custom hook to fetch and manage dashboard statistics
 * 
 * Fetches:
 * - Consultations count (all consultations this month from 1st to 31st)
 * - New patients count (new patients this month only)
 * - Sync queue count (always 0 - separate feature)
 * 
 * @returns Dashboard statistics with loading/error states and refetch function
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard statistics
      const result = await apolloClient.query<{
        dashboard: {
          consultationsThisMonth: number;
          newPatientsThisMonth: number;
        };
      }>({
        query: GET_DASHBOARD_STATS,
        fetchPolicy: 'network-only',
      });

      const dashboardStats: DashboardStats = {
        consultationsCount: result.data?.dashboard?.consultationsThisMonth || 0,
        patientsRecentsCount: result.data?.dashboard?.newPatientsThisMonth || 0,
        syncRequiredCount: 0, // Always 0 - separate feature
      };

      setStats(dashboardStats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard stats'));
      
      // Set fallback stats on error
      setStats({
        consultationsCount: 0,
        patientsRecentsCount: 0,
        syncRequiredCount: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

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
