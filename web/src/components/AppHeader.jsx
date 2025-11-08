import React from 'react';
import { useAuth } from '../hooks/useAuth';
import DiamondIcon from './DiamondIcon';
import { LogoutIcon } from './DashboardIcons';
import styles from './AppHeader.module.css';

const AppHeader = ({ title = 'SDC Shalom' }) => {
  const { logout } = useAuth();

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoContainer}>
          <DiamondIcon />
          <h1 className={styles.title}>
            {title}
          </h1>
        </div>
        
        <button
          onClick={logout}
          className={styles.logoutButton}
        >
          <LogoutIcon />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default AppHeader;
