/**
 * Unit tests for useConsultantsByZone hook
 * Tests the React Query hook that fetches consultants and consultations by zone
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConsultantsByZone } from './useReports';
import reportService from '../services/reports';

// Mock the report service
vi.mock('../services/reports', () => ({
  default: {
    getConsultantsByZone: vi.fn(),
  },
}));

describe('useConsultantsByZone Hook', () => {
  let queryClient;

  beforeEach(() => {
    // Create a fresh QueryClient for each test to avoid cache issues
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for faster tests
        },
      },
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch consultants by zone successfully', async () => {
    const mockData = [
      {
        dispensaire: { id: '1', name: 'Ampitsopitsoka' },
        consultants: 93,
        consultations: 207
      },
      {
        dispensaire: { id: '2', name: 'Boeny Aranta' },
        consultants: 85,
        consultations: 189
      },
      {
        dispensaire: null,
        consultants: 178,
        consultations: 396
      }
    ];

    reportService.getConsultantsByZone.mockResolvedValue(mockData);

    const { result } = renderHook(
      () => useConsultantsByZone('2025-01-01', '2025-03-31'),
      { wrapper }
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data to load
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Check the data
    expect(result.current.data).toEqual(mockData);
    expect(reportService.getConsultantsByZone).toHaveBeenCalledWith(
      '2025-01-01',
      '2025-03-31',
      null
    );
  });

  it('should filter by dispensaire IDs', async () => {
    const mockData = [
      {
        dispensaire: { id: '1', name: 'Ampitsopitsoka' },
        consultants: 93,
        consultations: 207
      },
      {
        dispensaire: null,
        consultants: 93,
        consultations: 207
      }
    ];

    reportService.getConsultantsByZone.mockResolvedValue(mockData);

    const { result } = renderHook(
      () => useConsultantsByZone('2025-01-01', '2025-03-31', ['1']),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(reportService.getConsultantsByZone).toHaveBeenCalledWith(
      '2025-01-01',
      '2025-03-31',
      ['1']
    );
    expect(result.current.data).toEqual(mockData);
  });

  it('should not fetch when dates are missing', () => {
    const { result } = renderHook(
      () => useConsultantsByZone(null, null),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(reportService.getConsultantsByZone).not.toHaveBeenCalled();
  });

  it('should not fetch when only dateFrom is provided', () => {
    const { result } = renderHook(
      () => useConsultantsByZone('2025-01-01', null),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(reportService.getConsultantsByZone).not.toHaveBeenCalled();
  });

  it('should not fetch when enabled is false', () => {
    const { result } = renderHook(
      () => useConsultantsByZone('2025-01-01', '2025-03-31', null, false),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(reportService.getConsultantsByZone).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Network error');
    reportService.getConsultantsByZone.mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useConsultantsByZone('2025-01-01', '2025-03-31'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it('should return data with correct structure', async () => {
    const mockData = [
      {
        dispensaire: { id: '1', name: 'Zone 1' },
        consultants: 50,
        consultations: 120
      },
      {
        dispensaire: { id: '2', name: 'Zone 2' },
        consultants: 30,
        consultations: 80
      },
      {
        dispensaire: null,
        consultants: 80,
        consultations: 200
      }
    ];

    reportService.getConsultantsByZone.mockResolvedValue(mockData);

    const { result } = renderHook(
      () => useConsultantsByZone('2025-01-01', '2025-03-31'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data;
    
    // Verify structure of dispensaire rows
    expect(data).toHaveLength(3);
    expect(data[0]).toHaveProperty('dispensaire');
    expect(data[0]).toHaveProperty('consultants');
    expect(data[0]).toHaveProperty('consultations');
    expect(data[0].dispensaire).toHaveProperty('id');
    expect(data[0].dispensaire).toHaveProperty('name');

    // Verify total row
    const totalRow = data[data.length - 1];
    expect(totalRow.dispensaire).toBeNull();
    expect(totalRow.consultants).toBe(80);
    expect(totalRow.consultations).toBe(200);
  });

  it('should keep previous data while refetching', async () => {
    const initialData = [
      {
        dispensaire: { id: '1', name: 'Zone 1' },
        consultants: 50,
        consultations: 120
      }
    ];

    reportService.getConsultantsByZone.mockResolvedValue(initialData);

    const { result, rerender } = renderHook(
      ({ dateFrom, dateTo }) => useConsultantsByZone(dateFrom, dateTo),
      {
        wrapper,
        initialProps: { dateFrom: '2025-01-01', dateTo: '2025-03-31' }
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(initialData);

    // Change dates to trigger refetch
    const newData = [
      {
        dispensaire: { id: '1', name: 'Zone 1' },
        consultants: 75,
        consultations: 180
      }
    ];

    reportService.getConsultantsByZone.mockResolvedValue(newData);
    rerender({ dateFrom: '2025-04-01', dateTo: '2025-06-30' });

    // Previous data should still be available while fetching
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });

  it('should cache results based on query key', async () => {
    const mockData = [
      {
        dispensaire: { id: '1', name: 'Zone 1' },
        consultants: 50,
        consultations: 120
      }
    ];

    reportService.getConsultantsByZone.mockResolvedValue(mockData);

    // First call
    const { result: result1 } = renderHook(
      () => useConsultantsByZone('2025-01-01', '2025-03-31'),
      { wrapper }
    );

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));
    expect(reportService.getConsultantsByZone).toHaveBeenCalledTimes(1);

    // Second call with same parameters should use cache
    const { result: result2 } = renderHook(
      () => useConsultantsByZone('2025-01-01', '2025-03-31'),
      { wrapper }
    );

    // Should immediately have data from cache
    await waitFor(() => expect(result2.current.isSuccess).toBe(true));
    
    // Should not call the service again (still 1 time from first call)
    expect(reportService.getConsultantsByZone).toHaveBeenCalledTimes(1);
    expect(result2.current.data).toEqual(mockData);
  });
});
