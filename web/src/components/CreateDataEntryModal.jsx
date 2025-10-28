import React, { useState, useEffect, useRef } from "react";
import { useAuth } from '../hooks/useAuth';
import { TYPES_CONSULTATION, COMMON_MEDICATIONS, COMMON_FREQUENCIES, COMMON_DURATIONS } from "../constants";
import styles from "./CreateDataEntryModal.module.css";

const CreateDataEntryModal = ({
  open,
  onClose,
  onSaved,
  dispensaires = [],
  patients = [],
  categories = [], // ✅ Ajout des catégories de maladies
  initialData = null,
  onSubmit,
  isEdit = false,
  onCreatePatient, // ✅ Callback to open patient creation modal
}) => {
  const { user } = useAuth();
  const isAgent = user?.role === 'agent';

  const [form, setForm] = useState({
    dateConsultation: "",
    heureConsultation: "",
    patientId: "",
    dispensaireId: "",
    typeConsultation: "",
    diagnostic: "",
    diagnosticDetails: "", // ✅ Nouveau champ pour détails textuels
    prescription: "",
    notes: "",
    // ✅ Nouvelles catégories
    categories: [], // [{ categorieMaladieId, isPrincipal, notes }]
    // Champs UI uniquement
    numeroPatient: "",
    fullName: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showCreatePatientButton, setShowCreatePatientButton] = useState(false);
  
  // ✅ État pour gérer les catégories sélectionnées
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState(""); // ✅ Nouveau: recherche de catégorie
  
  // ✅ État pour gérer les prescriptions structurées
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [showMedicationSelector, setShowMedicationSelector] = useState({});
  const [showDurationSelector, setShowDurationSelector] = useState({});
  const [medicationSearchTerms, setMedicationSearchTerms] = useState({});
  const [durationSearchTerms, setDurationSearchTerms] = useState({});
  
  const firstInputRef = useRef();
  const categorySearchRef = useRef(); // ✅ Référence pour l'input de recherche
  const categoryDropdownRef = useRef(); // ✅ Référence pour le dropdown
  const medicationSearchRefs = useRef({});
  const medicationDropdownRefs = useRef({});
  const durationSearchRefs = useRef({});
  const durationDropdownRefs = useRef({});

  // ✅ Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCategorySelector && 
          categoryDropdownRef.current && 
          !categoryDropdownRef.current.contains(event.target)) {
        setShowCategorySelector(false);
        setCategorySearchTerm("");
      }
    };

    if (showCategorySelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCategorySelector]);

  // ✅ Fermer les dropdowns de médicaments quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(showMedicationSelector).forEach(itemId => {
        if (showMedicationSelector[itemId] && 
            medicationDropdownRefs.current[itemId] && 
            !medicationDropdownRefs.current[itemId].contains(event.target)) {
          setShowMedicationSelector(prev => ({ ...prev, [itemId]: false }));
          setMedicationSearchTerms(prev => ({ ...prev, [itemId]: "" }));
        }
      });
    };

    const hasOpenDropdown = Object.values(showMedicationSelector).some(v => v);
    if (hasOpenDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMedicationSelector]);

  // ✅ Fermer les dropdowns de durée quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(showDurationSelector).forEach(itemId => {
        if (showDurationSelector[itemId] && 
            durationDropdownRefs.current[itemId] && 
            !durationDropdownRefs.current[itemId].contains(event.target)) {
          setShowDurationSelector(prev => ({ ...prev, [itemId]: false }));
          setDurationSearchTerms(prev => ({ ...prev, [itemId]: "" }));
        }
      });
    };

    const hasOpenDropdown = Object.values(showDurationSelector).some(v => v);
    if (hasOpenDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDurationSelector]);

  useEffect(() => {
    if (open) {
      const patient = initialData?.patient;
      const defaultDispensaireId = isAgent && user?.dispensaire?.id 
        ? user.dispensaire.id 
        : (initialData?.dispensaire?.id || "");

      // ✅ Mapper les catégories existantes
      const existingCategories = initialData?.categoriesWithMeta?.map(cat => ({
        categorieMaladieId: cat.id,
        isPrincipal: cat.isPrincipal || false,
        notes: cat.notes || "",
        // Info pour l'affichage
        nom: cat.nom,
        code: cat.code,
      })) || [];

      // Extraire date et heure séparément si dateConsultation existe
      let dateStr = "";
      let heureStr = "";
      if (initialData?.dateConsultation) {
        const dt = new Date(initialData.dateConsultation);
        dateStr = dt.toISOString().split('T')[0]; // YYYY-MM-DD
        heureStr = dt.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
      } else {
        const now = new Date();
        dateStr = now.toISOString().split('T')[0];
        heureStr = now.toTimeString().split(' ')[0].substring(0, 5);
      }

      setForm({
        dateConsultation: dateStr,
        heureConsultation: heureStr,
        patientId: patient?.id || "",
        dispensaireId: defaultDispensaireId,
        typeConsultation: initialData?.typeConsultation || "CURATIF",
        diagnostic: initialData?.diagnostic || "",
        diagnosticDetails: "", // ✅ Reset diagnostic details
        prescription: initialData?.prescription || "",
        notes: initialData?.notes || "",
        categories: existingCategories,
        // Champs UI
        numeroPatient: patient?.numeroPatient || "",
        fullName: patient ? `${patient.nom} ${patient.prenom}` : "",
      });
      
      setSelectedCategories(existingCategories);
      
      // ✅ Initialiser les prescriptions structurées
      const existingPrescriptions = initialData?.prescriptionItems?.map((item, index) => ({
        id: item.id || `temp-${index}`,
        medicament: item.medicament || "",
        dose: item.dose || "",
        frequence: item.frequence || "",
        duree: item.duree || "",
        notes: item.notes || "",
        ordre: item.ordre !== undefined ? item.ordre : index
      })) || [];
      setPrescriptionItems(existingPrescriptions);
      
      setErrors({});
      setServerError("");
      setLoading(false);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [open, initialData, user, isAgent]);

  const validate = () => {
    const e = {};
    if (!form.dateConsultation) e.dateConsultation = "Date requise";
    if (!form.patientId) e.patientId = "Patient requis";
    if (!isAgent && !form.dispensaireId) e.dispensaireId = "Dispensaire requis";
    if (!form.typeConsultation) e.typeConsultation = "Type de consultation requis";
    
    // ✅ CHANGEMENT : Validation des catégories au lieu du diagnostic libre
    if (selectedCategories.length === 0) {
      e.categories = "Au moins une catégorie de maladie est requise";
    } else {
      // Si plusieurs catégories, vérifier qu'il y a exactement une principale
      if (selectedCategories.length > 1) {
        const principalCount = selectedCategories.filter(c => c.isPrincipal).length;
        if (principalCount === 0) {
          e.categories = "Vous devez sélectionner une catégorie principale";
        } else if (principalCount > 1) {
          e.categories = "Une seule catégorie principale autorisée";
        }
      }
      // Si une seule catégorie, elle doit être principale
      if (selectedCategories.length === 1 && !selectedCategories[0].isPrincipal) {
        setSelectedCategories([{ ...selectedCategories[0], isPrincipal: true }]);
      }
    }
    
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // ✅ Ajouter une catégorie
  const handleAddCategory = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    // Vérifier si déjà ajoutée
    if (selectedCategories.some(c => c.categorieMaladieId === categoryId)) {
      return;
    }

    const newCategory = {
      categorieMaladieId: categoryId,
      isPrincipal: selectedCategories.length === 0, // La première est principale par défaut
      notes: "",
      // Info pour l'affichage
      nom: category.nom,
      code: category.code,
    };

    setSelectedCategories([...selectedCategories, newCategory]);
    setShowCategorySelector(false);
    setCategorySearchTerm(""); // ✅ Réinitialiser la recherche
  };

  // ✅ Retirer une catégorie
  const handleRemoveCategory = (categoryId) => {
    setSelectedCategories(selectedCategories.filter(c => c.categorieMaladieId !== categoryId));
  };

  // ✅ Marquer comme principale
  const handleSetPrincipal = (categoryId) => {
    setSelectedCategories(
      selectedCategories.map(c => ({
        ...c,
        isPrincipal: c.categorieMaladieId === categoryId
      }))
    );
  };

  // ✅ Modifier les notes d'une catégorie
  const handleCategoryNoteChange = (categoryId, notes) => {
    setSelectedCategories(
      selectedCategories.map(c => 
        c.categorieMaladieId === categoryId ? { ...c, notes } : c
      )
    );
  };

  // ✅ Handlers pour les prescriptions structurées
  const handleAddPrescriptionItem = () => {
    const newItem = {
      id: `temp-${Date.now()}`,
      medicament: "",
      dose: "",
      frequence: "",
      duree: "",
      notes: "",
      ordre: prescriptionItems.length
    };
    setPrescriptionItems([...prescriptionItems, newItem]);
  };

  const handleRemovePrescriptionItem = (itemId) => {
    setPrescriptionItems(prescriptionItems.filter(item => item.id !== itemId));
  };

  const handlePrescriptionItemChange = (itemId, field, value) => {
    setPrescriptionItems(
      prescriptionItems.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSelectMedication = (itemId, medication) => {
    handlePrescriptionItemChange(itemId, 'medicament', medication);
    setShowMedicationSelector({ ...showMedicationSelector, [itemId]: false });
    setMedicationSearchTerms({ ...medicationSearchTerms, [itemId]: "" });
  };

  const handleSelectDuration = (itemId, duration) => {
    handlePrescriptionItemChange(itemId, 'duree', duration);
    setShowDurationSelector({ ...showDurationSelector, [itemId]: false });
    setDurationSearchTerms({ ...durationSearchTerms, [itemId]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    const eFront = validate();
    if (Object.keys(eFront).length) {
      setErrors(eFront);
      return;
    }
    setLoading(true);
    try {
      // Combiner date et heure pour créer dateConsultation ISO
      let dateConsultationISO;
      if (form.heureConsultation) {
        // Si l'heure est fournie, combiner date + heure
        dateConsultationISO = new Date(`${form.dateConsultation}T${form.heureConsultation}:00`).toISOString();
      } else {
        // Si seulement la date, utiliser minuit UTC
        dateConsultationISO = new Date(`${form.dateConsultation}T00:00:00`).toISOString();
      }

      // ✅ Générer le diagnostic à partir de la catégorie principale
      const principalCategory = selectedCategories.find(c => c.isPrincipal);
      let diagnosticText = principalCategory ? principalCategory.nom : "";
      // Ajouter les détails si présents
      if (form.diagnosticDetails?.trim()) {
        diagnosticText += ` (${form.diagnosticDetails.trim()})`;
      }

      const payload = {
        dateConsultation: dateConsultationISO,
        patientId: form.patientId,
        dispensaireId: isAgent ? user.dispensaire.id : form.dispensaireId,
        typeConsultation: form.typeConsultation,
        diagnostic: diagnosticText, // ✅ Généré automatiquement
        // prescription: form.prescription || "", // ✅ Commenté - utiliser prescriptionItems
        notes: form.notes || "",
      };

      // ✅ Ajouter les catégories si présentes
      if (selectedCategories.length > 0) {
        payload.categories = selectedCategories.map(c => ({
          categorieMaladieId: c.categorieMaladieId,
          isPrincipal: c.isPrincipal,
          notes: c.notes || ""
        }));
      }

      // ✅ Ajouter les prescriptions structurées si présentes
      if (prescriptionItems.length > 0) {
        // Filtrer les items vides et nettoyer les données
        const validItems = prescriptionItems.filter(item => item.medicament.trim());
        if (validItems.length > 0) {
          payload.prescriptionItems = validItems.map((item, index) => ({
            medicament: item.medicament.trim(),
            dose: item.dose?.trim() || null,
            frequence: item.frequence?.trim() || null,
            duree: item.duree?.trim() || null,
            notes: item.notes?.trim() || null,
            ordre: index
          }));
        }
      }

      console.log('📤 Payload consultation:', payload);

      await onSubmit(payload);
      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error('❌ Erreur:', err);
      setServerError(err.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  // ✅ Filtrer les catégories non sélectionnées
  const availableCategories = categories.filter(
    cat => !selectedCategories.some(sc => sc.categorieMaladieId === cat.id)
  );

  // ✅ Filtrer les catégories selon le terme de recherche
  const filteredCategories = availableCategories.filter(cat => {
    if (!categorySearchTerm.trim()) return true;
    const searchLower = categorySearchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const nomLower = (cat.nom || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return nomLower.includes(searchLower);
  });

  return (
    <div className={styles.overlay} aria-modal="true" role="dialog" tabIndex={-1} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} tabIndex={0}>
        <h2 className={styles.title}>{isEdit ? "Modifier la consultation" : "Ajouter une consultation"}</h2>
        {serverError && <div className={styles.errorMsg}>{serverError}</div>}
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
          {/* Date consultation */}
          <div className={styles.formGroup}>
            <label htmlFor="dateConsultation" className={styles.label}>
              Date de consultation <span aria-hidden="true" style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              ref={firstInputRef}
              id="dateConsultation"
              name="dateConsultation"
              type="date"
              className={styles.input}
              value={form.dateConsultation}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {errors.dateConsultation && <div className={styles.errorField}>{errors.dateConsultation}</div>}
          </div>

          {/* Heure consultation (optionnelle) */}
          <div className={styles.formGroup}>
            <label htmlFor="heureConsultation" className={styles.label}>
              Heure de consultation <span style={{ color: "#64748b", fontSize: "0.875rem", fontWeight: "normal" }}>(optionnel)</span>
            </label>
            <input
              id="heureConsultation"
              name="heureConsultation"
              type="time"
              className={styles.input}
              value={form.heureConsultation}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Patient Selector - Nom et prénom avec numéro */}
          <div className={styles.formGroup} style={{ position: "relative" }}>
            <label htmlFor="fullName" className={styles.label}>
              Patient <span aria-hidden="true" style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              className={styles.input}
              value={form.patientId && form.numeroPatient 
                ? `${form.fullName} (${form.numeroPatient})`
                : form.fullName || ""
              }
              onChange={e => {
                const value = e.target.value;
                // Remove patient number from search if present
                const searchValue = value.replace(/\s*\([^)]*\)\s*$/, '').trim();
                
                const filtered = patients.filter(
                  p =>
                    `${p.nom} ${p.prenom}`.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p.nom?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p.prenom?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p.numeroPatient?.toLowerCase().includes(searchValue.toLowerCase())
                );
                // Only clear patient selection if the value doesn't match the current selection
                const currentPatientMatch = form.patientId && patients.find(p => 
                  p.id === form.patientId && 
                  `${p.nom} ${p.prenom}` === searchValue
                );
                setForm(f => ({
                  ...f,
                  fullName: searchValue,
                  patientId: currentPatientMatch ? f.patientId : "",
                  numeroPatient: currentPatientMatch ? f.numeroPatient : "",
                }));
                setShowAutocomplete(searchValue.length > 0);
                setFilteredPatients(filtered);
                setShowCreatePatientButton(filtered.length === 0 && searchValue.length > 0);
              }}
              autoComplete="off"
              disabled={loading || isEdit}
              placeholder="Rechercher un patient par nom, prénom ou numéro..."
              style={{ 
                backgroundColor: form.patientId ? '#e0f2fe' : '#f8fafc',
                cursor: form.patientId && isEdit ? 'not-allowed' : 'text'
              }}
              onFocus={() => {
                if (!form.patientId && form.fullName && filteredPatients?.length > 0) {
                  setShowAutocomplete(true);
                }
              }}
              onBlur={() => setTimeout(() => {
                setShowAutocomplete(false);
                setShowCreatePatientButton(false);
              }, 200)}
            />
            {errors.patientId && <div className={styles.errorField}>{errors.patientId}</div>}
            {showAutocomplete && filteredPatients.length > 0 && (
              <ul className={styles.autocompleteList}>
                {filteredPatients.map((p) => (
                  <li
                    key={p.id}
                    className={styles.autocompleteItem}
                    onMouseDown={() => {
                      setForm(f => ({
                        ...f,
                        fullName: `${p.nom} ${p.prenom}`,
                        patientId: p.id,
                        numeroPatient: p.numeroPatient,
                      }));
                      setShowAutocomplete(false);
                      setShowCreatePatientButton(false);
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ fontWeight: 500 }}>
                        {p.nom} {p.prenom}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', gap: '0.75rem' }}>
                        <span>📋 {p.numeroPatient}</span>
                        {p.dispensaire && <span>🏥 {p.dispensaire.name}</span>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {showCreatePatientButton && onCreatePatient && (
              <div className={styles.createPatientPrompt}>
                <span>Patient introuvable.</span>
                <button
                  type="button"
                  className={styles.createPatientBtn}
                  onMouseDown={() => {
                    const searchValue = form.fullName;
                    setShowCreatePatientButton(false);
                    setShowAutocomplete(false);
                    onCreatePatient(searchValue);
                  }}
                >
                  + Créer un nouveau patient
                </button>
              </div>
            )}
          </div>

          {/* Dispensaire (admin/manager uniquement) */}
          {!isAgent && (
            <div className={styles.formGroup}>
              <label htmlFor="dispensaireId" className={styles.label}>
                Dispensaire <span aria-hidden="true" style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                id="dispensaireId"
                name="dispensaireId"
                className={styles.input}
                value={form.dispensaireId}
                onChange={handleChange}
                required
                disabled={loading || isEdit}
              >
                <option value="">Sélectionner…</option>
                {dispensaires.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {errors.dispensaireId && <div className={styles.errorField}>{errors.dispensaireId}</div>}
            </div>
          )}

          {/* Message informatif pour agents */}
          {isAgent && (
            <div className={styles.infoText}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{ marginRight: '0.5rem', flexShrink: 0 }}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              La consultation sera automatiquement assignée à votre dispensaire : 
              <strong> {user?.dispensaire?.name || 'Chargement...'}</strong>
            </div>
          )}

          {/* Type consultation */}
          <div className={styles.formGroup}>
            <label htmlFor="typeConsultation" className={styles.label}>
              Type de consultation <span aria-hidden="true" style={{ color: "#dc2626" }}>*</span>
            </label>
            <select
              id="typeConsultation"
              name="typeConsultation"
              className={styles.input}
              value={form.typeConsultation}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Sélectionner…</option>
              {TYPES_CONSULTATION.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
            {errors.typeConsultation && <div className={styles.errorField}>{errors.typeConsultation}</div>}
          </div>

          {/* ✅ Catégories de maladies - DÉPLACÉ EN PREMIER */}
          {categories.length > 0 && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Catégories de maladies <span aria-hidden="true" style={{ color: "#dc2626" }}>*</span>
              </label>
              
              {/* Liste des catégories sélectionnées */}
              {selectedCategories.length > 0 && (
                <div className={styles.categoriesList}>
                  {selectedCategories.map((cat) => (
                    <div key={cat.categorieMaladieId} className={styles.categoryItem}>
                      <div className={styles.categoryHeader}>
                        <div className={styles.categoryName}>
                          {cat.isPrincipal && (
                            <span className={styles.principalBadge}>★ Principale</span>
                          )}
                          <strong>{cat.nom}</strong>
                        </div>
                        <div className={styles.categoryActions}>
                          {!cat.isPrincipal && selectedCategories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrincipal(cat.categorieMaladieId)}
                              className={styles.setPrincipalBtn}
                              title="Marquer comme principale"
                            >
                              ★
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(cat.categorieMaladieId)}
                            className={styles.removeBtn}
                            title="Retirer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Notes pour cette catégorie (optionnel)"
                        value={cat.notes}
                        onChange={(e) => handleCategoryNoteChange(cat.categorieMaladieId, e.target.value)}
                        className={styles.categoryNotesInput}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Bouton ajouter catégorie */}
              {availableCategories.length > 0 && (
                <div style={{ position: 'relative' }} ref={categoryDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategorySelector(!showCategorySelector);
                      if (!showCategorySelector) {
                        setTimeout(() => categorySearchRef.current?.focus(), 100);
                      }
                    }}
                    className={styles.addCategoryBtn}
                    disabled={loading}
                    aria-expanded={showCategorySelector}
                    aria-haspopup="listbox"
                  >
                    + Ajouter une catégorie
                  </button>

                  {showCategorySelector && (
                    <div 
                      className={styles.categorySelectorDropdown}
                      role="listbox"
                      aria-label="Sélecteur de catégories"
                    >
                      {/* ✅ Champ de recherche */}
                      <div className={styles.categorySearchContainer}>
                        <input
                          ref={categorySearchRef}
                          type="text"
                          className={styles.categorySearchInput}
                          placeholder="Rechercher une catégorie..."
                          value={categorySearchTerm}
                          onChange={(e) => setCategorySearchTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setShowCategorySelector(false);
                              setCategorySearchTerm("");
                            } else if (e.key === 'Enter' && filteredCategories.length === 1) {
                              e.preventDefault();
                              handleAddCategory(filteredCategories[0].id);
                            }
                          }}
                          aria-label="Rechercher une catégorie"
                        />
                        <svg 
                          className={styles.categorySearchIcon}
                          width="16" 
                          height="16" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      {/* ✅ Liste des catégories filtrées */}
                      <div className={styles.categoryListContainer}>
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((cat) => (
                            <div
                              key={cat.id}
                              className={styles.categorySelectorItem}
                              onClick={() => handleAddCategory(cat.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleAddCategory(cat.id);
                                }
                              }}
                              role="option"
                              tabIndex={0}
                              aria-selected="false"
                            >
                              <div className={styles.categoryItemContent}>
                                <strong className={styles.categoryItemName}>{cat.nom}</strong>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={styles.categoryNoResults}>
                            Aucune catégorie trouvée
                          </div>
                        )}
                      </div>

                      {/* ✅ Bouton de fermeture */}
                      <div className={styles.categoryDropdownFooter}>
                        <button
                          type="button"
                          className={styles.categoryCloseBtn}
                          onClick={() => {
                            setShowCategorySelector(false);
                            setCategorySearchTerm("");
                          }}
                        >
                          Fermer (Échap)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {errors.categories && <div className={styles.errorField}>{errors.categories}</div>}
            </div>
          )}

          {/* ✅ Détails du diagnostic (optionnel) */}
          <div className={styles.formGroup}>
            <label htmlFor="diagnosticDetails" className={styles.label}>
              Détails du diagnostic <span style={{ color: "#64748b", fontSize: "0.875rem", fontWeight: "normal" }}>(optionnel)</span>
            </label>
            <textarea
              id="diagnosticDetails"
              name="diagnosticDetails"
              className={styles.input}
              value={form.diagnosticDetails}
              onChange={handleChange}
              disabled={loading}
              rows={2}
              placeholder="Observations ou précisions complémentaires sur le diagnostic..."
            />
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
              💡 Ces détails seront ajoutés au diagnostic principal basé sur la catégorie sélectionnée
            </div>
          </div>

          {/* ✅ Prescriptions structurées */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Prescriptions structurées
              <span style={{ color: "#64748b", fontSize: "0.875rem", fontWeight: "normal", marginLeft: "0.5rem" }}>
                (Recommandé pour analyse)</span>
            </label>
            
            {/* Liste des médicaments prescrits */}
            {prescriptionItems.length > 0 && (
              <div className={styles.prescriptionsList}>
                {prescriptionItems.map((item, index) => (
                  <div key={item.id} className={styles.prescriptionItem}>
                    <div className={styles.prescriptionHeader}>
                      <strong style={{ color: '#0284c7', fontSize: '0.9rem' }}>
                        Médicament #{index + 1}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleRemovePrescriptionItem(item.id)}
                        className={styles.removeBtn}
                        title="Retirer ce médicament"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {/* Médicament avec dropdown */}
                    <div className={styles.prescriptionField}>
                      <label className={styles.prescriptionFieldLabel}>
                        Médicament <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      
                      {item.medicament ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          padding: '0.5rem',
                          background: '#e0f2fe',
                          borderRadius: '0.5rem',
                          border: '1px solid #0284c7'
                        }}>
                          <span style={{ flex: 1, fontWeight: 500 }}>{item.medicament}</span>
                          <button
                            type="button"
                            onClick={() => handlePrescriptionItemChange(item.id, 'medicament', '')}
                            style={{
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '0.25rem',
                              padding: '0.25rem 0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={{ position: 'relative' }} ref={el => medicationDropdownRefs.current[item.id] = el}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowMedicationSelector({ ...showMedicationSelector, [item.id]: !showMedicationSelector[item.id] });
                              if (!showMedicationSelector[item.id]) {
                                setTimeout(() => medicationSearchRefs.current[item.id]?.focus(), 100);
                              }
                            }}
                            className={styles.addCategoryBtn}
                            disabled={loading}
                            style={{ width: '100%' }}
                          >
                            + Sélectionner un médicament
                          </button>

                          {showMedicationSelector[item.id] && (
                            <div 
                              className={styles.categorySelectorDropdown}
                              role="listbox"
                              aria-label="Sélecteur de médicaments"
                            >
                              <div className={styles.categorySearchContainer}>
                                <input
                                  ref={el => medicationSearchRefs.current[item.id] = el}
                                  type="text"
                                  className={styles.categorySearchInput}
                                  placeholder="Rechercher un médicament..."
                                  value={medicationSearchTerms[item.id] || ""}
                                  onChange={(e) => setMedicationSearchTerms({ ...medicationSearchTerms, [item.id]: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                      setShowMedicationSelector({ ...showMedicationSelector, [item.id]: false });
                                      setMedicationSearchTerms({ ...medicationSearchTerms, [item.id]: "" });
                                    }
                                  }}
                                  aria-label="Rechercher un médicament"
                                />
                                <svg 
                                  className={styles.categorySearchIcon}
                                  width="16" 
                                  height="16" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              </div>

                              <div className={styles.categoryListContainer}>
                                {COMMON_MEDICATIONS
                                  .filter(med => {
                                    const searchTerm = (medicationSearchTerms[item.id] || "").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                                    const medLower = med.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                                    return medLower.includes(searchTerm);
                                  })
                                  .map((med) => (
                                    <div
                                      key={med}
                                      className={styles.categorySelectorItem}
                                      onClick={() => handleSelectMedication(item.id, med)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          handleSelectMedication(item.id, med);
                                        }
                                      }}
                                      role="option"
                                      tabIndex={0}
                                      aria-selected="false"
                                    >
                                      <div className={styles.categoryItemContent}>
                                        <strong className={styles.categoryItemName}>{med}</strong>
                                      </div>
                                    </div>
                                  ))}
                              </div>

                              <div className={styles.categoryDropdownFooter}>
                                <button
                                  type="button"
                                  className={styles.categoryCloseBtn}
                                  onClick={() => {
                                    setShowMedicationSelector({ ...showMedicationSelector, [item.id]: false });
                                    setMedicationSearchTerms({ ...medicationSearchTerms, [item.id]: "" });
                                  }}
                                >
                                  Fermer (Échap)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Dose */}
                    <div className={styles.prescriptionField}>
                      <label className={styles.prescriptionFieldLabel}>Dose</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={item.dose}
                        onChange={(e) => handlePrescriptionItemChange(item.id, 'dose', e.target.value)}
                        placeholder="Ex: 500mg, 2 comprimés..."
                        disabled={loading}
                      />
                    </div>
                    
                    {/* Fréquence avec autocomplete */}
                    <div className={styles.prescriptionField}>
                      <label className={styles.prescriptionFieldLabel}>Fréquence</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={item.frequence}
                        onChange={(e) => handlePrescriptionItemChange(item.id, 'frequence', e.target.value)}
                        placeholder="Ex: 3x/jour, matin et soir..."
                        list={`frequencies-list-${item.id}`}
                        disabled={loading}
                      />
                      <datalist id={`frequencies-list-${item.id}`}>
                        {COMMON_FREQUENCIES.map((freq) => (
                          <option key={freq} value={freq} />
                        ))}
                      </datalist>
                    </div>
                    
                    {/* Durée avec dropdown */}
                    <div className={styles.prescriptionField}>
                      <label className={styles.prescriptionFieldLabel}>Durée</label>
                      
                      {item.duree ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          padding: '0.5rem',
                          background: '#e0f2fe',
                          borderRadius: '0.5rem',
                          border: '1px solid #0284c7'
                        }}>
                          <span style={{ flex: 1, fontWeight: 500 }}>{item.duree}</span>
                          <button
                            type="button"
                            onClick={() => handlePrescriptionItemChange(item.id, 'duree', '')}
                            style={{
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '0.25rem',
                              padding: '0.25rem 0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={{ position: 'relative' }} ref={el => durationDropdownRefs.current[item.id] = el}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowDurationSelector({ ...showDurationSelector, [item.id]: !showDurationSelector[item.id] });
                              if (!showDurationSelector[item.id]) {
                                setTimeout(() => durationSearchRefs.current[item.id]?.focus(), 100);
                              }
                            }}
                            className={styles.addCategoryBtn}
                            disabled={loading}
                            style={{ width: '100%' }}
                          >
                            + Sélectionner une durée
                          </button>

                          {showDurationSelector[item.id] && (
                            <div 
                              className={styles.categorySelectorDropdown}
                              role="listbox"
                              aria-label="Sélecteur de durée"
                            >
                              <div className={styles.categorySearchContainer}>
                                <input
                                  ref={el => durationSearchRefs.current[item.id] = el}
                                  type="text"
                                  className={styles.categorySearchInput}
                                  placeholder="Rechercher une durée..."
                                  value={durationSearchTerms[item.id] || ""}
                                  onChange={(e) => setDurationSearchTerms({ ...durationSearchTerms, [item.id]: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                      setShowDurationSelector({ ...showDurationSelector, [item.id]: false });
                                      setDurationSearchTerms({ ...durationSearchTerms, [item.id]: "" });
                                    }
                                  }}
                                  aria-label="Rechercher une durée"
                                />
                                <svg 
                                  className={styles.categorySearchIcon}
                                  width="16" 
                                  height="16" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              </div>

                              <div className={styles.categoryListContainer}>
                                {COMMON_DURATIONS
                                  .filter(dur => {
                                    const searchTerm = (durationSearchTerms[item.id] || "").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                                    const durLower = dur.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                                    return durLower.includes(searchTerm);
                                  })
                                  .map((dur) => (
                                    <div
                                      key={dur}
                                      className={styles.categorySelectorItem}
                                      onClick={() => handleSelectDuration(item.id, dur)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          handleSelectDuration(item.id, dur);
                                        }
                                      }}
                                      role="option"
                                      tabIndex={0}
                                      aria-selected="false"
                                    >
                                      <div className={styles.categoryItemContent}>
                                        <strong className={styles.categoryItemName}>{dur}</strong>
                                      </div>
                                    </div>
                                  ))}
                              </div>

                              <div className={styles.categoryDropdownFooter}>
                                <button
                                  type="button"
                                  className={styles.categoryCloseBtn}
                                  onClick={() => {
                                    setShowDurationSelector({ ...showDurationSelector, [item.id]: false });
                                    setDurationSearchTerms({ ...durationSearchTerms, [item.id]: "" });
                                  }}
                                >
                                  Fermer (Échap)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Notes pour ce médicament */}
                    <div className={styles.prescriptionField}>
                      <label className={styles.prescriptionFieldLabel}>Notes</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={item.notes}
                        onChange={(e) => handlePrescriptionItemChange(item.id, 'notes', e.target.value)}
                        placeholder="Précisions pour ce médicament..."
                        disabled={loading}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Bouton ajouter médicament */}
            <button
              type="button"
              onClick={handleAddPrescriptionItem}
              className={styles.addCategoryBtn}
              disabled={loading}
              style={{ marginTop: prescriptionItems.length > 0 ? '0.5rem' : '0' }}
            >
              + Ajouter un médicament
            </button>
          </div>

          {/* Prescription libre (cas exceptionnels) - COMMENTÉ POUR L'INSTANT */}
          {/* <div className={styles.formGroup}>
            <label htmlFor="prescription" className={styles.label}>
              Prescription libre
              <span style={{ color: "#64748b", fontSize: "0.875rem", fontWeight: "normal", marginLeft: "0.5rem" }}>
                (Cas exceptionnels uniquement)
              </span>
            </label>
            <textarea
              id="prescription"
              name="prescription"
              className={styles.input}
              value={form.prescription}
              onChange={handleChange}
              disabled={loading}
              rows={2}
              placeholder="Utilisez la prescription structurée ci-dessus. Ce champ est uniquement pour des cas exceptionnels."
            />
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
              💡 Privilégiez la prescription structurée pour une meilleure analyse des données
            </div>
          </div> */}

          {/* Notes */}
          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.label}>Notes</label>
            <textarea
              id="notes"
              name="notes"
              className={styles.input}
              value={form.notes}
              onChange={handleChange}
              disabled={loading}
              rows={3}
            />
          </div>
         
          {/* Boutons */}
          <div className={styles.btnRow}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (isEdit ? "Enregistrement..." : "Création...") : (isEdit ? "Enregistrer" : "Créer la consultation")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDataEntryModal;