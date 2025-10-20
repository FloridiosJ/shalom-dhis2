import React from 'react';
import styles from './LoginRightPanel.module.css';

const LoginRightPanel = () => {
  return (
    <div className={styles.container}>
      <div className={styles.illustration}>
        📊
      </div>
      
      <h2 className={styles.title}>
        Shalom Data Compilation
      </h2>
      
      <p className={styles.subtitle}>
        Plateforme de gestion des données de Shalom-FLM (Madagascar)
      </p>
      
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>250+</div>
          <div className={styles.statLabel}>Patients enregistrés</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>15</div>
          <div className={styles.statLabel}>Dispensaires actifs</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>1,200</div>
          <div className={styles.statLabel}>Consultations ce mois</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>98%</div>
          <div className={styles.statLabel}>Taux de satisfaction</div>
        </div>
      </div>
{/*       
      <div className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🏥</span>
          <span>Gestion des consultations</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>👥</span>
          <span>Suivi des patients</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>📈</span>
          <span>Rapports en temps réel</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🔐</span>
          <span>Sécurité renforcée</span>
        </div>
      </div> */}
    </div>
  );
};

// ✅ Export par défaut
export default LoginRightPanel;

// ✅ Export nommé aussi (pour compatibilité)
export { LoginRightPanel };