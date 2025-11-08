import React from 'react';
import styles from './BadgeStatus.module.css';

/**
 * BadgeStatus component for displaying user status
 * @param {Object} props
 * @param {boolean} props.isActive - Active status
 * @param {string} props.activeText - Text for active status (default: 'Actif')
 * @param {string} props.inactiveText - Text for inactive status (default: 'Inactif')
 */
const BadgeStatus = ({ isActive, activeText = 'Actif', inactiveText = 'Inactif' }) => {
  return (
    <span 
      className={`${styles.badge} ${isActive ? styles.active : styles.inactive}`}
      role="status"
      aria-label={isActive ? activeText : inactiveText}
    >
      {isActive ? activeText : inactiveText}
    </span>
  );
};

export default BadgeStatus;
