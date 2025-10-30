import { useQuery, useQueries } from '@tanstack/react-query';
import reportService from '../services/reports';
import dispensaireService from '../services/dispensaires';

/**
 * Hook to fetch all dispensaires
 */
export function useDispensaires() {
  return useQuery({
    queryKey: ['dispensaires'],
    queryFn: () => dispensaireService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes - dispensaires don't change often
    retry: 2,
  });
}

/**
 * Hook to fetch global statistics
 */
export function useGlobalStats() {
  return useQuery({
    queryKey: ['reports', 'globalStats'],
    queryFn: () => reportService.getGlobalStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch statistics for a specific dispensaire
 */
export function useDispensaireStats(dispensaireId, startDate, endDate, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'dispensaireStats', dispensaireId, startDate, endDate],
    queryFn: () => reportService.getStatsByDispensaire(dispensaireId, startDate, endDate),
    enabled: enabled && dispensaireId && dispensaireId !== 'all',
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch top diagnostics with filters
 */
export function useTopDiagnostics(limit = 5, dispensaireId, startDate, endDate) {
  const dispensaireFilter = dispensaireId !== 'all' ? dispensaireId : null;
  
  return useQuery({
    queryKey: ['reports', 'topDiagnostics', limit, dispensaireFilter, startDate, endDate],
    queryFn: () => reportService.getTopDiagnostics(limit, dispensaireFilter, startDate, endDate),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch top medications with filters
 */
export function useTopMedications(limit = 10, dispensaireId, startDate, endDate) {
  const dispensaireFilter = dispensaireId !== 'all' ? dispensaireId : null;
  
  return useQuery({
    queryKey: ['reports', 'topMedications', limit, dispensaireFilter, startDate, endDate],
    queryFn: () => reportService.getTopMedications(limit, dispensaireFilter, startDate, endDate),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch consultations evolution with filters
 */
export function useConsultationsEvolution(period, dispensaireId, startDate, endDate) {
  const dispensaireFilter = dispensaireId !== 'all' ? dispensaireId : null;
  
  return useQuery({
    queryKey: ['reports', 'consultationsEvolution', period, dispensaireFilter, startDate, endDate],
    queryFn: () => reportService.getConsultationsEvolution(period, dispensaireFilter, startDate, endDate),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch statistics by period with filters
 */
export function useStatsByPeriod(startDate, endDate, dispensaireId) {
  const dispensaireFilter = dispensaireId !== 'all' ? dispensaireId : null;
  
  return useQuery({
    queryKey: ['reports', 'statsByPeriod', dispensaireFilter, startDate, endDate],
    queryFn: () => reportService.getStatsByPeriod(startDate, endDate, dispensaireFilter),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    keepPreviousData: true,
  });
}

/**
 * Composite hook that fetches all report data at once
 * This provides a single loading state for all report queries
 */
export function useReportsData(selectedDispensaire, dateRange, period) {
  const dispensaireFilter = selectedDispensaire !== 'all' ? selectedDispensaire : null;

  const queries = useQueries({
    queries: [
      {
        queryKey: ['dispensaires'],
        queryFn: () => dispensaireService.getAll(),
        staleTime: 5 * 60 * 1000,
        retry: 2,
      },
      {
        queryKey: ['reports', 'topDiagnostics', 5, dispensaireFilter, dateRange.startDate, dateRange.endDate],
        queryFn: () => reportService.getTopDiagnostics(5, dispensaireFilter, dateRange.startDate, dateRange.endDate),
        staleTime: 1 * 60 * 1000,
        retry: 2,
        keepPreviousData: true,
      },
      {
        queryKey: ['reports', 'topMedications', 10, dispensaireFilter, dateRange.startDate, dateRange.endDate],
        queryFn: () => reportService.getTopMedications(10, dispensaireFilter, dateRange.startDate, dateRange.endDate),
        staleTime: 1 * 60 * 1000,
        retry: 2,
        keepPreviousData: true,
      },
      {
        queryKey: ['reports', 'consultationsEvolution', period, dispensaireFilter, dateRange.startDate, dateRange.endDate],
        queryFn: () => reportService.getConsultationsEvolution(period, dispensaireFilter, dateRange.startDate, dateRange.endDate),
        staleTime: 1 * 60 * 1000,
        retry: 2,
        keepPreviousData: true,
      },
      {
        queryKey: ['reports', 'statsByPeriod', dispensaireFilter, dateRange.startDate, dateRange.endDate],
        queryFn: () => reportService.getStatsByPeriod(dateRange.startDate, dateRange.endDate, dispensaireFilter),
        staleTime: 1 * 60 * 1000,
        retry: 2,
        keepPreviousData: true,
      },
    ],
  });

  const [
    dispensairesQuery,
    topDiagnosticsQuery,
    topMedicationsQuery,
    evolutionQuery,
    periodStatsQuery,
  ] = queries;

  const isLoading = queries.some(q => q.isLoading);
  const isError = queries.some(q => q.isError);
  const isFetching = queries.some(q => q.isFetching);

  return {
    dispensaires: dispensairesQuery.data || [],
    topDiagnostics: topDiagnosticsQuery.data || [],
    topMedications: topMedicationsQuery.data || [],
    evolution: evolutionQuery.data || [],
    periodStats: periodStatsQuery.data || null,
    isLoading,
    isError,
    isFetching,
    queries,
  };
}
