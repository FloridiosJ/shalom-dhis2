import {gql} from '@apollo/client';

export const GET_PATIENTS = gql`
  query GetPatients {
    patients {
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