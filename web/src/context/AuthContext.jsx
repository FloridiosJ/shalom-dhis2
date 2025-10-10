import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth';

// ✅ Créer le contexte
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.initialize();
      
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Erreur initialisation auth:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (login, password) => {
    try {
      const result = await authService.login(login, password);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      }
      
      return { success: false, error: 'Connexion échouée' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    
    // Helpers
    isAdmin: () => authService.isAdmin(),
    isManager: () => authService.isManager(),
    isAgent: () => authService.isAgent(),
    getUserDisplayName: () => authService.getUserDisplayName(),
    getUserInitials: () => authService.getUserInitials(),
    getDispensaire: () => authService.getDispensaire(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Export par défaut aussi (optionnel)
export default AuthContext;