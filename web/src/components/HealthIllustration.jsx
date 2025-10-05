export function HealthIllustration() {
  return (
    <div style={{
      margin: '0 auto 3rem',
      width: '280px',
      height: '280px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg
        width="280"
        height="280"
        viewBox="0 0 280 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2))',
          animation: 'pulse 4s ease-in-out infinite'
        }}
      >
        {/* Fond circulaire */}
        <circle
          cx="140"
          cy="140"
          r="130"
          fill="rgba(255, 255, 255, 0.15)"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="2"
        />
        
        {/* Croix médicale principale */}
        <g transform="translate(140, 140)">
          {/* Croix de fond */}
          <rect
            x="-15"
            y="-50"
            width="30"
            height="100"
            rx="15"
            fill="white"
            opacity="0.9"
          />
          <rect
            x="-50"
            y="-15"
            width="100"
            height="30"
            rx="15"
            fill="white"
            opacity="0.9"
          />
          
          {/* Détails de la croix */}
          <rect
            x="-12"
            y="-45"
            width="24"
            height="90"
            rx="12"
            fill="#10b981"
          />
          <rect
            x="-45"
            y="-12"
            width="90"
            height="24"
            rx="12"
            fill="#10b981"
          />
        </g>

        {/* Icônes médicales autour */}
        {/* Stéthoscope */}
        <g transform="translate(80, 80)">
          <circle cx="0" cy="0" r="25" fill="rgba(255, 255, 255, 0.2)" />
          <path
            d="M-10 -5 Q-10 -15 0 -15 Q10 -15 10 -5 L10 5 Q10 10 5 10 L-5 10 Q-10 10 -10 5 Z"
            fill="white"
            opacity="0.8"
          />
          <circle cx="0" cy="12" r="3" fill="white" opacity="0.8" />
        </g>

        {/* Cœur */}
        <g transform="translate(200, 80)">
          <circle cx="0" cy="0" r="25" fill="rgba(255, 255, 255, 0.2)" />
          <path
            d="M0 8 Q-8 -2 -12 -8 Q-16 -12 -12 -16 Q-8 -20 -4 -16 L0 -12 L4 -16 Q8 -20 12 -16 Q16 -12 12 -8 Q8 -2 0 8 Z"
            fill="#ef4444"
            opacity="0.9"
          />
        </g>

        {/* Pilule */}
        <g transform="translate(80, 200)">
          <circle cx="0" cy="0" r="25" fill="rgba(255, 255, 255, 0.2)" />
          <ellipse cx="0" cy="0" rx="8" ry="12" fill="white" opacity="0.8" />
          <rect x="-8" y="-2" width="16" height="4" fill="#3b82f6" opacity="0.8" />
        </g>

        {/* Graphique */}
        <g transform="translate(200, 200)">
          <circle cx="0" cy="0" r="25" fill="rgba(255, 255, 255, 0.2)" />
          <rect x="-10" y="8" width="4" height="8" fill="white" opacity="0.8" />
          <rect x="-3" y="4" width="4" height="12" fill="white" opacity="0.8" />
          <rect x="4" y="0" width="4" height="16" fill="white" opacity="0.8" />
          <polyline
            points="-8,10 -1,6 6,2"
            stroke="#10b981"
            strokeWidth="2"
            fill="none"
            opacity="0.8"
          />
        </g>

        {/* Particules flottantes */}
        <circle cx="60" cy="140" r="3" fill="white" opacity="0.6" />
        <circle cx="220" cy="140" r="2" fill="white" opacity="0.4" />
        <circle cx="140" cy="60" r="2" fill="white" opacity="0.5" />
        <circle cx="140" cy="220" r="3" fill="white" opacity="0.3" />
      </svg>
    </div>
  );
}