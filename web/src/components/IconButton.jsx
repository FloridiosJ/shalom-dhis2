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
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.99967 14.3334L2.99967 11L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.7235 1.72394C5.97353 1.47389 6.31263 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47389 10.2758 1.72394C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6867 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
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
