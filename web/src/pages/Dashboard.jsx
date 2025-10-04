import { useAuth } from '../hooks/useAuth';

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '1rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            Tableau de bord
          </h1>
          <button
            onClick={logout}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Déconnexion
          </button>
        </div>

        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>
            Bienvenue, {user?.email}
          </h3>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Rôle: {user?.role}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            backgroundColor: '#dbeafe',
            padding: '1.5rem',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#1e40af', marginBottom: '0.5rem' }}>
              Organisations
            </h3>
            <p style={{ color: '#374151' }}>
              Gérer les organisations et la hiérarchie
            </p>
          </div>

          <div style={{
            backgroundColor: '#d1fae5',
            padding: '1.5rem',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#059669', marginBottom: '0.5rem' }}>
              Dispensaires
            </h3>
            <p style={{ color: '#374151' }}>
              Gérer les dispensaires et centres de santé
            </p>
          </div>

          <div style={{
            backgroundColor: '#fef3c7',
            padding: '1.5rem',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#d97706', marginBottom: '0.5rem' }}>
              Données
            </h3>
            <p style={{ color: '#374151' }}>
              Saisie et consultation des données
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}