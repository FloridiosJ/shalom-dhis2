import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import {
  DispensaireIcon,
  DataIcon,
  ReportIcon,
  UserIcon,
  SettingsIcon,
  LogoutIcon,
  PatientIcon
} from '../components/DashboardIcons';
import styles from './Dashboard.module.css';



const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const cardData = [
    {
      title: 'Patients',
      subtitle: 'Gérer les patients, informations personnelles et dossiers de santé',
      description: 'Gérer les patients, informations personnelles et dossiers de santé',
      icon: <PatientIcon />,
      color: 'blue',
      path: '/patients'
    },
    {
      title: 'Dispensaires',
      subtitle: 'Centres de santé',
      description: 'Gérer les dispensaires, centres de santé communautaires et établissements de soins de santé primaire',
      icon: <DispensaireIcon />,
      color: 'green',
      path: '/dispensaires'
    },
    {
      title: 'Saisie de données',
      subtitle: 'Collecte et analyse',
      description: 'Saisie, validation et consultation des données de santé, indicateurs et métriques de performance',
      icon: <DataIcon />,
      color: 'yellow',
      path: '/data-entries'
    },
    {
      title: 'Rapports & Analytics',
      subtitle: 'Tableaux de bord',
      description: 'Générer des rapports personnalisés, visualisations de données et tableaux de bord analytiques',
      icon: <ReportIcon />,
      color: 'pink',
      path: '/reports'
    },
    {
      title: 'Gestion des utilisateurs',
      subtitle: 'Droits et permissions',
      description: 'Gérer les comptes utilisateurs, rôles, permissions et contrôle d\'accès au système',
      icon: <UserIcon />,
      color: 'purple',
      path: '/users'
    },
    {
      title: 'Configuration système',
      subtitle: 'Paramètres et maintenance',
      description: 'Configuration du système, paramètres généraux, maintenance et administration avancée',
      icon: <SettingsIcon />,
      color: 'gray',
      path: '/settings'
    }
  ];

  return (
    <div className={styles.container}>
      {/* Bannière avec titre, message de bienvenue et bouton déconnexion */}
      <div className={styles.banner}>
        {/* Header avec titre et bouton déconnexion */}
        <div className={styles.bannerHeader}>
          <h1 className={styles.title}>
            SDC Shalom
          </h1>
          
          <button
            onClick={logout}
            className={styles.logoutButton}
          >
            <LogoutIcon />
            Déconnexion
          </button>
        </div>

        {/* Message de bienvenue et info utilisateur */}
        <div className={styles.userInfo}>
          <h2 className={styles.welcomeTitle}>
            Bienvenue, {user?.email}
          </h2>
          <p className={styles.roleInfo}>
            Rôle: {user?.role}
          </p>
        </div>
      </div>

      {/* Grille des cartes */}
      <div className={styles.cardsContainer}>
        <div className={styles.cardsGrid}>
          {cardData.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              subtitle={card.subtitle}
              description={card.description}
              icon={card.icon}
              color={card.color}
              onClick={() => navigate(card.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;