import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';

// Mock axios before importing the service
let mockPost;
const mockClient = {
  interceptors: {
    request: {
      use: vi.fn((fn) => {
        // Simulate interceptor execution
        return fn;
      })
    }
  },
  post: null // Will be set in beforeEach
};

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => mockClient)
    }
  };
});

// Now import the service after mocking axios
const { default: reportsService } = await import('./reports.js');

describe('Reports Service', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock localStorage
    global.localStorage.getItem = vi.fn(() => 'mock-token');
    
    // Create a mock post function
    mockPost = vi.fn();
    mockClient.post = mockPost;
  });

  describe('getGlobalStats', () => {
    it('should fetch global statistics successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            reports: {
              totalConsultations: 150,
              totalDispensaires: 5,
              totalPatients: 200,
              totalUsers: 10
            }
          }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      const result = await reportsService.getGlobalStats();
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.stringContaining('GlobalStats')
      });
      expect(result).toEqual(mockResponse.data.data.reports);
      expect(result.totalConsultations).toBe(150);
      expect(result.totalDispensaires).toBe(5);
      expect(result.totalPatients).toBe(200);
      expect(result.totalUsers).toBe(10);
    });

    it('should handle GraphQL errors', async () => {
      const mockResponse = {
        data: {
          errors: [{ message: 'Authentication error' }]
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      await expect(reportsService.getGlobalStats()).rejects.toThrow('Authentication error');
    });

    it('should handle network errors', async () => {
      mockPost.mockRejectedValue(new Error('Network error'));
      
      await expect(reportsService.getGlobalStats()).rejects.toThrow('Network error');
    });
  });

  describe('getStatsByPeriod', () => {
    it('should fetch stats by period without dispensaire filter', async () => {
      const mockResponse = {
        data: {
          data: {
            consultationStats: {
              total: 100,
              thisMonth: 30,
              thisWeek: 10,
              today: 2,
              averagePerDay: 3.5,
              topCategories: [],
              byType: []
            }
          }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      const result = await reportsService.getStatsByPeriod('2025-01-01', '2025-01-31');
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.stringContaining('StatsByPeriod'),
        variables: {}
      });
      expect(result).toEqual(mockResponse.data.data.consultationStats);
      expect(result.total).toBe(100);
      expect(result.thisMonth).toBe(30);
    });

    it('should fetch stats by period with dispensaire filter', async () => {
      const mockResponse = {
        data: {
          data: {
            consultationStats: {
              total: 50,
              thisMonth: 15,
              thisWeek: 5,
              today: 1,
              averagePerDay: 2.0,
              topCategories: [],
              byType: []
            }
          }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      const result = await reportsService.getStatsByPeriod('2025-01-01', '2025-01-31', 'disp-123');
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.stringContaining('StatsByPeriod'),
        variables: { dispensaireId: 'disp-123' }
      });
      expect(result).toEqual(mockResponse.data.data.consultationStats);
    });

    it('should not include dispensaireId when set to "all"', async () => {
      const mockResponse = {
        data: {
          data: { consultationStats: { total: 100 } }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      await reportsService.getStatsByPeriod('2025-01-01', '2025-01-31', 'all');
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.any(String),
        variables: {}
      });
    });
  });

  describe('getTopDiagnostics', () => {
    it('should fetch top diagnostics with default limit', async () => {
      const mockResponse = {
        data: {
          data: {
            topDiagnostics: [
              { diagnostic: 'Paludisme', count: 50, percentage: 50.0 },
              { diagnostic: 'Grippe', count: 30, percentage: 30.0 },
              { diagnostic: 'Diarrhée', count: 20, percentage: 20.0 }
            ]
          }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      const result = await reportsService.getTopDiagnostics();
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.stringContaining('TopDiagnostics'),
        variables: { limit: 10 }
      });
      expect(result).toHaveLength(3);
      expect(result[0].diagnostic).toBe('Paludisme');
      expect(result[0].count).toBe(50);
    });

    it('should fetch top diagnostics with custom limit', async () => {
      const mockResponse = {
        data: {
          data: {
            topDiagnostics: [
              { diagnostic: 'Paludisme', count: 50, percentage: 100.0 }
            ]
          }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      const result = await reportsService.getTopDiagnostics(5);
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.any(String),
        variables: { limit: 5 }
      });
      expect(result).toHaveLength(1);
    });

    it('should fetch top diagnostics with all filters', async () => {
      const mockResponse = {
        data: {
          data: {
            topDiagnostics: [
              { diagnostic: 'Paludisme', count: 25, percentage: 100.0 }
            ]
          }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      const result = await reportsService.getTopDiagnostics(
        10, 
        'disp-123', 
        '2025-01-01', 
        '2025-01-31'
      );
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.any(String),
        variables: {
          limit: 10,
          dispensaireId: 'disp-123',
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        }
      });
      expect(result[0].diagnostic).toBe('Paludisme');
    });

    it('should not include optional filters when not provided', async () => {
      const mockResponse = {
        data: {
          data: { topDiagnostics: [] }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      await reportsService.getTopDiagnostics(10, null, null, null);
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.any(String),
        variables: { limit: 10 }
      });
    });

    it('should not include dispensaireId when set to "all"', async () => {
      const mockResponse = {
        data: {
          data: { topDiagnostics: [] }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      await reportsService.getTopDiagnostics(10, 'all');
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.any(String),
        variables: { limit: 10 }
      });
    });
  });

  describe('getTopMedications', () => {
    it('should fetch top medications with default parameters', async () => {
      const mockResponse = {
        data: {
          data: {
            topMedications: [
              { medicament: 'Paracetamol', count: 100, avgDuree: '5j', totalDuree: '500j' },
              { medicament: 'Amoxicilline', count: 75, avgDuree: '7j', totalDuree: '525j' }
            ]
          }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      const result = await reportsService.getTopMedications();
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.stringContaining('TopMedications'),
        variables: { limit: 10 }
      });
      expect(result).toHaveLength(2);
      expect(result[0].medicament).toBe('Paracetamol');
      expect(result[0].count).toBe(100);
    });

    it('should fetch top medications with all filters', async () => {
      const mockResponse = {
        data: {
          data: {
            topMedications: [
              { medicament: 'Paracetamol', count: 50, avgDuree: '5j', totalDuree: '250j' }
            ]
          }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      await reportsService.getTopMedications(5, 'disp-123', '2025-01-01', '2025-01-31');
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.any(String),
        variables: {
          limit: 5,
          dispensaireId: 'disp-123',
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        }
      });
    });
  });

  describe('getConsultationsEvolution', () => {
    it('should fetch consultations evolution with default period', async () => {
      const mockResponse = {
        data: {
          data: {
            consultationsEvolution: [
              { period: '2025-01', count: 50, date: '2025-01' },
              { period: '2025-02', count: 60, date: '2025-02' }
            ]
          }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      const result = await reportsService.getConsultationsEvolution();
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.stringContaining('ConsultationsEvolution'),
        variables: { period: 'month' }
      });
      expect(result).toHaveLength(2);
      expect(result[0].count).toBe(50);
    });

    it('should fetch consultations evolution with custom period', async () => {
      const mockResponse = {
        data: {
          data: {
            consultationsEvolution: [
              { period: '2025-W01', count: 10, date: '2025-W01' }
            ]
          }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      await reportsService.getConsultationsEvolution('week');
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.any(String),
        variables: { period: 'week' }
      });
    });

    it('should fetch consultations evolution with all filters', async () => {
      const mockResponse = {
        data: {
          data: {
            consultationsEvolution: [
              { period: '2025-01', count: 30, date: '2025-01' }
            ]
          }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      await reportsService.getConsultationsEvolution(
        'month',
        'disp-123',
        '2025-01-01',
        '2025-01-31'
      );
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.any(String),
        variables: {
          period: 'month',
          dispensaireId: 'disp-123',
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        }
      });
    });
  });

  describe('getStatsByDispensaire', () => {
    it('should fetch stats for a specific dispensaire', async () => {
      const mockResponse = {
        data: {
          data: {
            dispensaireStats: {
              dispensaire: { id: 'disp-123', name: 'Dispensaire Centre' },
              totalConsultations: 150,
              totalPatients: 100,
              consultationsByType: [],
              topCategories: []
            }
          }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      const result = await reportsService.getStatsByDispensaire('disp-123');
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.stringContaining('StatsByDispensaire'),
        variables: { dispensaireId: 'disp-123' }
      });
      expect(result.dispensaire.id).toBe('disp-123');
      expect(result.totalConsultations).toBe(150);
    });

    it('should fetch stats with date filters', async () => {
      const mockResponse = {
        data: {
          data: {
            dispensaireStats: {
              dispensaire: { id: 'disp-123', name: 'Dispensaire Centre' },
              totalConsultations: 50,
              totalPatients: 40,
              consultationsByType: [],
              topCategories: []
            }
          }
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      await reportsService.getStatsByDispensaire('disp-123', '2025-01-01', '2025-01-31');
      
      expect(mockPost).toHaveBeenCalledWith('', {
        query: expect.any(String),
        variables: {
          dispensaireId: 'disp-123',
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        }
      });
    });

    it('should handle dispensaire not found', async () => {
      const mockResponse = {
        data: {
          errors: [{ message: 'Dispensaire non trouvé' }]
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      await expect(
        reportsService.getStatsByDispensaire('invalid-id')
      ).rejects.toThrow('Dispensaire non trouvé');
    });
  });

  describe('handleGraphQLErrors', () => {
    it('should throw error with default message when no specific message', async () => {
      const mockResponse = {
        data: {
          errors: [{}]
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      await expect(reportsService.getGlobalStats()).rejects.toThrow('Erreur GraphQL');
    });

    it('should throw error with specific message when provided', async () => {
      const mockResponse = {
        data: {
          errors: [{ message: 'Specific error message' }]
        }
      };
      
      mockPost.mockResolvedValue(mockResponse);
      
      await expect(reportsService.getGlobalStats()).rejects.toThrow('Specific error message');
    });
  });
});
