import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import usersService from '../services/usersService';
import dispensaireService from '../services/dispensaires';
import styles from './Users.module.css';
import CreateOrEditUserModal from '../components/CreateOrEditUserModal';

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
    <Layout>
      <div className={styles.pageBg}>
        <div style={{ marginBottom: '1.5rem' }} />
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.headerCenter}>
              <h1 className={styles.title}>Gestion des utilisateurs</h1>
            </div>
            <button
              className={styles.actionBtn}
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
    </Layout>
  );
};

export default Users;