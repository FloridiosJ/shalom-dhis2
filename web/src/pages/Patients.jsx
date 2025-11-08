import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import patientService from '../services/patients';
import dispensaireService from '../services/dispensaires';
import styles from './Dispensaires.module.css';
import CreatePatientModal from '../components/CreatePatientModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Avatar from '../components/Avatar';
import Tooltip from '../components/Tooltip';
import TableSkeleton from '../components/TableSkeleton';
import FloatingActionButton from '../components/FloatingActionButton';
import { useToast } from '../components/Toast';
import { useDebounce } from '../hooks/useDebounce';

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
  const [sortField, setSortField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const searchInputRef = React.useRef(null);
  
  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Prevent default behavior if not focused on input
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Récupère la liste des patients
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const list = await patientService.getAll();
      setPatients(list);
    } catch {
      setPatients([]);
      showToast('Erreur lors du chargement des patients', 'error');
    } finally {
      setLoading(false);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reset to first page when search term changes
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await patientService.remove(patientToDelete.id);
      setShowDeleteModal(false);
      setPatientToDelete(null);
      showToast('Patient supprimé avec succès', 'success');
      fetchPatients(); // rafraîchir la liste
    } catch (e) {
      setDeleteError(e.message || "Erreur lors de la suppression");
      showToast(e.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtrage local avec debounced search
  const filteredPatients = patients.filter((p) => {
    const term = debouncedSearchTerm.toLowerCase();
    return (
      p.nom?.toLowerCase().includes(term) ||
      p.prenom?.toLowerCase().includes(term) ||
      p.village?.toLowerCase().includes(term) ||
      p.numeroPatient?.toLowerCase().includes(term)
    );
  });

  // Apply sorting with useMemo for performance
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      let aVal, bVal;
      
      if (sortField === 'nom') {
        aVal = a.nom || '';
        bVal = b.nom || '';
      } else if (sortField === 'prenom') {
        aVal = a.prenom || '';
        bVal = b.prenom || '';
      } else if (sortField === 'dispensaire') {
        aVal = a.dispensaire?.name || '';
        bVal = b.dispensaire?.name || '';
      }
      
      const comparison = aVal.localeCompare(bVal, 'fr', { sensitivity: 'base' });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredPatients, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = sortedPatients.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1 && totalPages > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && totalPages > 0) {
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
    <Layout>
      <div className={styles.pageBg}>
        <div style={{ marginBottom: '1.5rem' }} />
        <div className={styles.card}>
          <div className={styles.header}>
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

        <div className={styles.tableTopBar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              ref={searchInputRef}
              className={styles.searchInput}
              type="text"
              placeholder="Rechercher un patient... (appuyez sur '/' pour rechercher)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Rechercher un patient"
            />
          </div>
        </div>
        
        <div className={styles.tableWrapper}>
          {loading ? (
            <TableSkeleton rows={5} columns={8} />
          ) : (
            <table className={styles.table} role="table">
              <thead>
                <tr>
                  <th className={`${styles.th} ${styles.sortable}`} onClick={() => handleSort('nom')} scope="col">
                    <div className={styles.thContent}>
                      Nom
                      {sortField === 'nom' && (
                        <span className={styles.sortIcon} aria-label={sortDirection === 'asc' ? 'Trié ascendant' : 'Trié descendant'}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className={`${styles.th} ${styles.sortable}`} onClick={() => handleSort('prenom')} scope="col">
                    <div className={styles.thContent}>
                      Prénom
                      {sortField === 'prenom' && (
                        <span className={styles.sortIcon} aria-label={sortDirection === 'asc' ? 'Trié ascendant' : 'Trié descendant'}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className={styles.th} scope="col">Âge</th>
                  <th className={styles.th} scope="col">Âge légal</th>
                  <th className={styles.th} scope="col">Sexe</th>
                  <th className={`${styles.th} ${styles.sortable}`} onClick={() => handleSort('dispensaire')} scope="col">
                    <div className={styles.thContent}>
                      Dispensaire
                      {sortField === 'dispensaire' && (
                        <span className={styles.sortIcon} aria-label={sortDirection === 'asc' ? 'Trié ascendant' : 'Trié descendant'}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className={styles.th} scope="col">Statut</th>
                  <th className={styles.th} style={{ textAlign: 'right' }} scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.td} style={{ textAlign: 'center', color: '#64748b', background: '#f9fafb', padding: '2.5rem 0' }}>
                      {debouncedSearchTerm ? 'Aucun patient ne correspond à votre recherche' : 'Aucun patient enregistré'}
                    </td>
                  </tr>
                ) : (
                  currentPatients.map((patient) => (
                    <tr key={patient.id} className={styles.tr}>
                      <td className={styles.td} data-label="Nom">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Avatar firstName={patient.prenom} lastName={patient.nom} size="small" />
                          <Tooltip text={patient.nom} position="top">
                            <span className={styles.truncatedText}>{patient.nom}</span>
                          </Tooltip>
                        </div>
                      </td>
                      <td className={styles.td} data-label="Prénom">
                        <Tooltip text={patient.prenom} position="top">
                          <span className={styles.truncatedText}>{patient.prenom}</span>
                        </Tooltip>
                      </td>
                      <td className={styles.td} data-label="Âge">{patient.age}</td>
                      <td className={styles.td} data-label="Âge légal">
                        <span className={patient.isMineur ? styles.badgeMineur : styles.badgeMajeur}>
                          {patient.isMineur ? 'Mineur' : 'Majeur'}
                        </span>
                      </td>
                      <td className={styles.td} data-label="Sexe">{patient.sexe}</td>
                      <td className={styles.td} data-label="Dispensaire">
                        <Tooltip text={patient.dispensaire?.name || '-'} position="top">
                          <span className={styles.truncatedText}>{patient.dispensaire?.name || '-'}</span>
                        </Tooltip>
                      </td>
                      <td className={styles.td} data-label="Statut">
                        <span className={patient.isActive ? styles.badgeActive : styles.badgeInactive}>
                          {patient.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        <Tooltip text="Modifier le patient" position="left">
                          <button
                            className={styles.iconBtnEdit}
                            aria-label="Modifier le patient"
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
                        </Tooltip>
                        <Tooltip text="Supprimer le patient" position="left">
                          <button
                            className={styles.iconBtnDelete}
                            aria-label="Supprimer le patient"
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
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {sortedPatients.length > 0 && (
          <div className={styles.paginationWrapper}>
            <div className={styles.paginationInfo}>
              Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, sortedPatients.length)} sur {sortedPatients.length} patients
            </div>
            <div className={styles.paginationControls}>
              <button
                className={styles.pageBtn}
                onClick={handlePrevPage}
                disabled={currentPage === 1 || totalPages === 0}
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
                disabled={currentPage === totalPages || totalPages === 0}
                type="button"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Modal création */}
        <CreatePatientModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSaved={() => {
            fetchPatients();
            showToast('Patient créé avec succès', 'success');
          }}
          dispensaires={dispensaires}
        />

        {/* Modal édition (structure similaire, à adapter si besoin) */}
        <CreatePatientModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            fetchPatients();
            showToast('Patient modifié avec succès', 'success');
          }}
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
        
        {/* Floating Action Button for mobile */}
        <FloatingActionButton
          onClick={() => setShowCreateModal(true)}
          label="Ajouter un patient"
        />
      </div>
    </Layout>
  );
};

export default Patients;