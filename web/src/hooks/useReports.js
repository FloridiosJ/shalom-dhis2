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
 * Hook to fetch Fitoriana statistics
 * Aggregates consultations by age group, gender (lahy/vavy), and dispensaire
 */
export function useFitorianaStats(dateFrom, dateTo, dispensaireIds = null, religions = null, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'fitorianaStats', dateFrom, dateTo, dispensaireIds, religions],
    queryFn: () => reportService.getFitorianaStats(dateFrom, dateTo, dispensaireIds, religions),
    enabled: enabled && !!dateFrom && !!dateTo,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch consultants (unique patients) and consultations by dispensaire/zone
 * Useful for Tatitra reporting and visualizations
 */
export function useConsultantsByZone(dateFrom, dateTo, dispensaireIds = null, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'consultantsByZone', dateFrom, dateTo, dispensaireIds],
    queryFn: () => reportService.getConsultantsByZone(dateFrom, dateTo, dispensaireIds),
    enabled: enabled && !!dateFrom && !!dateTo,
    staleTime: 2 * 60 * 1000, // 2 minutes - this data changes less frequently
    retry: 2,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch diagnostics aggregated by dispensaire/zone
 * Returns cross-tabulation (diagnostic x dispensaire) for Tatitra reporting
 * 
 * @param {string} dateFrom - Start date (ISO format YYYY-MM-DD)
 * @param {string} dateTo - End date (ISO format YYYY-MM-DD)
 * @param {Array<string>} dispensaireIds - Optional: filter by specific dispensaires
 * @param {number} limit - Optional: limit number of diagnostics returned
 * @param {boolean} enabled - Whether the query is enabled (default: true)
 */
export function useDiagnosticsByZone(dateFrom, dateTo, dispensaireIds = null, limit = null, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'diagnosticsByZone', dateFrom, dateTo, dispensaireIds, limit],
    queryFn: () => reportService.getDiagnosticsByZone(dateFrom, dateTo, dispensaireIds, limit),
    enabled: enabled && !!dateFrom && !!dateTo,
    staleTime: 2 * 60 * 1000, // 2 minutes - this data changes less frequently
    retry: 2,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch education statistics by zone with filters
 * For Tatitra Section III: Fandriandram-piterahana
 * @param {string} dateFrom - Start date in ISO format
 * @param {string} dateTo - End date in ISO format
 * @param {Array<string>} dispensaireIds - Optional: filter by specific dispensaires
 * @param {boolean} enabled - Whether the query is enabled (default: true)
 */
export function useEducationByZone(dateFrom, dateTo, dispensaireIds = null, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'educationByZone', dateFrom, dateTo, dispensaireIds],
    queryFn: () => reportService.getEducationByZone(dateFrom, dateTo, dispensaireIds),
    enabled: enabled && !!dateFrom && !!dateTo,
    staleTime: 2 * 60 * 1000, // 2 minutes - this data changes less frequently
    retry: 2,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch maternal health statistics by zone with filters
 * For Tatitra Section IV: MOMBA IREO RENY BEVOAKA (Santé Maternelle)
 * @param {string} dateFrom - Start date in ISO format
 * @param {string} dateTo - End date in ISO format
 * @param {Array<string>} dispensaireIds - Optional: filter by specific dispensaires
 * @param {boolean} enabled - Whether the query is enabled (default: true)
 */
export function useMaternalHealthByZone(dateFrom, dateTo, dispensaireIds = null, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'maternalHealthByZone', dateFrom, dateTo, dispensaireIds],
    queryFn: () => reportService.getMaternalHealthByZone(dateFrom, dateTo, dispensaireIds),
    enabled: enabled && !!dateFrom && !!dateTo,
    staleTime: 2 * 60 * 1000, // 2 minutes - this data changes less frequently
    retry: 2,
    keepPreviousData: true,
  });
}

/**
 * Hook to fetch events/awareness activities by zone with filters
 * For Tatitra Section V: FANENTANANA NATAO (Événements/Sensibilisation)
 * @param {string} dateFrom - Start date in ISO format
 * @param {string} dateTo - End date in ISO format
 * @param {Array<string>} dispensaireIds - Optional: filter by specific dispensaires
 * @param {boolean} enabled - Whether the query is enabled (default: true)
 */
export function useEventsByZone(dateFrom, dateTo, dispensaireIds = null, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'eventsByZone', dateFrom, dateTo, dispensaireIds],
    queryFn: () => reportService.getEventsByZone(dateFrom, dateTo, dispensaireIds),
    enabled: enabled && !!dateFrom && !!dateTo,
    staleTime: 2 * 60 * 1000, // 2 minutes - this data changes less frequently
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
