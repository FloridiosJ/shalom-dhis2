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

// Organisation service methods
export const organisationService = {
  // Get all organisations
  async getAll() {
    const query = `
      query GetOrganisations {
        organisations {
          id
          name
          type
          parentId
          children {
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

    return data.data.organisations;
  },

  // Get organisation by ID
  async getById(id) {
    const query = `
      query GetOrganisation($id: ID!) {
        organisation(id: $id) {
          id
          name
          type
          parentId
          children {
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

    return data.data.organisation;
  },

  // Create new organisation
  async create(organisationData) {
    const mutation = `
      mutation CreateOrganisation($input: CreateOrganisationInput!) {
        createOrganisation(input: $input) {
          id
          name
          type
          parentId
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query: mutation,
      variables: { input: organisationData }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.createOrganisation;
  },

  // Update organisation
  async update(id, organisationData) {
    const mutation = `
      mutation UpdateOrganisation($id: ID!, $input: UpdateOrganisationInput!) {
        updateOrganisation(id: $id, input: $input) {
          id
          name
          type
          parentId
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query: mutation,
      variables: { id, input: organisationData }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.updateOrganisation;
  },

  // Delete organisation
  async remove(id) {
    const mutation = `
      mutation DeleteOrganisation($id: ID!) {
        deleteOrganisation(id: $id)
      }
    `;

    const { data } = await api.post('/graphql', {
      query: mutation,
      variables: { id }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.deleteOrganisation;
  },

  // Get organisations by type
  async getByType(type) {
    const query = `
      query GetOrganisationsByType($type: OrganisationType!) {
        organisations {
          id
          name
          type
          parentId
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query,
      variables: { type }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    // Filter by type on client side (since GraphQL schema might not support filtering)
    return data.data.organisations.filter(org => org.type === type);
  },

  // Get organisation hierarchy (parent with all children)
  async getHierarchy(parentId = null) {
    const query = `
      query GetOrganisationHierarchy {
        organisations {
          id
          name
          type
          parentId
          children {
            id
            name
            type
            children {
              id
              name
              type
            }
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

    // Build hierarchy tree
    const organisations = data.data.organisations;
    const buildTree = (parentId) => {
      return organisations
        .filter(org => org.parentId === parentId)
        .map(org => ({
          ...org,
          children: buildTree(org.id)
        }));
    };

    return buildTree(parentId);
  }
};