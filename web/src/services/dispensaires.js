import apiClient, { handleGraphQLResponse } from './apiClient';

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
  const response = await apiClient.post('/graphql', { query });
  const data = handleGraphQLResponse(response);
  return data.dispensaires.dispensaires;
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
  const response = await apiClient.post('/graphql', { query, variables: { id } });
  const data = handleGraphQLResponse(response);
  return data.dispensaire;
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
  const response = await apiClient.post('/graphql', { query: mutation, variables: { input: dispensaireData } });
  const data = handleGraphQLResponse(response);
  return data.createDispensaire.dispensaire;
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
  const response = await apiClient.post('/graphql', {
    query: mutation,
    variables: { id, input }
  });
  const data = handleGraphQLResponse(response);
  return data.updateDispensaire;
}

async function remove(id) {
  const mutation = `
    mutation DeleteDispensaire($id: ID!) {
      deleteDispensaire(id: $id) {
        success
        errors
        message
      }
    }
  `;
  const variables = { id };
  const response = await apiClient.post('/graphql', { query: mutation, variables });
  const data = handleGraphQLResponse(response);
  return data.deleteDispensaire;
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
  const response = await apiClient.post('/graphql', { query, variables: { organisationId } });
  const data = handleGraphQLResponse(response);
  return data.dispensaires.filter(
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
  const response = await apiClient.post('/graphql', { query });
  const data = handleGraphQLResponse(response);
  const searchTermLower = searchTerm.toLowerCase();
  return data.dispensaires.filter(dispensaire =>
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