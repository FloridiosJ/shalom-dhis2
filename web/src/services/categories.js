import axios from "axios";

const API_URL = import.meta.env.VITE_GRAPHQL_ENDPOINT || '/graphql';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function handleGraphQLErrors(response) {
  if (response.data.errors) {
    const errorMsg = response.data.errors.map(e => e.message).join(', ');
    throw new Error(errorMsg || 'Erreur GraphQL');
  }
  return response.data.data;
}

// Récupérer toutes les catégories de maladies actives
async function getAll() {
  const query = `
    query CategoriesMaladies {
      categoriesMaladies(filter: { isActive: true }) {
        id
        nom
        code
        niveau
        ordre
        description
        parentId
      }
    }
  `;
  const response = await client.post('', { query });
  return handleGraphQLErrors(response).categoriesMaladies;
}

// Récupérer l'arbre hiérarchique des catégories
async function getTree() {
  const query = `
    query ArbreCategories {
      arbreCategories(activeOnly: true) {
        id
        nom
        code
        niveau
        ordre
        description
        sousCategories {
          id
          nom
          code
          niveau
          ordre
          description
        }
      }
    }
  `;
  const response = await client.post('', { query });
  return handleGraphQLErrors(response).arbreCategories;
}

// Récupérer uniquement les catégories principales (niveau 1)
async function getPrincipales() {
  const query = `
    query CategoriesPrincipales {
      categoriesPrincipales(activeOnly: true) {
        id
        nom
        code
        niveau
        ordre
        description
        sousCategories {
          id
          nom
          code
          niveau
          ordre
          description
        }
      }
    }
  `;
  const response = await client.post('', { query });
  return handleGraphQLErrors(response).categoriesPrincipales;
}

export default {
  getAll,
  getTree,
  getPrincipales,
};
