import api from './api-client';

export const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const { data } = await api.post('/graphql', {
        query: `
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
        `,
        variables: { email, password }
      });

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const { token, user } = data.data.login;
      localStorage.setItem('token', token);
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const { data } = await api.post('/graphql', {
        query: `
          mutation Register($email: String!, $password: String!, $role: String) {
            register(email: $email, password: $password, role: $role) {
              id
              email
              role
            }
          }
        `,
        variables: userData
      });

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.register;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
  },

  // Get current auth status
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};