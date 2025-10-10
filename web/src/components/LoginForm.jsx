import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useErrorMessage } from '../hooks/useErrorMessage';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const { error, showError, clearError } = useErrorMessage();

  // Rediriger si déjà connecté
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        showError(result.error || 'Erreur de connexion');
      }
    } catch (error) {
      showError(error.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@shalom-dhis2.org');
    setPassword('Admin123!');
    clearError();
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        {/* Icône de sécurité */}
        <div className={styles.iconContainer}>
          <div className={styles.securityIcon}>
            🛡️
          </div>
        </div>

        {/* En-tête */}
        <div className={styles.header}>
          <h1 className={styles.title}>Connexion</h1>
          <p className={styles.subtitle}>Accédez à votre espace DHIS2 Shalom</p>
        </div>

        {/* ✅ Zone d'erreur avec hauteur fixe réservée */}
        <div className={styles.errorContainer}>
          {error && (
            <div className={styles.errorMessage}>
              <svg 
                className={styles.errorIcon}
                fill="currentColor" 
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Champ Email */}
          <div className={styles.inputGroup}>
            <div className={styles.inputIcon}>👤</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              disabled={loading}
              className={styles.input}
              autoComplete="email"
            />
          </div>

          {/* Champ Mot de passe */}
          <div className={styles.inputGroup}>
            <div className={styles.inputIcon}>🔒</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
              disabled={loading}
              className={styles.input}
              autoComplete="current-password"
            />
          </div>

          {/* Bouton de connexion */}
          <button 
            type="submit" 
            disabled={loading || !email.trim() || !password}
            className={styles.button}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Bloc compte de démonstration */}
        <div className={styles.demoBlock}>
          <div className={styles.demoHeader}>
            <span>🧪</span>
            <span>Compte de démonstration</span>
          </div>
          
          <div className={styles.demoCredentials}>
            <div className={styles.credentialItem}>
              <span className={styles.credentialLabel}>Email:</span>
              <span className={styles.credentialValue}>admin@shalom-dhis2.org</span>
            </div>
            <div className={styles.credentialItem}>
              <span className={styles.credentialLabel}>Mot de passe:</span>
              <span className={styles.credentialValue}>Admin123!</span>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={fillDemoCredentials}
            disabled={loading}
            className={styles.button}
            style={{ 
              marginTop: '1rem', 
              background: loading ? '#94a3b8' : '#10b981',
              fontSize: '0.875rem',
              padding: '0.75rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Utiliser ces identifiants
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;