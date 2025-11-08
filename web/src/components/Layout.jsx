import React, { createContext, useContext, useState } from 'react';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

// Create context for sidebar collapse state
const SidebarContext = createContext();

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within SidebarProvider');
  }
  return context;
};

/**
 * Layout component that provides consistent page structure
 * with sidebar navigation and header across all pages
 */
const Layout = ({ children, title }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className={styles.layoutContainer}>
        <Sidebar />
        <div className={`${styles.mainContent} ${isCollapsed ? styles.collapsed : ''}`}>
          <AppHeader title={title} />
          <div className={styles.pageContent}>
            {children}
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Layout;
