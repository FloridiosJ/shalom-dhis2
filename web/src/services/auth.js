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

// Auth service methods
export const authService = {
  async login(email, password) {
    const mutation = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
          user {
            id
            email
            role
          }
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query: mutation,
      variables: { email, password }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    const { token, user } = data.data.login;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token, user };
  },

  async register(userData) {
    const mutation = `
      mutation Register($email: String!, $password: String!, $role: String) {
        register(email: $email, password: $password, role: $role) {
          id
          email
          role
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query: mutation,
      variables: userData
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.register;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};