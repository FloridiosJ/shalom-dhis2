import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import usersService from '../services/usersService';
import dispensaireService from '../services/dispensaires';
import styles from './Users.module.css';
import CreateOrEditUserModal from '../components/CreateOrEditUserModal';
import ModernSearchBar from '../components/ModernSearchBar';
import ModernPagination from '../components/ModernPagination';
import IconButton from '../components/IconButton';
import BadgeStatus from '../components/BadgeStatus';
import TableSkeleton from '../components/TableSkeleton';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Récupère la liste des utilisateurs
  const fetchUsers = () => {
    setLoading(true);
    usersService.getAll()
      .then(data => {
        setUsers(data);
        setFilteredUsers(data);
      })
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

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      setCurrentPage(1);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      user.nom?.toLowerCase().includes(query) ||
      user.prenom?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, users]);

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
      usersService.getAll().then(data => {
        setUsers(data);
        setFilteredUsers(data);
      });
    } catch (e) {
      setDeleteError(e.message || 'Erreur lors de la suppression');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterClick = () => {
    // Placeholder for filter functionality
    console.log('Filter button clicked');
  };

  return (
    <Layout title="Gestion des utilisateurs">
      <div className={styles.pageBg}>
        <div className={styles.card}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Gestion des utilisateurs</h1>
          </div>

          <div className={styles.header}>
            <ModernSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher par nom..."
              onFilterClick={handleFilterClick}
            />
            <button
              className={styles.addButton}
              onClick={() => { setEditingUser(null); setModalOpen(true); }}
              type="button"
              aria-label="Ajouter un utilisateur"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Ajouter un utilisateur</span>
            </button>
          </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          {loading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : error ? (
            <div className={styles.errorMessage}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p>{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className={styles.emptyMessage}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="#94a3b8" strokeWidth="1.5"/>
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p>{searchQuery ? 'Aucun utilisateur trouvé pour cette recherche.' : 'Aucun utilisateur trouvé.'}</p>
            </div>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>EMAIL</th>
                    <th className={styles.th}>NOM</th>
                    <th className={styles.th}>PRÉNOM</th>
                    <th className={styles.th}>RÔLE</th>
                    <th className={styles.th}>STATUT</th>
                    <th className={styles.th}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((u, idx) => (
                    <tr
                      key={u.id}
                      className={styles.tr}
                      style={hoveredRow === idx ? { background: '#f0f9ff' } : {}}
                      onMouseEnter={() => setHoveredRow(idx)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className={styles.td}>{u.email}</td>
                      <td className={`${styles.td} ${styles.tdBold}`}>{u.nom}</td>
                      <td className={styles.td}>{u.prenom}</td>
                      <td className={styles.td}>{u.role}</td>
                      <td className={styles.td}>
                        <BadgeStatus isActive={u.isActive} />
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actionButtons}>
                          <IconButton
                            variant="edit"
                            onClick={() => { setEditingUser(u); setModalOpen(true); }}
                            ariaLabel={`Modifier ${u.nom} ${u.prenom}`}
                          />
                          <IconButton
                            variant="delete"
                            onClick={() => handleDeleteClick(u)}
                            ariaLabel={`Supprimer ${u.nom} ${u.prenom}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ModernPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
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