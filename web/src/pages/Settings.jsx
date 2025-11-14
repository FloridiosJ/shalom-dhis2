import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import usersService from '../services/usersService';
import styles from './Settings.module.css';

const Settings = () => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    nom: '',
    prenom: '',
    email: ''
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileErrors, setProfileErrors] = useState({});

  // Load current user data
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        nom: currentUser.nom || '',
        prenom: currentUser.prenom || '',
        email: currentUser.email || ''
      });
    }
  }, [currentUser]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    setProfileErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    setPasswordErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileForm.nom.trim()) {
      errors.nom = 'Le nom est requis';
    }
    
    if (!profileForm.prenom.trim()) {
      errors.prenom = 'Le prénom est requis';
    }
    
    if (profileForm.email && !profileForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Email invalide';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Le mot de passe actuel est requis';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Veuillez confirmer le mot de passe';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await usersService.update(currentUser.id, {
        nom: profileForm.nom,
        prenom: profileForm.prenom,
        email: profileForm.email
      });
      
      if (result.success) {
        showToast('Profil mis à jour avec succès', 'success');
        // Update the auth context with new data
        window.location.reload(); // Reload to refresh user data in context
      } else {
        showToast(result.message || 'Erreur lors de la mise à jour', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Erreur lors de la mise à jour du profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Note: The backend changePassword mutation doesn't verify current password
      // In a production app, you'd want to add that validation
      const result = await usersService.changePassword(currentUser.id, passwordForm.newPassword);
      
      if (result.success) {
        showToast('Mot de passe modifié avec succès', 'success');
        // Clear the form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showToast(result.errors?.[0] || 'Erreur lors du changement de mot de passe', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Erreur lors du changement de mot de passe', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Configuration système</h1>

        {/* Toast Notification */}
        {toast.show && (
          <div className={`${styles.toast} ${styles[toast.type]}`}>
            {toast.message}
          </div>
        )}

        {/* Profile Card - ACTIVE */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Profil Utilisateur</h2>
          
          <form onSubmit={handleSaveProfile} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="nom" className={styles.label}>Nom</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={profileForm.nom}
                  onChange={handleProfileChange}
                  className={`${styles.input} ${profileErrors.nom ? styles.inputError : ''}`}
                  disabled={loading}
                />
                {profileErrors.nom && (
                  <span className={styles.errorText}>{profileErrors.nom}</span>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className={`${styles.input} ${profileErrors.email ? styles.inputError : ''}`}
                  disabled={loading}
                />
                {profileErrors.email && (
                  <span className={styles.errorText}>{profileErrors.email}</span>
                )}
              </div>
            </div>

            <div className={styles.buttonContainer}>
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Save Changes'}
              </button>
            </div>
          </form>

          <div className={styles.divider}></div>

          <form onSubmit={handleChangePassword} className={styles.form}>
            <h3 className={styles.sectionTitle}>Changer le mot de passe</h3>
            
            <div className={styles.passwordSection}>
              <div className={styles.formGroup}>
                <label htmlFor="currentPassword" className={styles.label}>Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className={`${styles.input} ${passwordErrors.currentPassword ? styles.inputError : ''}`}
                  disabled={loading}
                  placeholder="••••••••"
                />
                {passwordErrors.currentPassword && (
                  <span className={styles.errorText}>{passwordErrors.currentPassword}</span>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="newPassword" className={styles.label}>New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className={`${styles.input} ${passwordErrors.newPassword ? styles.inputError : ''}`}
                  disabled={loading}
                  placeholder="••••••••"
                />
                {passwordErrors.newPassword && (
                  <span className={styles.errorText}>{passwordErrors.newPassword}</span>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`${styles.input} ${passwordErrors.confirmPassword ? styles.inputError : ''}`}
                  disabled={loading}
                  placeholder="••••••••"
                />
                {passwordErrors.confirmPassword && (
                  <span className={styles.errorText}>{passwordErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            <div className={styles.buttonContainer}>
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={loading}
              >
                {loading ? 'Changement...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Notifications Card - DISABLED */}
        <div className={`${styles.card} ${styles.disabledCard}`}>
          <h2 className={styles.cardTitle}>Notifications</h2>
          
          <div className={styles.notificationItem}>
            <div>
              <div className={styles.notificationTitle}>Alertes système</div>
              <div className={styles.notificationDesc}>Notifications for critical system events.</div>
            </div>
            <label className={styles.switch}>
              <input type="checkbox" disabled checked />
              <span className={`${styles.slider} ${styles.disabled}`}></span>
            </label>
          </div>
          
          <div className={styles.notificationItem}>
            <div>
              <div className={styles.notificationTitle}>Mises à jour</div>
              <div className={styles.notificationDesc}>Get notified about new updates and features.</div>
            </div>
            <label className={styles.switch}>
              <input type="checkbox" disabled checked />
              <span className={`${styles.slider} ${styles.disabled}`}></span>
            </label>
          </div>
          
          <div className={styles.notificationItem}>
            <div>
              <div className={styles.notificationTitle}>Rapports hebdomadaires</div>
              <div className={styles.notificationDesc}>Receive a summary report every week.</div>
            </div>
            <label className={styles.switch}>
              <input type="checkbox" disabled />
              <span className={`${styles.slider} ${styles.disabled}`}></span>
            </label>
          </div>
        </div>

        {/* Display Preferences Card - DISABLED */}
        <div className={`${styles.card} ${styles.disabledCard}`}>
          <h2 className={styles.cardTitle}>Préférences d&apos;Affichage</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Thème</label>
            <div className={styles.themeButtons}>
              <button className={`${styles.themeButton} ${styles.active}`} disabled>
                Clair
              </button>
              <button className={styles.themeButton} disabled>
                Sombre
              </button>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="language" className={styles.label}>Langue</label>
            <select 
              id="language" 
              className={styles.select} 
              disabled
              defaultValue="fr"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Security Card - DISABLED */}
        <div className={`${styles.card} ${styles.disabledCard}`}>
          <h2 className={styles.cardTitle}>Sécurité</h2>
          
          <div className={styles.securityItem}>
            <div>
              <div className={styles.securityTitle}>Two-Factor Authentication (2FA)</div>
              <div className={styles.securityStatus}>Status: <span className={styles.enabled}>Enabled</span></div>
            </div>
            <button className={styles.configButton} disabled>
              Configure 2FA
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
