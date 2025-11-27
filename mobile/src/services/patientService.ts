import {gql} from '@apollo/client';
import {apolloClient} from './apollo';
import {getUser} from './auth';
import {Patient} from '../types';

export const GET_PATIENTS = gql`
  query GetPatients($filter: PatientFilterInput, $sort: SortInput, $pagination: PaginationInput) {
    patients(filter: $filter, sort: $sort, pagination: $pagination) {
      patients {
        id
        displayName
        nom
        prenom
        sexe
        age
        numeroPatient
        village
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
`;

export const GET_PATIENT_DETAIL = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      displayName
      nom
      prenom
      sexe
      age
      numeroPatient
      village
      religion
      consultations {
        id
        dateConsultation
        diagnostic
        prescription
        notes
        status
        typeConsultation
      }
    }
  }
`;

export const CREATE_PATIENT_MUTATION = gql`
  mutation CreatePatient($input: CreatePatientInput!) {
    createPatient(input: $input) {
      patient {
        id
        nom
        prenom
        dateNaissance
        sexe
        religion
        village
        numeroPatient
        dispensaireId
        displayName
        categorieAge
        isMineur
        createdAt
      }
    }
  }
`;

export interface CreatePatientInput {
  nom: string;
  prenom?: string;
  dateNaissance?: string;
  sexe: string;
  religion: 'Kristianina' | 'Musulman' | 'traditionnelle';
  village: string;
  dispensaireId: string;
  numeroPatient?: string;
}

export interface CreatePatientResponse {
  createPatient: {
    patient: Patient | null;
  };
}

interface PatientFilterInput {
  dispensaireId?: string;
  religion?: string;
  sexe?: string;
  village?: string;
  ageMin?: number;
  ageMax?: number;
  isActive?: boolean;
  search?: string;
}

interface GetPatientsVariables {
  filter?: PatientFilterInput;
  sort?: {
    field: string;
    direction: 'ASC' | 'DESC';
  };
  pagination?: {
    page?: number;
    limit?: number;
    offset?: number;
  };
}

interface GetPatientsResponse {
  patients: {
    patients: Patient[];
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Fetch patients from the backend with optional filtering
 * @param filter - Optional filter parameters
 * @param sort - Optional sort parameters
 * @param pagination - Optional pagination parameters
 * @returns List of patients with pagination info
 */
export async function fetchPatients(
  variables: GetPatientsVariables = {},
): Promise<GetPatientsResponse['patients']> {
  try {
    // Get current user to extract dispensaireId
    const user = await getUser();
    
    // Build filter without mutation, applying user's dispensaireId if needed
    const finalFilter = {
      ...variables.filter,
      dispensaireId: variables.filter?.dispensaireId || user?.dispensaireId,
    };

    const {data} = await apolloClient.query<
      GetPatientsResponse,
      GetPatientsVariables
    >({
      query: GET_PATIENTS,
      variables: {
        ...variables,
        filter: finalFilter,
        sort: variables.sort || {
          field: 'createdAt',
          direction: 'DESC',
        },
      },
      fetchPolicy: 'network-only',
    });

    return data.patients;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
}