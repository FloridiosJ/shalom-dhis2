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

const userFields = `
  id
  fullName
  nom
  prenom
  email
  login
  role
  specialite
  dispensaire {
    id
    name
  }
  isActive
`;

// 1. Liste des utilisateurs
async function getAll() {
  const query = `
    query users {
      users {
        users {
          ${userFields}
        }
      }
    }
  `;
  const response = await client.post('', { query });
  // Retourne la vraie liste
  return handleGraphQLErrors(response).users.users;
}

// 2. Détail utilisateur
async function getById(id) {
  const query = `
    query userById($id: ID!) {
      user(id: $id) {
        ${userFields}
      }
    }
  `;
  const variables = { id };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).user;
}

// 3. Création utilisateur
async function create(userData) {
  const mutation = `
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        success
        errors
        user {
          ${userFields}
        }
      }
    }
  `;
  const variables = { input: userData };
  const response = await client.post('', { query: mutation, variables });
  return handleGraphQLErrors(response).createUser;
}

// 4. Mise à jour utilisateur
async function update(id, userData) {
  const mutation = `
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
      updateUser(id: $id, input: $input) {
        success
        errors
        user {
          ${userFields}
        }
      }
    }
  `;
  const variables = { id, input: userData };
  const response = await client.post('', { query: mutation, variables });
  return handleGraphQLErrors(response).updateUser;
}

// 5. Suppression utilisateur
async function remove(id) {
  const mutation = `
    mutation DeleteUser($id: ID!) {
      deleteUser(id: $id) {
        success
        errors
      }
    }
  `;
  const variables = { id };
  const response = await client.post('', { query: mutation, variables });
  return handleGraphQLErrors(response).deleteUser;
}

// 6. Changement de mot de passe
async function changePassword(id, newPassword) {
  const mutation = `
    mutation ChangeUserPassword($id: ID!, $newPassword: String!) {
      changeUserPassword(id: $id, newPassword: $newPassword) {
        success
        errors
      }
    }
  `;
  const variables = { id, newPassword };
  const response = await client.post('', { query: mutation, variables });
  return handleGraphQLErrors(response).changeUserPassword;
}

// 7. Activation/désactivation utilisateur
async function toggleStatus(id) {
  const mutation = `
    mutation ToggleUserStatus($id: ID!) {
      toggleUserStatus(id: $id) {
        success
        errors
        user {
          ${userFields}
        }
      }
    }
  `;
  const variables = { id };
  const response = await client.post('', { query: mutation, variables });
  return handleGraphQLErrors(response).toggleUserStatus;
}

// 8. Recherche utilisateur
async function search(queryStr, role) {
  const query = `
    query SearchUsers($query: String!, $role: String) {
      searchUsers(query: $query, role: $role) {
        ${userFields}
      }
    }
  `;
  const variables = { query: queryStr, role };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).searchUsers;
}

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  changePassword,
  toggleStatus,
  search,
};