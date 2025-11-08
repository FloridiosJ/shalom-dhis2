import React from 'react';
import DiamondIcon from './DiamondIcon';
import styles from './AppHeader.module.css';

const AppHeader = ({ title = 'SDC Shalom' }) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoContainer}>
          <DiamondIcon />
          <h1 className={styles.title}>
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
