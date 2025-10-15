import axios from "axios";

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

const entryFields = `
  id
  dateConsultation
  diagnostic
  prescription
  notes
  dispensaire { id name }
  patient { id nom prenom displayName }
`;

// 1. Liste des consultations
async function getAll() {
  const query = `
    query dataEntries {
      dataEntries {
        dataEntries {
          ${entryFields}
        }
      }
    }
  `;
  const response = await client.post('', { query });
  return handleGraphQLErrors(response).dataEntries.dataEntries;
}

// 2. Création consultation
async function create(input) {
  const mutation = `
    mutation CreateDataEntry($input: CreateDataEntryInput!) {
      createDataEntry(input: $input) {
        success
        errors
        dataEntry { ${entryFields} }
      }
    }
  `;
  const variables = { input };
  const response = await client.post('', { query: mutation, variables });
  const res = handleGraphQLErrors(response).createDataEntry;
  if (!res.success) throw new Error(res.errors?.join(', ') || "Erreur création");
  return res.dataEntry;
}

// 3. Mise à jour consultation
async function update(id, input) {
  const mutation = `
    mutation UpdateDataEntry($id: ID!, $input: UpdateDataEntryInput!) {
      updateDataEntry(id: $id, input: $input) {
        success
        errors
        dataEntry { ${entryFields} }
      }
    }
  `;
  const variables = { id, input };
  const response = await client.post('', { query: mutation, variables });
  const res = handleGraphQLErrors(response).updateDataEntry;
  if (!res.success) throw new Error(res.errors?.join(', ') || "Erreur modification");
  return res.dataEntry;
}

// 4. Suppression consultation
async function remove(id) {
  const mutation = `
    mutation DeleteDataEntry($id: ID!) {
      deleteDataEntry(id: $id) {
        success
        errors
        message
      }
    }
  `;
  const variables = { id };
  const response = await client.post('', { query: mutation, variables });
  const res = handleGraphQLErrors(response).deleteDataEntry;
  if (!res.success) throw new Error(res.errors?.join(', ') || "Erreur suppression");
  return res;
}

export default {
  getAll,
  create,
  update,
  remove,
};