import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import patientService from '../services/patients';
import dispensaireService from '../services/dispensaires';
import styles from './Dispensaires.module.css'; // Réutilise le même module CSS
import CreatePatientModal from '../components/CreatePatientModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [dispensaires, setDispensaires] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Récupère la liste des patients
  const fetchPatients = async () => {
    try {
      const list = await patientService.getAll();
      setPatients(list);
    } catch {
      setPatients([]);
    }
  };

  // Récupère la liste des dispensaires pour le select du modal
  const fetchDispensaires = async () => {
    try {
      const list = await dispensaireService.getAll();
      setDispensaires(list);
    } catch {
      setDispensaires([]);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchDispensaires();
  }, []);

  useEffect(() => {
    // Reset to first page when search term changes
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await patientService.remove(patientToDelete.id);
      setShowDeleteModal(false);
      setPatientToDelete(null);
      fetchPatients(); // rafraîchir la liste
    } catch (e) {
      setDeleteError(e.message || "Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtrage local
  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.nom?.toLowerCase().includes(term) ||
      p.prenom?.toLowerCase().includes(term) ||
      p.village?.toLowerCase().includes(term) ||
      p.numeroPatient?.toLowerCase().includes(term)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
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
            <h1 className={styles.title}>Patients</h1>
            <div className={styles.subtitle}>Gérer les patients, informations personnelles et dossiers de santé</div>
          </div>
          <button
            className={styles.actionBtn}
            onClick={() => setShowCreateModal(true)}
            type="button"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un patient
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
                placeholder="Rechercher un patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Nom</th>
                <th className={styles.th}>Prénom</th>
                <th className={styles.th}>Âge</th>
                <th className={styles.th}>Sexe</th>
                <th className={styles.th}>Dispensaire</th>
                <th className={styles.th}>Statut</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.td} style={{ textAlign: 'center', color: '#64748b', background: '#f9fafb', padding: '2.5rem 0' }}>
                    Aucun patient trouvé
                  </td>
                </tr>
              ) : (
                currentPatients.map((patient) => (
                  <tr key={patient.id} className={styles.tr}>
                    <td className={styles.td}>{patient.nom}</td>
                    <td className={styles.td}>{patient.prenom}</td>
                    <td className={styles.td}>{patient.age}</td>
                    <td className={styles.td}>{patient.sexe}</td>
                    <td className={styles.td}>{patient.dispensaire?.name || '-'}</td>
                    <td className={styles.td}>
                      <span className={patient.isActive ? styles.badgeActive : styles.badgeInactive}>
                        {patient.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <button
                        className={styles.iconBtnEdit}
                        aria-label="Modifier"
                        onClick={() => {
                          setPatientToEdit(patient);
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
                        onClick={() => {
                          setPatientToDelete(patient);
                          setDeleteError('');
                          setShowDeleteModal(true);
                        }}
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

          {/* Pagination Controls */}
          {filteredPatients.length > 0 && (
            <div className={styles.paginationWrapper}>
              <div className={styles.paginationInfo}>
                Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredPatients.length)} sur {filteredPatients.length} patients
              </div>
              <div className={styles.paginationControls}>
                <button
                  className={styles.pageBtn}
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  type="button"
                >
                  Précédent
                </button>
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className={styles.pageBtn} style={{ cursor: 'default', border: 'none', background: 'transparent' }}>
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                      onClick={() => handlePageChange(page)}
                      type="button"
                    >
                      {page}
                    </button>
                  )
                ))}
                <button
                  className={styles.pageBtn}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  type="button"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal création */}
        <CreatePatientModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSaved={fetchPatients}
          dispensaires={dispensaires}
        />

        {/* Modal édition (structure similaire, à adapter si besoin) */}
        <CreatePatientModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSaved={fetchPatients}
          dispensaires={dispensaires}
          patient={patientToEdit}
          isEdit={true}
        />

        <ConfirmDeleteModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          user={{
            nom: patientToDelete?.nom,
            prenom: patientToDelete?.prenom,
            email: patientToDelete?.numeroPatient // ou autre info si besoin
          }}
          loading={deleteLoading}
          error={deleteError}
        />
      </div>
    </div>
  );
};

export default Patients;