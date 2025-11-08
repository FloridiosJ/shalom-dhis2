import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSidebarContext } from './Layout';
import styles from './Sidebar.module.css';

// SVG Icons as components
const HomeIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
  </svg>
);

const PatientIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const DispensaireIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ConsultationIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ReportIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SupportIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isCollapsed, setIsCollapsed } = useSidebarContext();
  const [isOpen, setIsOpen] = useState(false);

  // Sync local collapsed state with context
  useEffect(() => {
    // This ensures the Layout knows about the collapsed state
  }, [isCollapsed]);

  // Define navigation items with role-based access
  const navigationItems = [
    { path: '/dashboard', label: 'Accueil', icon: <HomeIcon />, roles: ['admin', 'manager', 'agent'] },
    { path: '/patients', label: 'Patients', icon: <PatientIcon />, roles: ['admin', 'manager', 'agent'] },
    { path: '/dispensaires', label: 'Dispensaires', icon: <DispensaireIcon />, roles: ['admin', 'manager'] },
    { path: '/data-entries', label: 'Consultations', icon: <ConsultationIcon />, roles: ['admin', 'manager', 'agent'] },
    { path: '/reports', label: 'Rapports', icon: <ReportIcon />, roles: ['admin', 'manager'] },
    { path: '/users', label: 'Utilisateurs', icon: <UserIcon />, roles: ['admin', 'manager'] },
  ];

  const bottomItems = [
    { path: '/settings', label: 'Paramètres', icon: <SettingsIcon />, roles: ['admin'] },
    { path: '/support', label: 'Support', icon: <SupportIcon />, roles: ['admin', 'manager', 'agent'] },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false); // Close sidebar on mobile after navigation
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Filter items based on user role
  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const filteredBottomItems = bottomItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className={styles.mobileToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isCollapsed ? styles.collapsed : ''}`}
        role="navigation"
        aria-label="Navigation principale"
      >
        {/* Collapse/Expand Toggle Button */}
        <button
          className={styles.collapseToggle}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Étendre le menu' : 'Réduire le menu'}
          title={isCollapsed ? 'Étendre le menu' : 'Réduire le menu'}
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>

        {/* User Profile Section */}
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className={styles.userInfo}>
              <div className={styles.userName}>Dr. Shalom</div>
              <div className={styles.userRole}>{user?.role || 'Administrateur'}</div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  title={isCollapsed ? item.label : ''}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {!isCollapsed && <span className={styles.navLabel}>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Items */}
        <div className={styles.bottomSection}>
          <ul className={styles.navList}>
            {filteredBottomItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  title={isCollapsed ? item.label : ''}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {!isCollapsed && <span className={styles.navLabel}>{item.label}</span>}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className={`${styles.navItem} ${styles.logoutItem}`}
                title={isCollapsed ? 'Déconnexion' : ''}
              >
                <span className={styles.navIcon}><LogoutIcon /></span>
                {!isCollapsed && <span className={styles.navLabel}>Déconnexion</span>}
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
