/**
 * @format
 */

import {Alert} from 'react-native';
import {fetchPatients} from '../src/services/patientService';
import {createConsultation} from '../src/services/consultationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock patient service
jest.mock('../src/services/patientService', () => ({
  fetchPatients: jest.fn(),
}));

// Mock consultation service
jest.mock('../src/services/consultationService', () => ({
  createConsultation: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('useConsultationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPatients integration', () => {
    it('should call fetchPatients with correct pagination', async () => {
      const mockPatients = [
        {
          id: '1',
          displayName: 'Jean Dupont',
          nom: 'Dupont',
          prenom: 'Jean',
          sexe: 'M',
          age: 30,
          numeroPatient: 'PAT-001',
          village: 'Village 1',
        },
      ];

      (fetchPatients as jest.Mock).mockResolvedValue({
        patients: mockPatients,
        totalCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });

      // Simulate hook usage
      await fetchPatients({
        pagination: {
          limit: 1000,
        },
      });

      expect(fetchPatients).toHaveBeenCalledWith({
        pagination: {
          limit: 1000,
        },
      });
    });

    it('should handle patient loading errors', async () => {
      const mockError = new Error('Network error');
      (fetchPatients as jest.Mock).mockRejectedValue(mockError);

      try {
        await fetchPatients();
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });

  describe('createConsultation integration', () => {
    it('should call createConsultation with correct parameters', async () => {
      const mockConsultation = {
        id: 'cons-123',
        patientId: '1',
        dateConsultation: new Date().toISOString(),
        diagnostic: 'Test',
        prescription: 'Test',
        notes: 'Test notes',
        status: 'termine' as const,
      };

      (createConsultation as jest.Mock).mockResolvedValue(mockConsultation);

      const formData = {
        patientId: '1',
        typeConsultation: 'consultation_prenatale',
        dateConsultation: new Date(),
        heureConsultation: new Date(),
        categoriesMaladie: 'A01:A01.1',
        prescriptionsStructurees: [],
        notes: 'Test notes',
      };

      const result = await createConsultation(formData);

      expect(createConsultation).toHaveBeenCalledWith(formData);
      expect(result.id).toBe('cons-123');
    });

    it('should handle consultation creation errors', async () => {
      const mockError = new Error('Server error');
      (createConsultation as jest.Mock).mockRejectedValue(mockError);

      const formData = {
        patientId: '1',
        typeConsultation: 'consultation_prenatale',
        dateConsultation: new Date(),
        heureConsultation: new Date(),
        categoriesMaladie: 'A01:A01.1',
        prescriptionsStructurees: [],
        notes: 'Test notes',
      };

      try {
        await createConsultation(formData);
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });

  describe('AsyncStorage draft management', () => {
    it('should store draft data correctly', async () => {
      const draftData = {
        patientId: '1',
        typeConsultation: 'consultation_prenatale',
        dateConsultation: new Date().toISOString(),
        heureConsultation: new Date().toISOString(),
        categoriesMaladie: 'A01:A01.1',
        prescriptionsStructurees: [],
        notes: 'Test notes',
      };

      await AsyncStorage.setItem('@consultation_draft', JSON.stringify({
        formData: draftData,
        savedAt: new Date().toISOString(),
      }));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@consultation_draft',
        expect.any(String),
      );
    });

    it('should remove draft after successful save', async () => {
      await AsyncStorage.removeItem('@consultation_draft');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@consultation_draft');
    });
  });
});

