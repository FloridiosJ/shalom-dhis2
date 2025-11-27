import { gql } from '@apollo/client';

/**
 * GraphQL mutation for creating a patient
 */
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

/**
 * Input interface for creating a patient
 */
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

/**
 * Patient interface
 */
export interface Patient {
  id: string;
  nom: string;
  prenom?: string;
  dateNaissance?: string;
  sexe: string;
  religion: string;
  village: string;
  numeroPatient: string;
  dispensaireId: string;
  displayName: string;
  categorieAge: string;
  isMineur: boolean;
  createdAt: string;
}

/**
 * Response from createPatient mutation
 */
export interface CreatePatientResponse {
  createPatient: {
    patient: Patient | null;
  };
}
