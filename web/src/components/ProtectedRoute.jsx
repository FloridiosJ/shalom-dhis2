import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children, roles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Affichage de chargement amélioré
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{
          marginTop: '1rem',
          fontSize: '1rem',
          color: '#6b7280'
        }}>
          Vérification de l'authentification...
        </p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Redirection vers login si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification des rôles si spécifiés
  if (roles.length > 0 && (!user?.role || !roles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Rendu des enfants si tout est OK
  return children;
}