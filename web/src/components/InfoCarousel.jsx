import { useState } from 'react';

export function InfoCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Chiffres clés
    {
      type: 'stats',
      icon: (
        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Performance exceptionnelle',
      content: [
        { label: 'Patients traités', value: '50,247', color: '#10b981' },
        { label: 'Dispensaires connectés', value: '25', color: '#3b82f6' },
        { label: 'Uptime système', value: '99.8%', color: '#f59e0b' },
        { label: 'Rapports générés', value: '1,234', color: '#8b5cf6' }
      ],
      bgColor: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)'
    },
    

    {
      type: 'health',
      icon: (
        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      title: 'Vaccination COVID-19',
      subtitle: 'Campagne de rappel en cours',
      content: [
        '💉 Vaccination gratuite dans tous nos centres',
        '📅 Prise de RDV en ligne disponible',
        '👥 Vaccination ouverte à tous les âges',
        '📋 Certificat numérique délivré immédiatement'
      ],
      bgColor: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },

    // Nouveautés
    {
      type: 'news',
      icon: (
        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Nouvelles fonctionnalités',
      subtitle: 'Version 2.4 - Octobre 2024',
      content: [
        '📱 Application mobile pour les agents de terrain',
        '📊 Tableaux de bord interactifs améliorés',
        '🔔 Système d\'alertes en temps réel',
        '🌐 Interface multilingue (Fr/Mg/En)'
      ],
      bgColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
  ];

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const renderSlideContent = (slide) => {
    if (slide.type === 'stats') {
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {slide.content.map((stat, index) => (
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
      );
    }

    return (
      <div style={{
        marginTop: '2rem'
      }}>
        {slide.subtitle && (
          <div style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            opacity: 0.9,
            marginBottom: '1.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '25px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            {slide.subtitle}
          </div>
        )}
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {slide.content.map((item, index) => (
            <div key={index} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.2s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateX(5px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateX(0px)'}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Slides */}
      <div style={{
        display: 'flex',
        transform: `translateX(-${currentSlide * 100}%)`,
        transition: 'transform 0.5s ease-in-out',
        width: `${slides.length * 100}%`,
        height: '100%'
      }}>
        {slides.map((slide, index) => (
          <div key={index} style={{
            width: '100%',
            background: slide.bgColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Éléments décoratifs pour chaque slide */}
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

            {/* Contenu du slide */}
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
                {slide.icon}
              </div>

              {/* Titre */}
              <h2 style={{
                fontSize: '2.25rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                lineHeight: '1.2'
              }}>
                {slide.title}
              </h2>

              {/* Contenu */}
              {renderSlideContent(slide)}
            </div>
          </div>
        ))}
      </div>

      {/* Boutons de navigation */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '20px',
        transform: 'translateY(-50%)',
        zIndex: 10
      }}>
        <button
          onClick={prevSlide}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div style={{
        position: 'absolute',
        top: '50%',
        right: '20px',
        transform: 'translateY(-50%)',
        zIndex: 10
      }}>
        <button
          onClick={nextSlide}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Indicateurs de pagination */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '0.75rem',
        zIndex: 10
      }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: currentSlide === index ? '30px' : '12px',
              height: '12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: currentSlide === index 
                ? 'rgba(255, 255, 255, 0.9)' 
                : 'rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              if (currentSlide !== index) {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentSlide !== index) {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
              }
            }}
          />
        ))}
      </div>

      {/* Badge du type de slide */}
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
        {slides[currentSlide]?.type === 'stats' && '📊 Statistiques'}
        {slides[currentSlide]?.type === 'health' && '💊 Santé Publique'}
        {slides[currentSlide]?.type === 'news' && '🚀 Nouveautés'}
      </div>
    </div>
  );
}