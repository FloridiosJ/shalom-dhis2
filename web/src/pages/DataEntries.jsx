import React, { useEffect, useState } from "react";
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import styles from "./DataEntries.module.css";
import CreateDataEntryModal from "../components/CreateDataEntryModal";
import CreatePatientModal from "../components/CreatePatientModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import DataEntryRow from "../components/DataEntryRow";
import useSortedPaginatedData from "../hooks/useSortedPaginatedData";
import dataEntryService from "../services/dataEntries";
import patientService from "../services/patients";
import dispensaireService from "../services/dispensaires";
import categoriesService from "../services/categories";

const DataEntries = () => {
  const [dataEntries, setDataEntries] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dispensaires, setDispensaires] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ Ajout
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [createPatientModalOpen, setCreatePatientModalOpen] = useState(false);
  const [prefilledPatientName, setPrefilledPatientName] = useState("");
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setFetchError("");
    try {
      const [entries, pats, disps, cats] = await Promise.all([
        dataEntryService.getAll(),
        patientService.getAll(),
        dispensaireService.getAll(),
        categoriesService.getAll(), // ✅ Ajout
      ]);
      setDataEntries(entries);
      setPatients(pats);
      setDispensaires(disps);
      setCategories(cats); // ✅ Ajout
    } catch (error) {
      console.error("Error fetching data:", error);
      setFetchError("Erreur lors du chargement des données. Veuillez réessayer.");
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

  // Function to get sort value for a given entry and column
  const getSortValue = (entry, column) => {
    switch (column) {
      case "dateConsultation":
        return entry.dateConsultation ? new Date(entry.dateConsultation).getTime() : 0;
      case "patient":
        return entry.patient ? `${entry.patient.nom} ${entry.patient.prenom}`.toLowerCase() : "";
      case "dispensaire":
        return (entry.dispensaire?.name || "").toLowerCase();
      case "diagnostic":
        return (entry.diagnostic || "").toLowerCase();
      case "prescription":
        return (entry.prescription || "").toLowerCase();
      default:
        return "";
    }
  };

  // Use the custom hook for sorting and pagination
  const {
    currentItems: currentEntries,
    sortColumn,
    sortDirection,
    handleSort,
    currentPage,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    handlePageChange,
  } = useSortedPaginatedData(filteredEntries, {
    itemsPerPage: 10,
    initialSortColumn: "dateConsultation",
    initialSortDirection: "desc",
    getSortValue,
  });

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

  const handleCreatePatient = (patientName) => {
    // Extract first and last name from the search input
    // In French convention: "prenom" = first name, "nom" = family/last name
    const names = patientName.trim().split(' ');
    const prenom = names[0] || ''; // First word = given name
    const nom = names.slice(1).join(' ') || ''; // Remaining = family name
    setPrefilledPatientName({ nom, prenom });
    setModalOpen(false); // Close data entry modal first
    setCreatePatientModalOpen(true); // Then open patient creation modal
  };

  const handlePatientSaved = () => {
    fetchAll();
    setCreatePatientModalOpen(false);
    setPrefilledPatientName("");
    setModalOpen(true); // Reopen the data entry modal
  };

  return (
    <Layout title="Consultations">
      <div className={styles.pageBg}>
        <div style={{ marginBottom: '1.5rem' }} />
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher par patient, diagnostic, date..."
              />
            </div>
            {!isAdmin() && (
              <button className={styles.actionBtn} onClick={() => setModalOpen(true)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter une consultation
              </button>
            )}
          </div>
        {fetchError && (
          <div className={styles.errorBanner}>
            ⚠️ {fetchError}
            <button onClick={fetchAll} className={styles.retryBtn}>Réessayer</button>
          </div>
        )}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th 
                  className={`${styles.th} ${styles.thSortable}`} 
                  onClick={() => handleSort("dateConsultation")}
                  aria-sort={sortColumn === "dateConsultation" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                >
                  Date
                  {sortColumn === "dateConsultation" && (
                    <span className={styles.sortIndicator} aria-hidden="true">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th 
                  className={`${styles.th} ${styles.thSortable} ${styles.thPatient}`}
                  onClick={() => handleSort("patient")}
                  aria-sort={sortColumn === "patient" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                >
                  Patient
                  {sortColumn === "patient" && (
                    <span className={styles.sortIndicator} aria-hidden="true">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th 
                  className={`${styles.th} ${styles.thSortable}`}
                  onClick={() => handleSort("dispensaire")}
                  aria-sort={sortColumn === "dispensaire" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                >
                  Dispensaire
                  {sortColumn === "dispensaire" && (
                    <span className={styles.sortIndicator} aria-hidden="true">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th 
                  className={`${styles.th} ${styles.thSortable}`}
                  onClick={() => handleSort("diagnostic")}
                  aria-sort={sortColumn === "diagnostic" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                >
                  Diagnostic
                  {sortColumn === "diagnostic" && (
                    <span className={styles.sortIndicator} aria-hidden="true">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th 
                  className={`${styles.th} ${styles.thSortable}`}
                  onClick={() => handleSort("prescription")}
                  aria-sort={sortColumn === "prescription" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                >
                  Prescription
                  {sortColumn === "prescription" && (
                    <span className={styles.sortIndicator} aria-hidden="true">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th className={styles.th} style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.td} style={{ textAlign: "center", color: "#64748b", background: "#f9fafb", padding: "2.5rem 0" }}>
                    Aucune consultation trouvée
                  </td>
                </tr>
              ) : (
                currentEntries.map((entry) => (
                  <DataEntryRow
                    key={entry.id}
                    entry={entry}
                    onEdit={(entry) => {
                      setEntryToEdit(entry);
                      setEditModalOpen(true);
                    }}
                    onDelete={(entry) => {
                      setEntryToDelete(entry);
                      setDeleteModalOpen(true);
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredEntries.length}
          startIndex={indexOfFirstItem}
          endIndex={indexOfLastItem}
          onPageChange={handlePageChange}
        />

        {/* Modale création */}
        <CreateDataEntryModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={fetchAll}
          dispensaires={dispensaires}
          patients={patients}
          categories={categories}
          onSubmit={handleCreate}
          isEdit={false}
          onCreatePatient={handleCreatePatient}
        />
        {/* Modale édition */}
        <CreateDataEntryModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSaved={fetchAll}
          dispensaires={dispensaires}
          patients={patients}
          categories={categories}
          initialData={entryToEdit}
          onSubmit={handleEdit}
          isEdit={true}
          onCreatePatient={handleCreatePatient}
        />
        {/* Modale création patient */}
        <CreatePatientModal
          open={createPatientModalOpen}
          onClose={() => {
            setCreatePatientModalOpen(false);
            setPrefilledPatientName("");
          }}
          onSaved={handlePatientSaved}
          dispensaires={dispensaires}
          patient={prefilledPatientName ? { 
            nom: prefilledPatientName.nom, 
            prenom: prefilledPatientName.prenom 
          } : null}
          isEdit={false}
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
    </Layout>
  );
};

export default DataEntries;