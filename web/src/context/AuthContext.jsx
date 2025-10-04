import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '@/services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = authService.getCurrentUser();
    const storedToken = localStorage.getItem('token');
    
    if (storedToken && storedUser) {
      setUser(storedUser);
      setToken(storedToken);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const { user: newUser, token: newToken } = await authService.login(email, password);
      setUser(newUser);
      setToken(newToken);
      return newUser;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}