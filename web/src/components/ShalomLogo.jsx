import React from 'react';

const ShalomLogo = ({ width = 120, height = 40 }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg width={height} height={height} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dove icon */}
        <circle cx="20" cy="20" r="19" stroke="#3B4BA0" strokeWidth="1.5" fill="none"/>
        <path d="M20 12 C22 12, 24 13, 25 15 L28 18 C27 16, 25 15, 23 15 C21 15, 20 16, 20 17 C20 16, 19 15, 17 15 C15 15, 13 16, 12 18 L15 15 C16 13, 18 12, 20 12 Z" fill="#1F2937" stroke="#1F2937" strokeWidth="0.5"/>
        <ellipse cx="18" cy="16" rx="1" ry="1" fill="#1F2937"/>
        <ellipse cx="22" cy="16" rx="1" ry="1" fill="#1F2937"/>
        {/* Hands */}
        <path d="M12 25 C14 27, 16 28, 20 28 C24 28, 26 27, 28 25" stroke="#3B4BA0" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <circle cx="20" cy="22" r="2" fill="#DC2626" opacity="0.3"/>
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <span style={{ 
          fontSize: width / 5, 
          fontWeight: '700', 
          color: '#DC2626',
          letterSpacing: '1px'
        }}>
          S
        </span>
        <span style={{ 
          fontSize: width / 5, 
          fontWeight: '700', 
          color: '#DC2626',
          letterSpacing: '1px'
        }}>
          HALOM
        </span>
      </div>
    </div>
  );
};

export default ShalomLogo;
