import React, { useEffect, useState } from 'react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import usersService from '../services/usersService';
import dispensaireService from '../services/dispensaires'; // Import du service dispensaire
import styles from './Users.module.css';
import CreateOrEditUserModal from '../components/CreateOrEditUserModal';

const UserIcon = ({ size = 32, color = "#2563eb" }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="7" r="5" fill={color} opacity="0.15"/>
    <circle cx="12" cy="7" r="4" fill={color}/>
    <rect x="4" y="15" width="16" height="6" rx="3" fill={color} opacity="0.15"/>
    <rect x="6" y="16" width="12" height="4" rx="2" fill={color}/>
  </svg>
);

const Users = () => {
  const [users, setUsers] = useState([]);
  const [dispensaires, setDispensaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Récupère la liste des utilisateurs
  const fetchUsers = () => {
    setLoading(true);
    usersService.getAll()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  // Récupère la liste des dispensaires
  const fetchDispensaires = async () => {
    console.log('Fetching dispensaires...');
    try {
      const list = await dispensaireService.getAll();
      setDispensaires(list);
      console.log('Fetched dispensaires:', list);
    } catch (e) {
      console.error('Error fetching dispensaires:', e);
      setDispensaires([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDispensaires();
    // eslint-disable-next-line
  }, []);

  // Rafraîchir la liste après création ou modification
  const handleUserSaved = () => {
    fetchUsers();
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await usersService.remove(userToDelete.id);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      // Rafraîchir la liste
      usersService.getAll().then(setUsers);
    } catch (e) {
      setDeleteError(e.message || 'Erreur lors de la suppression');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className={styles.pageBg}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <UserIcon size={36} />
            <div>
              <h1 className={styles.title}>Gestion des utilisateurs</h1>
              <div className={styles.subtitle}>
                Gérez les comptes de votre système DHIS2 Shalom
              </div>
            </div>
          </div>
          <button
            className={styles.createBtn}
            onClick={() => { setEditingUser(null); setModalOpen(true); }}
            type="button"
          >
            + Créer un utilisateur
          </button>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Nom</th>
                <th className={styles.th}>Prénom</th>
                <th className={styles.th}>Rôle</th>
                <th className={styles.th}>Statut</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className={styles.td} style={{ textAlign: 'center', background: '#f9fafb' }}>
                    Chargement...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={6} className={styles.td} style={{ textAlign: 'center', color: '#ef4444', background: '#f9fafb' }}>
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && users.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.td} style={{ textAlign: 'center', color: '#64748b', background: '#f9fafb' }}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
              {!loading && !error && users.map((u, idx) => (
                <tr
                  key={u.id}
                  className={styles.tr}
                  style={hoveredRow === idx ? { background: '#f0f9ff' } : {}}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className={styles.td}>{u.email}</td>
                  <td className={styles.td}>{u.nom}</td>
                  <td className={styles.td}>{u.prenom}</td>
                  <td className={styles.td}>{u.role}</td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${u.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                      {u.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <button
                      className={`${styles.btn} ${styles.btnEdit}`}
                      onClick={() => { setEditingUser(u); setModalOpen(true); }}
                    >
                      Modifier
                    </button>
                    <button
                      className={`${styles.btn} ${styles.btnDelete}`}
                      onClick={() => handleDeleteClick(u)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modale création / édition utilisateur */}
      <CreateOrEditUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleUserSaved}
        dispensaires={dispensaires}
        user={editingUser}
      />
      {/* Modale de confirmation de suppression */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setUserToDelete(null); }}
        onConfirm={handleConfirmDelete}
        user={userToDelete}
        loading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
};

export default Users;