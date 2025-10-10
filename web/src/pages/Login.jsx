import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/LoginForm'; // ✅ Import par défaut
import { LoginRightPanel } from '../components/LoginRightPanel';
import styles from './Login.module.css';

const Login = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (email, password) => {
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      setError(error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Logo en haut à droite */}
      <div className={styles.logo}>
        DHIS2 Shalom
      </div>

      {/* Panneau gauche - Formulaire */}
      <div className={styles.leftPanel}>
        <LoginForm 
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {/* Panneau droit - Statistiques */}
      <div className={styles.rightPanel}>
        <LoginRightPanel />
      </div>
    </div>
  );
};

// ✅ Export par défaut
export default Login;