import React from 'react';
import styles from './Skeleton.module.css';

/**
 * Skeleton loader component for loading states
 */
const Skeleton = ({ 
  variant = 'text', // text, circular, rectangular
  width, 
  height, 
  className = '' 
}) => {
  const baseClass = styles.skeleton;
  const variantClass = styles[variant] || styles.text;
  
  const style = {
    width: width || undefined,
    height: height || undefined,
  };
  
  return (
    <div 
      className={`${baseClass} ${variantClass} ${className}`}
      style={style}
      role="status"
      aria-label="Loading..."
    />
  );
};

/**
 * Skeleton for StatCard
 */
export const StatCardSkeleton = () => {
  return (
    <div className={styles.statCardSkeleton}>
      <div className={styles.skeletonHeader}>
        <Skeleton variant="circular" width="48px" height="48px" />
        <Skeleton variant="rectangular" width="60px" height="24px" />
      </div>
      <div className={styles.skeletonContent}>
        <Skeleton variant="rectangular" width="80px" height="32px" />
        <Skeleton variant="text" width="120px" height="14px" />
        <Skeleton variant="text" width="100px" height="12px" />
      </div>
    </div>
  );
};

/**
 * Skeleton for ChartCard
 */
export const ChartSkeleton = ({ height = '400px' }) => {
  return (
    <div className={styles.chartSkeleton} style={{ height }}>
      <div className={styles.chartSkeletonHeader}>
        <Skeleton variant="text" width="200px" height="24px" />
        <Skeleton variant="rectangular" width="100px" height="36px" />
      </div>
      <div className={styles.chartSkeletonContent}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </div>
    </div>
  );
};

export default Skeleton;
