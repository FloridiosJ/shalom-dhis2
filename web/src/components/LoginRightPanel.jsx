import { InfoCarousel } from './InfoCarousel';

export function LoginRightPanel() {
  return (
    <div style={{
      flex: '1',
      display: window.innerWidth < 1024 ? 'none' : 'flex',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Carrousel d'informations */}
      <InfoCarousel />
      
      {/* Logo en overlay en haut */}
      <div style={{
        position: 'absolute',
        top: '30px',
        right: '30px',
        zIndex: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '0.75rem 1.5rem',
        borderRadius: '50px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(45deg, #3b82f6, #10b981)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              DHIS2 Shalom
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Système de Santé
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}