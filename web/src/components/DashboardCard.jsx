import React from 'react';
import styles from './DashboardCard.module.css';

const DashboardCard = ({ 
  title, 
  subtitle, 
  description, 
  icon, 
  color = 'blue', 
  onClick 
}) => {
  return (
    <div 
      className={`${styles.card} ${styles[color]}`}
      onClick={onClick}
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconContainer}>
          {icon}
        </div>
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.cardSubtitle}>{subtitle}</p>
        </div>
      </div>
      <p className={styles.cardDescription}>{description}</p>
    </div>
  );
};

export default DashboardCard;