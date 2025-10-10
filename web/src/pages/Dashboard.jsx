import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () =>  {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '0'
    }}>
      {/* Header fixe */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem 2rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            DHIS2 Shalom - Tableau de bord
          </h1>
          
          <button
            onClick={logout}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#b91c1c';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#dc2626';
              e.target.style.transform = 'translateY(0px)';
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Bannière utilisateur */}
      <div style={{
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        color: 'white'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            Bienvenue, {user?.email}
          </h2>
          <p style={{ 
            fontSize: '1rem',
            opacity: 0.9,
            margin: 0
          }}>
            Rôle: {user?.role} • Système de gestion de santé
          </p>
        </div>
      </div>

      {/* Grille des cartes - Centrée */}
      <div style={{
        width: '100%',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 400px))', // Largeur fixe max pour centrage
          gap: '2rem',
          justifyContent: 'center', // Centre la grille
          width: '100%',
          maxWidth: '1400px', // Largeur maximale du conteneur
          boxSizing: 'border-box'
        }}>
          {/* Carte Organisations */}
          <div 
            onClick={() => navigate('/organisations')}
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderLeft: '6px solid #3b82f6',
              width: '100%',
              minHeight: '200px',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.15)';
              e.target.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              e.target.style.borderColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                backgroundColor: '#dbeafe',
                padding: '1rem',
                borderRadius: '12px',
                marginRight: '1rem',
                flexShrink: 0
              }}>
                <svg width="28" height="28" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#1f2937', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                  Organisations
                </h3>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                  Module principal
                </p>
              </div>
            </div>
            <p style={{ color: '#374151', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
              Gérer les organisations, la hiérarchie administrative et les unités organisationnelles du système de santé
            </p>
          </div>

          {/* Carte Dispensaires */}
          <div 
            onClick={() => navigate('/dispensaires')}
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderLeft: '6px solid #10b981',
              width: '100%',
              minHeight: '200px',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.15)';
              e.target.style.borderColor = '#10b981';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              e.target.style.borderColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                backgroundColor: '#d1fae5',
                padding: '1rem',
                borderRadius: '12px',
                marginRight: '1rem',
                flexShrink: 0
              }}>
                <svg width="28" height="28" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#1f2937', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                  Dispensaires
                </h3>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                  Centres de santé
                </p>
              </div>
            </div>
            <p style={{ color: '#374151', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
              Gérer les dispensaires, centres de santé communautaires et établissements de soins de santé primaire
            </p>
          </div>

          {/* Carte Données */}
          <div 
            onClick={() => navigate('/data-entries')}
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderLeft: '6px solid #f59e0b',
              width: '100%',
              minHeight: '200px',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 20px 40px rgba(245, 158, 11, 0.15)';
              e.target.style.borderColor = '#f59e0b';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              e.target.style.borderColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                backgroundColor: '#fef3c7',
                padding: '1rem',
                borderRadius: '12px',
                marginRight: '1rem',
                flexShrink: 0
              }}>
                <svg width="28" height="28" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#1f2937', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                  Saisie de données
                </h3>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                  Collecte et analyse
                </p>
              </div>
            </div>
            <p style={{ color: '#374151', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
              Saisie, validation et consultation des données de santé, indicateurs et métriques de performance
            </p>
          </div>

          {/* Carte Rapports */}
          <div 
            onClick={() => navigate('/reports')}
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderLeft: '6px solid #ec4899',
              width: '100%',
              minHeight: '200px',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 20px 40px rgba(236, 72, 153, 0.15)';
              e.target.style.borderColor = '#ec4899';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              e.target.style.borderColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                backgroundColor: '#fce7f3',
                padding: '1rem',
                borderRadius: '12px',
                marginRight: '1rem',
                flexShrink: 0
              }}>
                <svg width="28" height="28" fill="none" stroke="#ec4899" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#1f2937', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                  Rapports & Analytics
                </h3>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                  Tableaux de bord
                </p>
              </div>
            </div>
            <p style={{ color: '#374151', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
              Générer des rapports personnalisés, visualisations de données et tableaux de bord analytiques
            </p>
          </div>

          {/* Carte Utilisateurs */}
          <div 
            onClick={() => navigate('/users')}
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderLeft: '6px solid #8b5cf6',
              width: '100%',
              minHeight: '200px',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.15)';
              e.target.style.borderColor = '#8b5cf6';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              e.target.style.borderColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                backgroundColor: '#ede9fe',
                padding: '1rem',
                borderRadius: '12px',
                marginRight: '1rem',
                flexShrink: 0
              }}>
                <svg width="28" height="28" fill="none" stroke="#8b5cf6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#1f2937', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                  Gestion des utilisateurs
                </h3>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                  Droits et permissions
                </p>
              </div>
            </div>
            <p style={{ color: '#374151', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
              Gérer les comptes utilisateurs, rôles, permissions et contrôle d'accès au système
            </p>
          </div>

          {/* Carte Configuration */}
          <div 
            onClick={() => navigate('/settings')}
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderLeft: '6px solid #6b7280',
              width: '100%',
              minHeight: '200px',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 20px 40px rgba(107, 114, 128, 0.15)';
              e.target.style.borderColor = '#6b7280';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              e.target.style.borderColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                backgroundColor: '#f3f4f6',
                padding: '1rem',
                borderRadius: '12px',
                marginRight: '1rem',
                flexShrink: 0
              }}>
                <svg width="28" height="28" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#1f2937', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                  Configuration système
                </h3>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                  Paramètres et maintenance
                </p>
              </div>
            </div>
            <p style={{ color: '#374151', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
              Configuration du système, paramètres généraux, maintenance et administration avancée
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;