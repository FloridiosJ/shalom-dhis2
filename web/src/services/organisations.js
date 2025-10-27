import apiClient, { handleGraphQLResponse } from './apiClient';

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

    const response = await apiClient.post('/graphql', { query });
    const data = handleGraphQLResponse(response);
    return data.organisations;
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

    const response = await apiClient.post('/graphql', {
      query,
      variables: { id }
    });
    const data = handleGraphQLResponse(response);
    return data.organisation;
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

    const response = await apiClient.post('/graphql', {
      query: mutation,
      variables: { input: organisationData }
    });
    const data = handleGraphQLResponse(response);
    return data.createOrganisation;
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

    const response = await apiClient.post('/graphql', {
      query: mutation,
      variables: { id, input: organisationData }
    });
    const data = handleGraphQLResponse(response);
    return data.updateOrganisation;
  },

  // Delete organisation
  async remove(id) {
    const mutation = `
      mutation DeleteOrganisation($id: ID!) {
        deleteOrganisation(id: $id)
      }
    `;

    const response = await apiClient.post('/graphql', {
      query: mutation,
      variables: { id }
    });
    const data = handleGraphQLResponse(response);
    return data.deleteOrganisation;
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

    const response = await apiClient.post('/graphql', {
      query,
      variables: { type }
    });
    const data = handleGraphQLResponse(response);
    // Filter by type on client side (since GraphQL schema might not support filtering)
    return data.organisations.filter(org => org.type === type);
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

    const response = await apiClient.post('/graphql', { query });
    const data = handleGraphQLResponse(response);

    // Build hierarchy tree
    const organisations = data.organisations;
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