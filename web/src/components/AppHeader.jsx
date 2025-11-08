import React from 'react';
import styles from './AppHeader.module.css';

const AppHeader = ({ title = 'SDC Shalom' }) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>
          {title}
        </h1>
      </div>
    </div>
  );
};

export default AppHeader;
