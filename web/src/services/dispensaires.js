import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Méthodes du service ---
async function getAll() {
  const query = `
    query {
      dispensaires {
        dispensaires {
          id
          name
          synoda
          fileovana
        }
      }
    }
  `;
  const { data } = await api.post('/graphql', { query });
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data.dispensaires.dispensaires;
}

async function getById(id) {
  const query = `
    query GetDispensaire($id: ID!) {
      dispensaire(id: $id) {
        id
        name
        organisationId
        organisation {
          id
          name
          type
        }
      }
    }
  `;
  const { data } = await api.post('/graphql', { query, variables: { id } });
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data.dispensaire;
}

async function create(dispensaireData) {
  const mutation = `
    mutation CreateDispensaire($input: CreateDispensaireInput!) {
      createDispensaire(input: $input) {
        dispensaire {
          id
          fullName
          fileovana
          synoda
        }
      }
    }
  `;
  const { data } = await api.post('/graphql', { query: mutation, variables: { input: dispensaireData } });
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data.createDispensaire.dispensaire;
}

async function update(id, input) {
  const mutation = `
    mutation UpdateDispensaire($id: ID!, $input: UpdateDispensaireInput!) {
      updateDispensaire(id: $id, input: $input) {
        success
        errors
        message
      }
    }
  `;
  const { data } = await api.post('/graphql', {
    query: mutation,
    variables: { id, input }
  });
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data.updateDispensaire;
}

async function remove(id) {
  const mutation = `
    mutation DeleteDispensaire($id: ID!) {
      deleteDispensaire(id: $id)
    }
  `;
  const { data } = await api.post('/graphql', { query: mutation, variables: { id } });
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data.deleteDispensaire;
}

async function getByOrganisation(organisationId) {
  const query = `
    query GetDispensairesByOrganisation($organisationId: ID!) {
      dispensaires {
        id
        name
        organisationId
        organisation {
          id
          name
          type
        }
      }
    }
  `;
  const { data } = await api.post('/graphql', { query, variables: { organisationId } });
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data.dispensaires.filter(
    dispensaire => dispensaire.organisationId === organisationId
  );
}

async function search(searchTerm) {
  const query = `
    query SearchDispensaires {
      dispensaires {
        id
        name
        organisationId
        organisation {
          id
          name
          type
        }
      }
    }
  `;
  const { data } = await api.post('/graphql', { query });
  if (data.errors) throw new Error(data.errors[0].message);
  const searchTermLower = searchTerm.toLowerCase();
  return data.data.dispensaires.filter(dispensaire =>
    dispensaire.name.toLowerCase().includes(searchTermLower) ||
    dispensaire.organisation.name.toLowerCase().includes(searchTermLower)
  );
}

// --- Export harmonisé ---
export default {
  getAll,
  getById,
  create,
  update,
  remove,
  getByOrganisation,
  search,
};