import React from 'react';
import styles from './ChartCard.module.css';

/**
 * Carte de graphique
 */
const ChartCard = ({ title, children, actions }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default ChartCard;