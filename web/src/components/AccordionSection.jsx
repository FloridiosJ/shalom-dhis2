import React, { useState } from 'react';
import styles from './AccordionSection.module.css';

const AccordionSection = ({ 
  title, 
  icon, 
  summary, 
  isActive, 
  onClick, 
  children,
  badge,
  isExpanded,
  onToggle
}) => {
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
  };

  const handleClick = () => {
    onClick();
  };

  return (
    <div 
      className={`${styles.accordion} ${isActive ? styles.active : ''}`}
      role="region"
      aria-label={title}
    >
      <button
        className={styles.header}
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-controls={`accordion-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        type="button"
      >
        <div className={styles.headerContent}>
          <span className={styles.icon} aria-hidden="true">{icon}</span>
          <span className={styles.title}>{title}</span>
          {badge && <span className={styles.badge}>{badge}</span>}
        </div>
        <svg 
          className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
          width="20" 
          height="20" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div 
          id={`accordion-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className={styles.content}
          role="region"
        >
          {summary && (
            <div className={styles.summary}>
              {summary}
            </div>
          )}
          <button
            className={styles.viewButton}
            onClick={handleClick}
            type="button"
            aria-label={`Voir ${title} en détail`}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Voir en grand
          </button>
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionSection;
