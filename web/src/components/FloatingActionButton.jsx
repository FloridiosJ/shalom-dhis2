import React from 'react';
import styles from './FloatingActionButton.module.css';

const FloatingActionButton = ({ onClick, icon, label }) => {
  return (
    <button
      className={styles.fab}
      onClick={onClick}
      aria-label={label}
      type="button"
    >
      {icon || (
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      )}
    </button>
  );
};

export default FloatingActionButton;
