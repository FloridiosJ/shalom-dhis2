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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();

  // Récupère la liste des patients
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const list = await patientService.getAll();
      setPatients(list);
      setError('');
    } catch (e) {
      setError(e.message || 'Erreur lors du chargement');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupère la liste des dispensaires pour le select du modal
  const fetchDispensaires = async () => {
    try {
      const list = await dispensaireService.getAll();
      setDispensaires(list);
    } catch (e) {
      setDispensaires([]);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchDispensaires();
  }, []);

  const openDeleteModal = (patient) => {
    setPatientToDelete(patient);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await patientService.remove(patientToDelete.id);
      setShowDeleteModal(false);
      setPatientToDelete(null);
      fetchPatients();
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
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.td} style={{ textAlign: 'center', color: '#64748b', background: '#f9fafb', padding: '2.5rem 0' }}>
                    Aucun patient trouvé
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
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
                        onClick={() => openDeleteModal(patient)}
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
            email: patientToDelete?.numeroPatient
          }}
          loading={deleteLoading}
          error={deleteError}
        />
      </div>
    </div>
  );
};

export default Patients;