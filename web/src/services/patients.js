import axios from 'axios';

const API_URL = import.meta.env.VITE_GRAPHQL_ENDPOINT || '/graphql';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajout du token si présent
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function handleGraphQLErrors(response) {
  if (response.data.errors) {
    throw new Error(response.data.errors[0].message || 'Erreur GraphQL');
  }
  return response.data.data;
}

const patientFields = `
  id
  nom
  prenom
  age
  sexe
  religion
  village
  numeroPatient
  isActive
  isMineur
  dispensaire {
    id
    name
  }
`;

// 1. Liste des patients
async function getAll() {
  const query = `
    query patients {
      patients {
        patients {
          ${patientFields}
        }
      }
    }
  `;
  const response = await client.post('', { query });
  return handleGraphQLErrors(response).patients.patients;
}

// 2. Détail patient
async function getById(id) {
  const query = `
    query patientById($id: ID!) {
      patient(id: $id) {
        ${patientFields}
      }
    }
  `;
  const variables = { id };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).patient;
}

// 3. Création patient
async function create(patientData) {
  const mutation = `
    mutation CreatePatient($input: CreatePatientInput!) {
      createPatient(input: $input) {
        success
        errors
        patient {
          ${patientFields}
        }
      }
    }
  `;
  const variables = { input: patientData };
  const response = await client.post('', { query: mutation, variables });
  return handleGraphQLErrors(response).createPatient;
}

// 4. Mise à jour patient
async function update(id, patientData) {
  const mutation = `
    mutation UpdatePatient($id: ID!, $input: UpdatePatientInput!) {
      updatePatient(id: $id, input: $input) {
        errors
        success
        message
        patient {
          id
          nom
          prenom
          displayName
          age
          categorieAge
          isMineur
          isActive
          village
          religion
          sexe
        }
      }
    }
  `;
  const variables = { id, input: patientData };
  const response = await client.post('', { query: mutation, variables });
  if (response.data.errors) throw new Error(response.data.errors[0].message || 'Erreur GraphQL');
  return response.data.data.updatePatient;
}

// 5. Suppression patient
async function remove(id) {
  const mutation = `
    mutation DeletePatient($id: ID!) {
      deletePatient(id: $id) {
        success
        errors
        message
      }
    }
  `;
  const variables = { id };
  const response = await client.post('', { query: mutation, variables });
  return handleGraphQLErrors(response).deletePatient;
}

// 6. Recherche patient
async function search(queryStr) {
  const query = `
    query SearchPatients($query: String!) {
      searchPatients(query: $query) {
        ${patientFields}
      }
    }
  `;
  const variables = { query: queryStr };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).searchPatients;
}

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
};