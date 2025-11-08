import React from 'react';
import styles from './StatCard.module.css';
import Tooltip from './Tooltip';

/**
 * Carte de statistique
 */
const StatCard = ({ title, value, icon, color = 'blue', trend, subtitle, tooltip, loading = false }) => {
  const cardContent = (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          <span className={styles.icon}>{icon}</span>
        </div>
        {trend && !loading && (
          <div 
            className={`${styles.trend} ${trend.isPositive ? styles.trendUp : styles.trendDown}`}
            role="status"
            aria-label={`Tendance ${trend.isPositive ? 'positive' : 'négative'}: ${trend.value}%`}
          >
            <span className={styles.trendIcon}>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.value} aria-live="polite">{value}</div>
        <div className={styles.title}>{title}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip text={tooltip} position="top">
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
};

export default StatCard;