import { gql } from '@apollo/client';
import client from './apolloClient';

// ✅ Configuration
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  isDevelopment: import.meta.env.DEV,
};

// Vos mutations et queries restent identiques...
const LOGIN_MUTATION = gql`
  mutation Login($login: String!, $password: String!) {
    login(input: { login: $login, password: $password }) {
      token
      user {
        id
        email
        role
        nom
        prenom
        fullName
        login
        dispensaire {
          id
          name
          code
        }
      }
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

// ✅ Query pour récupérer l'utilisateur actuel
const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      role
      nom
      prenom
      fullName
      login
      dispensaire {
        id
        name
        code
      }
    }
  }
`;

class AuthService {
  constructor() {
    this.tokenKey = 'auth-token';
    this.userKey = 'auth-user';
  }

  // ✅ Connexion avec le nouveau format
  async login(login, password) {
    try {
      console.log('🔄 Tentative de connexion:', { login });
      
      const { data } = await client.mutate({
        mutation: LOGIN_MUTATION,
        variables: { login, password }
      });

      if (data?.login?.token) {
        const { token, user } = data.login;
        
        // Stocker le token et les données utilisateur
        this.setToken(token);
        this.setUser(user);
        
        console.log('✅ Connexion réussie:', {
          userId: user.id,
          fullName: user.fullName,
          role: user.role,
          dispensaire: user.dispensaire?.name
        });
        
        return { success: true, token, user };
      } else {
        throw new Error('Réponse de connexion invalide');
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      
      // Gestion des erreurs GraphQL
      if (error.graphQLErrors?.length > 0) {
        const graphQLError = error.graphQLErrors[0];
        throw new Error(graphQLError.message || 'Erreur de connexion');
      }
      
      // Gestion des erreurs réseau
      if (error.networkError) {
        throw new Error('Erreur de connexion au serveur');
      }
      
      throw new Error(error.message || 'Erreur de connexion inconnue');
    }
  }

  // ✅ Déconnexion
  async logout() {
    try {
      await client.mutate({
        mutation: LOGOUT_MUTATION
      });
    } catch (error) {
      console.warn('⚠️ Erreur lors de la déconnexion serveur:', error.message);
    } finally {
      // Nettoyer le stockage local même si la déconnexion serveur échoue
      this.clearAuth();
      
      // Reset du cache Apollo
      await client.resetStore();
      
      console.log('✅ Déconnexion locale effectuée');
    }
  }

  // ✅ Vérifier et récupérer l'utilisateur actuel
  async getCurrentUser() {
    try {
      if (!this.getToken()) {
        return null;
      }

      const { data } = await client.query({
        query: GET_CURRENT_USER,
        fetchPolicy: 'network-only' // Toujours récupérer les données fraîches
      });

      if (data?.me) {
        // Mettre à jour les données utilisateur stockées
        this.setUser(data.me);
        return data.me;
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      
      // Si le token est invalide, nettoyer l'auth
      if (error.networkError?.statusCode === 401 || 
          error.graphQLErrors?.some(e => e.extensions?.code === 'UNAUTHENTICATED')) {
        this.clearAuth();
      }
      
      return null;
    }
  }

  // ✅ Gestion du token
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
    
    // Mettre à jour le header Apollo
    client.setLink(
      client.link.concat({
        request: (operation) => {
          operation.setContext({
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            }
          });
        }
      })
    );
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  removeToken() {
    localStorage.removeItem(this.tokenKey);
  }

  // ✅ Gestion des données utilisateur
  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser() {
    const userData = localStorage.getItem(this.userKey);
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Erreur parsing user data:', error);
      this.removeUser();
      return null;
    }
  }

  removeUser() {
    localStorage.removeItem(this.userKey);
  }

  // ✅ Nettoyer toute l'authentification
  clearAuth() {
    this.removeToken();
    this.removeUser();
  }

  // ✅ Vérifications d'état
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  isAdmin() {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  isManager() {
    const user = this.getUser();
    return ['admin', 'manager'].includes(user?.role);
  }

  isAgent() {
    const user = this.getUser();
    return user?.role === 'agent';
  }

  // ✅ Helpers pour l'affichage
  getUserDisplayName() {
    const user = this.getUser();
    return user?.fullName || `${user?.prenom || ''} ${user?.nom || ''}`.trim() || user?.email || 'Utilisateur';
  }

  getUserInitials() {
    const user = this.getUser();
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  }

  getDispensaire() {
    const user = this.getUser();
    return user?.dispensaire || null;
  }

  // ✅ Initialisation au chargement de l'app
  async initialize() {
    try {
      const token = this.getToken();
      if (token) {
        // Vérifier que le token est encore valide
        const user = await this.getCurrentUser();
        return user;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur initialisation auth:', error);
      this.clearAuth();
      return null;
    }
  }
}

// ✅ Export d'une instance singleton
export default new AuthService();