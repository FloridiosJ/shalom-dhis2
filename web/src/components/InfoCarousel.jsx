import { useState } from 'react';

export function InfoCarousel() {
  const stats = [
    { label: 'Patients traités', value: '50,247', color: '#10b981' },
    { label: 'Dispensaires connectés', value: '25', color: '#3b82f6' },
    { label: 'Uptime système', value: '99.8%', color: '#f59e0b' },
    { label: 'Rapports générés', value: '1,234', color: '#8b5cf6' }
  ];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Éléments décoratifs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '100px',
        height: '100px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '15%',
        width: '60px',
        height: '60px',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }}></div>

      {/* Contenu principal */}
      <div style={{
        maxWidth: '500px',
        textAlign: 'center',
        zIndex: 1,
        width: '100%'
      }}>
        {/* Icône */}
        <div style={{
          marginBottom: '2rem',
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>

        {/* Titre */}
        <h2 style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          lineHeight: '1.2'
        }}>
          Performance exceptionnelle
        </h2>

        {/* Grille des statistiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {stats.map((stat, index) => (
            <div key={index} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'transform 0.2s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
            >
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: stat.color
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.875rem',
                opacity: 0.9
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badge */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '30px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(15px)',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        zIndex: 10
      }}>
        📊 Statistiques
      </div>

      {/* CSS pour l'animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>
    </div>
  );
}