import axios from 'axios';

// Constants
const AUTH_TOKEN_KEY = 'auth-token';

// Create shared axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

// Add token to requests if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to handle GraphQL errors
export const handleGraphQLResponse = (response) => {
  const data = response.data;
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }
  return data.data;
};

export { AUTH_TOKEN_KEY };
export default apiClient;
