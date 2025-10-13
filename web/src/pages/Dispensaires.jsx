import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dispensaireService from '../services/dispensaires';
import styles from './Dispensaires.module.css';
import CreateDispensaireModal from '../components/CreateDispensaireModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

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
  const navigate = useNavigate();

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
    <div className={styles.pageBg}>
      <div className={styles.card}>
        <div className={styles.header}>
          <button
            className={styles.actionBtn}
            type="button"
            onClick={() => navigate('/dashboard')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au dashboard
          </button>
          <div className={styles.headerCenter}>
            <h1 className={styles.title}>Dispensaires</h1>
            <div className={styles.subtitle}>Gérer les dispensaires et centres de santé</div>
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
          <div className={styles.tableTopBar}>
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
              />
            </div>
          </div>
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
                      <button
                        className={styles.iconBtnEdit}
                        aria-label="Modifier"
                        onClick={() => {
                          setDispensaireToEdit(dispensaire);
                          setShowEditModal(true);
                        }}
                        type="button"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 0 0 .707-.293l9.414-9.414a2 2 0 0 0 0-2.828l-3.172-3.172a2 2 0 0 0-2.828 0L4.293 14.879A1 1 0 0 0 4 15.586V20z"/>
                        </svg>
                      </button>
                      <button
                        className={styles.iconBtnDelete}
                        aria-label="Supprimer"
                        onClick={() => openDeleteModal(dispensaire)}
                        type="button"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m5 0H4"/>
                        </svg>
                      </button>
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
  );
};

export default Dispensaires;