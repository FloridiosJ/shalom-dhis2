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

const entryFields = `
  id
  dispensaireId
  indicator
  value
  date
  dispensaire {
    id
    name
    organisation {
      id
      name
      type
    }
  }
`;

// 1. Liste des data entries
async function getAll() {
  const query = `
    query {
      dataEntries {
        ${entryFields}
      }
    }
  `;
  const response = await client.post('', { query });
  return handleGraphQLErrors(response).dataEntries;
}

// 2. Détail data entry
async function getById(id) {
  const query = `
    query GetDataEntry($id: ID!) {
      dataEntry(id: $id) {
        ${entryFields}
      }
    }
  `;
  const variables = { id };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).dataEntry;
}

// 3. Création data entry
async function create(dataEntryData) {
  const mutation = `
    mutation CreateDataEntry($input: DataEntryInput!) {
      createDataEntry(input: $input) {
        ${entryFields}
      }
    }
  `;
  const variables = { input: dataEntryData };
  const response = await client.post('', { query: mutation, variables });
  return handleGraphQLErrors(response).createDataEntry;
}

// 4. Mise à jour data entry
async function update(id, dataEntryData) {
  const mutation = `
    mutation UpdateDataEntry($id: ID!, $input: DataEntryInput!) {
      updateDataEntry(id: $id, input: $input) {
        ${entryFields}
      }
    }
  `;
  const variables = { id, input: dataEntryData };
  const response = await client.post('', { query: mutation, variables });
  return handleGraphQLErrors(response).updateDataEntry;
}

// 5. Suppression data entry
async function remove(id) {
  const mutation = `
    mutation DeleteDataEntry($id: ID!) {
      deleteDataEntry(id: $id)
    }
  `;
  const variables = { id };
  const response = await client.post('', { query: mutation, variables });
  return handleGraphQLErrors(response).deleteDataEntry;
}

// 6. Récupérer par organisation
async function getByOrganisation(organisationId) {
  const query = `
    query {
      dataEntries {
        ${entryFields}
      }
    }
  `;
  const response = await client.post('', { query });
  const all = handleGraphQLErrors(response).dataEntries;
  return all.filter(entry => entry.dispensaire.organisation.id === organisationId);
}

// 7. Recherche data entry
async function search(searchTerm) {
  const query = `
    query {
      dataEntries {
        ${entryFields}
      }
    }
  `;
  const response = await client.post('', { query });
  const all = handleGraphQLErrors(response).dataEntries;
  const searchTermLower = searchTerm.toLowerCase();
  return all.filter(entry =>
    entry.indicator.toLowerCase().includes(searchTermLower) ||
    entry.dispensaire.name.toLowerCase().includes(searchTermLower) ||
    entry.dispensaire.organisation.name.toLowerCase().includes(searchTermLower) ||
    entry.value.toString().includes(searchTermLower)
  );
}

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  getByOrganisation,
  search,
};