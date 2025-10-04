import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Dispensaire service methods
export const dispensaireService = {
  // Get all dispensaires
  async getAll() {
    const query = `
      query GetDispensaires {
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

    const { data } = await api.post('/graphql', {
      query
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.dispensaires;
  },

  // Get dispensaire by ID
  async getById(id) {
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

    const { data } = await api.post('/graphql', {
      query,
      variables: { id }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.dispensaire;
  },

  // Create new dispensaire
  async create(dispensaireData) {
    const mutation = `
      mutation CreateDispensaire($input: CreateDispensaireInput!) {
        createDispensaire(input: $input) {
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

    const { data } = await api.post('/graphql', {
      query: mutation,
      variables: { input: dispensaireData }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.createDispensaire;
  },

  // Update dispensaire
  async update(id, dispensaireData) {
    const mutation = `
      mutation UpdateDispensaire($id: ID!, $input: UpdateDispensaireInput!) {
        updateDispensaire(id: $id, input: $input) {
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

    const { data } = await api.post('/graphql', {
      query: mutation,
      variables: { id, input: dispensaireData }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.updateDispensaire;
  },

  // Delete dispensaire
  async remove(id) {
    const mutation = `
      mutation DeleteDispensaire($id: ID!) {
        deleteDispensaire(id: $id)
      }
    `;

    const { data } = await api.post('/graphql', {
      query: mutation,
      variables: { id }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.deleteDispensaire;
  },

  // Get dispensaires by organisation
  async getByOrganisation(organisationId) {
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

    const { data } = await api.post('/graphql', {
      query,
      variables: { organisationId }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    // Filter by organisation on client side
    return data.data.dispensaires.filter(
      dispensaire => dispensaire.organisationId === organisationId
    );
  },

  // Search dispensaires
  async search(searchTerm) {
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

    const { data } = await api.post('/graphql', {
      query
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    // Search on client side
    const searchTermLower = searchTerm.toLowerCase();
    return data.data.dispensaires.filter(dispensaire =>
      dispensaire.name.toLowerCase().includes(searchTermLower) ||
      dispensaire.organisation.name.toLowerCase().includes(searchTermLower)
    );
  }
};