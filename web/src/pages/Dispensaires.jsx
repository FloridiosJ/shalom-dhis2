import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import dispensaireService from '../services/dispensaires';
import styles from './Dispensaires.module.css';
import CreateDispensaireModal from '../components/CreateDispensaireModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';

const Dispensaires = () => {
  const [dispensaires, setDispensaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dispensaireToEdit, setDispensaireToEdit] = useState(null);
  const [dispensaireToDelete, setDispensaireToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Récupère la liste des dispensaires (même logique que Users.jsx)
  const fetchDispensaires = async () => {
    setLoading(true);
    try {
      const list = await dispensaireService.getAll();
      setDispensaires(list);
      setError('');
    } catch (e) {
      setError(e.message || 'Erreur lors du chargement');
      setDispensaires([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispensaires();
  }, []);

  const openDeleteModal = (dispensaire) => {
    setDispensaireToDelete(dispensaire);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await dispensaireService.remove(dispensaireToDelete.id);
      setShowDeleteModal(false);
      setDispensaireToDelete(null);
      fetchDispensaires();
    } catch (e) {
      setDeleteError(e.message || "Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Layout title="Dispensaires">
      <div className={styles.pageBg}>
        <div style={{ marginBottom: '1.5rem' }} />
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.searchWrapper}>
                <span className={styles.searchIcon}>
                  <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Rechercher un dispensaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Rechercher un dispensaire"
                />
              </div>
            </div>
          <button
            className={styles.actionBtn}
            onClick={() => setShowCreateModal(true)}
            type="button"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un dispensaire
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Nom</th>
                <th className={styles.th}>Synoda</th>
                <th className={styles.th}>Fileovana</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dispensaires.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.td} style={{ textAlign: 'center', color: '#64748b', background: '#f9fafb', padding: '2.5rem 0' }}>
                    Aucun dispensaire trouvé
                  </td>
                </tr>
              ) : (
                dispensaires.map((dispensaire) => (
                  <tr key={dispensaire.id} className={styles.tr}>
                    <td className={styles.td}>{dispensaire.name}</td>
                    <td className={styles.td}>{dispensaire.synoda || '-'}</td>
                    <td className={styles.td}>{dispensaire.fileovana || '-'}</td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <EditButton
                        onClick={() => {
                          setDispensaireToEdit(dispensaire);
                          setShowEditModal(true);
                        }}
                        ariaLabel="Modifier"
                      />
                      <DeleteButton
                        onClick={() => openDeleteModal(dispensaire)}
                        ariaLabel="Supprimer"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Affiche le modal de création si showCreateModal est true */}
        <CreateDispensaireModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSaved={fetchDispensaires}
        />

        {/* Affiche le modal d'édition si showEditModal est true */}
        <CreateDispensaireModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSaved={fetchDispensaires}
          dispensaire={dispensaireToEdit}
          isEdit={true}
        />

        <ConfirmDeleteModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          user={{
            nom: dispensaireToDelete?.name,
            prenom: '',
            email: dispensaireToDelete?.fileovana
          }}
          loading={deleteLoading}
          error={deleteError}
        />
        </div>
      </div>
    </Layout>
  );
};

export default Dispensaires;