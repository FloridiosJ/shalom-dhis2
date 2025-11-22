/**
 * @format
 */

import {fetchPatients} from '../src/services/patientService';
import {apolloClient} from '../src/services/apollo';
import {getUser} from '../src/services/auth';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock apollo client
jest.mock('../src/services/apollo', () => ({
  apolloClient: {
    query: jest.fn(),
  },
}));

// Mock auth service
jest.mock('../src/services/auth', () => ({
  getUser: jest.fn(),
}));

describe('PatientService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPatients', () => {
    it('should fetch patients with dispensaireId from user', async () => {
      const mockUser = {
        id: '1',
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        login: 'testuser',
        role: 'agent',
        dispensaireId: 'disp-123',
      };

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
        {
          id: '2',
          displayName: 'Marie Martin',
          nom: 'Martin',
          prenom: 'Marie',
          sexe: 'F',
          age: 25,
          numeroPatient: 'PAT-002',
          village: 'Village 2',
        },
      ];

      const mockResponse = {
        data: {
          patients: {
            patients: mockPatients,
            totalCount: 2,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      };

      (getUser as jest.Mock).mockResolvedValue(mockUser);
      (apolloClient.query as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchPatients();

      expect(getUser).toHaveBeenCalled();
      expect(apolloClient.query).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            filter: expect.objectContaining({
              dispensaireId: 'disp-123',
            }),
          }),
        }),
      );
      expect(result.patients).toEqual(mockPatients);
      expect(result.totalCount).toBe(2);
    });

    it('should use provided filter over user dispensaireId', async () => {
      const mockUser = {
        id: '1',
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        login: 'testuser',
        role: 'agent',
        dispensaireId: 'disp-123',
      };

      const mockResponse = {
        data: {
          patients: {
            patients: [],
            totalCount: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      };

      (getUser as jest.Mock).mockResolvedValue(mockUser);
      (apolloClient.query as jest.Mock).mockResolvedValue(mockResponse);

      await fetchPatients({
        filter: {
          dispensaireId: 'disp-456',
          search: 'test',
        },
      });

      expect(apolloClient.query).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            filter: expect.objectContaining({
              dispensaireId: 'disp-456',
              search: 'test',
            }),
          }),
        }),
      );
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Network error');
      (getUser as jest.Mock).mockResolvedValue(null);
      (apolloClient.query as jest.Mock).mockRejectedValue(mockError);

      await expect(fetchPatients()).rejects.toThrow('Network error');
    });

    it('should apply default sort if not provided', async () => {
      const mockUser = {
        id: '1',
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        login: 'testuser',
        role: 'agent',
      };

      const mockResponse = {
        data: {
          patients: {
            patients: [],
            totalCount: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      };

      (getUser as jest.Mock).mockResolvedValue(mockUser);
      (apolloClient.query as jest.Mock).mockResolvedValue(mockResponse);

      await fetchPatients();

      expect(apolloClient.query).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            sort: {
              field: 'createdAt',
              direction: 'DESC',
            },
          }),
        }),
      );
    });

    it('should use network-only fetch policy', async () => {
      const mockUser = null;
      const mockResponse = {
        data: {
          patients: {
            patients: [],
            totalCount: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      };

      (getUser as jest.Mock).mockResolvedValue(mockUser);
      (apolloClient.query as jest.Mock).mockResolvedValue(mockResponse);

      await fetchPatients();

      expect(apolloClient.query).toHaveBeenCalledWith(
        expect.objectContaining({
          fetchPolicy: 'network-only',
        }),
      );
    });
  });
});
