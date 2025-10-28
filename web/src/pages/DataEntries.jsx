import React, { useEffect, useState } from "react";
import styles from "./DataEntries.module.css";
import CreateDataEntryModal from "../components/CreateDataEntryModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import dataEntryService from "../services/dataEntries";
import patientService from "../services/patients";
import dispensaireService from "../services/dispensaires";
import { useNavigate } from 'react-router-dom';

const DataEntries = () => {
  const [dataEntries, setDataEntries] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dispensaires, setDispensaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [entries, pats, disps] = await Promise.all([
        dataEntryService.getAll(),
        patientService.getAll(),
        dispensaireService.getAll(),
      ]);
      setDataEntries(entries);
      setPatients(pats);
      setDispensaires(disps);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = dataEntries.filter((e) => {
    const term = search.toLowerCase();
    return (
      e.patient?.nom?.toLowerCase().includes(term) ||
      e.patient?.prenom?.toLowerCase().includes(term) ||
      e.diagnostic?.toLowerCase().includes(term) ||
      e.prescription?.toLowerCase().includes(term) ||
      e.dispensaire?.name?.toLowerCase().includes(term) ||
      (e.dateConsultation && new Date(e.dateConsultation).toLocaleDateString("fr-FR").includes(term))
    );
  });

  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let aVal, bVal;
    
    switch (sortColumn) {
      case "date":
        aVal = a.dateConsultation ? new Date(a.dateConsultation).getTime() : 0;
        bVal = b.dateConsultation ? new Date(b.dateConsultation).getTime() : 0;
        break;
      case "patient":
        aVal = a.patient ? `${a.patient.nom} ${a.patient.prenom}`.toLowerCase() : "";
        bVal = b.patient ? `${b.patient.nom} ${b.patient.prenom}`.toLowerCase() : "";
        break;
      case "dispensaire":
        aVal = (a.dispensaire?.name || "").toLowerCase();
        bVal = (b.dispensaire?.name || "").toLowerCase();
        break;
      case "diagnostic":
        aVal = (a.diagnostic || "").toLowerCase();
        bVal = (b.diagnostic || "").toLowerCase();
        break;
      case "prescription":
        aVal = (a.prescription || "").toLowerCase();
        bVal = (b.prescription || "").toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate entries
  const totalPages = Math.ceil(sortedEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = sortedEntries.slice(startIndex, startIndex + itemsPerPage);

  // Handle sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // CRUD handlers
  const handleCreate = async (input) => {
    // ✅ Le payload est déjà nettoyé dans le modal
    await dataEntryService.create(input);
    fetchAll();
  };
  
  const handleEdit = async (input) => {
    // ✅ Le payload est déjà nettoyé dans le modal
    await dataEntryService.update(entryToEdit.id, input);
    fetchAll();
  };
  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await dataEntryService.remove(entryToDelete.id);
      setDeleteModalOpen(false);
      setEntryToDelete(null);
      fetchAll();
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
          <button className={styles.actionBtn} onClick={() => navigate('/dashboard')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au dashboard
          </button>
          <div className={styles.title}>Consultations</div>
          <button className={styles.actionBtn} onClick={() => setModalOpen(true)}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une consultation
          </button>
        </div>
        <div className={styles.searchBar}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Rechercher par patient, diagnostic, date..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={`${styles.th} ${styles.sortable}`} onClick={() => handleSort("date")}>
                  Date
                  {sortColumn === "date" && (
                    <span className={styles.sortIcon}>{sortDirection === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </th>
                <th className={`${styles.th} ${styles.sortable}`} onClick={() => handleSort("patient")}>
                  Patient
                  {sortColumn === "patient" && (
                    <span className={styles.sortIcon}>{sortDirection === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </th>
                <th className={`${styles.th} ${styles.sortable}`} onClick={() => handleSort("dispensaire")}>
                  Dispensaire
                  {sortColumn === "dispensaire" && (
                    <span className={styles.sortIcon}>{sortDirection === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </th>
                <th className={`${styles.th} ${styles.sortable}`} onClick={() => handleSort("diagnostic")}>
                  Diagnostic
                  {sortColumn === "diagnostic" && (
                    <span className={styles.sortIcon}>{sortDirection === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </th>
                <th className={`${styles.th} ${styles.sortable}`} onClick={() => handleSort("prescription")}>
                  Prescription
                  {sortColumn === "prescription" && (
                    <span className={styles.sortIcon}>{sortDirection === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </th>
                <th className={styles.th} style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.td} style={{ textAlign: "center", color: "#64748b", background: "#f9fafb", padding: "2.5rem 0" }}>
                    Aucune consultation trouvée
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className={styles.td}>
                      {entry.dateConsultation ? new Date(entry.dateConsultation).toLocaleDateString("fr-FR") : "-"}
                    </td>
                    <td className={styles.td}>
                      {entry.patient ? `${entry.patient.nom} ${entry.patient.prenom}` : "-"}
                    </td>
                    <td className={styles.td}>{entry.dispensaire?.name || "-"}</td>
                    <td className={styles.td}>{entry.diagnostic}</td>
                    <td className={styles.td}>{entry.prescription || "-"}</td>
                    <td className={`${styles.td} ${styles.tdActions}`}>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
                        aria-label="Modifier"
                        onClick={() => {
                          setEntryToEdit(entry);
                          setEditModalOpen(true);
                        }}
                        type="button"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 0 0 .707-.293l9.414-9.414a2 2 0 0 0 0-2.828l-3.172-3.172a2 2 0 0 0-2.828 0L4.293 14.879A1 1 0 0 0 4 15.586V20z"/>
                        </svg>
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                        aria-label="Supprimer"
                        onClick={() => {
                          setEntryToDelete(entry);
                          setDeleteModalOpen(true);
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
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              className={styles.paginationBtn} 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹ Précédent
            </button>
            <div className={styles.paginationInfo}>
              Page {currentPage} sur {totalPages} ({sortedEntries.length} résultat{sortedEntries.length > 1 ? 's' : ''})
            </div>
            <button 
              className={styles.paginationBtn} 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant ›
            </button>
          </div>
        )}
        {/* Modale création */}
        <CreateDataEntryModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={fetchAll}
          dispensaires={dispensaires}
          patients={patients}
          onSubmit={handleCreate}
          isEdit={false}
        />
        {/* Modale édition */}
        <CreateDataEntryModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSaved={fetchAll}
          dispensaires={dispensaires}
          patients={patients}
          initialData={entryToEdit}
          onSubmit={handleEdit}
          isEdit={true}
        />
        {/* Modale suppression */}
        <ConfirmDeleteModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          user={{
            nom: entryToDelete?.patient?.nom,
            prenom: entryToDelete?.patient?.prenom,
            email: entryToDelete?.diagnostic,
          }}
          loading={deleteLoading}
          error={deleteError}
        />
      </div>
    </div>
  );
};

export default DataEntries;