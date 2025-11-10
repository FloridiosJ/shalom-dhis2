import React from 'react';
import styles from './ModalTitle.module.css';

/**
 * ModalTitle - Reusable modal title with optional icon
 * @param {Object} props
 * @param {string} props.title - Main title text
 * @param {string} props.subtitle - Optional subtitle text
 * @param {React.ReactNode} props.icon - Optional icon element
 */
const ModalTitle = ({ title, subtitle, icon }) => {
  return (
    <div className={styles.titleContainer}>
      <h2 className={styles.title}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {title}
      </h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
};

export default ModalTitle;
