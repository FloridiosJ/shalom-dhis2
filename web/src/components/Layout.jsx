import React from 'react';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

/**
 * Layout component that provides consistent page structure
 * with sidebar navigation and header across all pages
 */
const Layout = ({ children, title }) => {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <AppHeader title={title} />
        <div className={styles.pageContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
