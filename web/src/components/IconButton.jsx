import React from 'react';
import styles from './IconButton.module.css';

/**
 * IconButton component for action buttons with icons
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {'edit'|'delete'} props.variant - Button variant
 * @param {string} props.ariaLabel - Accessibility label
 * @param {boolean} props.disabled - Disabled state
 */
const IconButton = ({ onClick, variant = 'edit', ariaLabel, disabled = false }) => {
  const getIcon = () => {
    if (variant === 'edit') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m5 0H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${styles.iconButton} ${styles[variant]}`}
    >
      {getIcon()}
    </button>
  );
};

export default IconButton;
