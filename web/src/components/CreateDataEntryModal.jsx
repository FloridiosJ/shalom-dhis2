import React, { useState, useEffect, useRef } from "react";
import { useAuth } from '../hooks/useAuth';
import { TYPES_CONSULTATION } from "../constants";
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
}) => {
  const { user } = useAuth();
  const isAgent = user?.role === 'agent';

  const [form, setForm] = useState({
    dateConsultation: "",
    patientId: "",
    dispensaireId: "",
    typeConsultation: "",
    diagnostic: "",
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
  const [showNumAutocomplete, setShowNumAutocomplete] = useState(false);
  const [filteredNumPatients, setFilteredNumPatients] = useState([]);
  
  // ✅ État pour gérer les catégories sélectionnées
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  
  const firstInputRef = useRef();

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

      setForm({
        dateConsultation: initialData?.dateConsultation
          ? new Date(initialData.dateConsultation).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        patientId: patient?.id || "",
        dispensaireId: defaultDispensaireId,
        typeConsultation: initialData?.typeConsultation || "CURATIF",
        diagnostic: initialData?.diagnostic || "",
        prescription: initialData?.prescription || "",
        notes: initialData?.notes || "",
        categories: existingCategories,
        // Champs UI
        numeroPatient: patient?.numeroPatient || "",
        fullName: patient ? `${patient.nom} ${patient.prenom}` : "",
      });
      
      setSelectedCategories(existingCategories);
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
    if (!form.diagnostic.trim()) e.diagnostic = "Diagnostic requis";
    
    // ✅ Validation des catégories (optionnel mais recommandé)
    if (selectedCategories.length > 0) {
      const principalCount = selectedCategories.filter(c => c.isPrincipal).length;
      if (principalCount > 1) {
        e.categories = "Une seule catégorie principale autorisée";
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
      const payload = {
        dateConsultation: new Date(form.dateConsultation).toISOString(),
        patientId: form.patientId,
        dispensaireId: isAgent ? user.dispensaire.id : form.dispensaireId,
        typeConsultation: form.typeConsultation,
        diagnostic: form.diagnostic,
        prescription: form.prescription || "",
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
              type="datetime-local"
              className={styles.input}
              value={form.dateConsultation}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {errors.dateConsultation && <div className={styles.errorField}>{errors.dateConsultation}</div>}
          </div>

          {/* Numéro patient */}
          <div className={styles.formGroup} style={{ position: "relative" }}>
            <label htmlFor="numeroPatient" className={styles.label}>
              Numéro patient <span aria-hidden="true" style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              id="numeroPatient"
              name="numeroPatient"
              className={styles.input}
              value={form.numeroPatient || ""}
              onChange={e => {
                const numero = e.target.value;
                const filtered = patients.filter(p =>
                  p.numeroPatient?.toLowerCase().includes(numero.toLowerCase())
                );
                const patient = patients.find(p => p.numeroPatient === numero);
                setForm(f => ({
                  ...f,
                  numeroPatient: numero,
                  patientId: patient ? patient.id : "",
                  fullName: patient ? `${patient.nom} ${patient.prenom}` : "",
                }));
                setShowNumAutocomplete(filtered.length > 0 && numero.length > 0);
                setFilteredNumPatients(filtered);
              }}
              autoComplete="off"
              disabled={loading || isEdit}
              onFocus={() => {
                if (form.numeroPatient && filteredNumPatients?.length > 0) setShowNumAutocomplete(true);
              }}
              onBlur={() => setTimeout(() => setShowNumAutocomplete(false), 200)}
            />
            {showNumAutocomplete && (
              <ul className={styles.autocompleteList}>
                {filteredNumPatients.map((p) => (
                  <li
                    key={p.id}
                    className={styles.autocompleteItem}
                    onMouseDown={() => {
                      setForm(f => ({
                        ...f,
                        numeroPatient: p.numeroPatient,
                        patientId: p.id,
                        fullName: `${p.nom} ${p.prenom}`,
                      }));
                      setShowNumAutocomplete(false);
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{p.numeroPatient}</span>
                    <span style={{ color: "#64748b", marginLeft: 8 }}>{p.nom} {p.prenom}</span>
                  </li>
                ))}
              </ul>
            )}
            {errors.patientId && <div className={styles.errorField}>{errors.patientId}</div>}
          </div>

          {/* Nom et prénom */}
          <div className={styles.formGroup} style={{ position: "relative" }}>
            <label htmlFor="fullName" className={styles.label}>
              Nom et prénom <span aria-hidden="true" style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              className={styles.input}
              value={form.fullName || ""}
              onChange={e => {
                const value = e.target.value;
                const filtered = patients.filter(
                  p =>
                    `${p.nom} ${p.prenom}`.toLowerCase().includes(value.toLowerCase()) ||
                    p.nom?.toLowerCase().includes(value.toLowerCase()) ||
                    p.prenom?.toLowerCase().includes(value.toLowerCase())
                );
                setForm(f => ({
                  ...f,
                  fullName: value,
                  patientId: filtered.length === 1 ? filtered[0].id : "",
                  numeroPatient: filtered.length === 1 ? filtered[0].numeroPatient : "",
                }));
                setShowAutocomplete(filtered.length > 0 && value.length > 0);
                setFilteredPatients(filtered);
              }}
              autoComplete="off"
              disabled={loading || isEdit}
              onFocus={() => {
                if (form.fullName && filteredPatients?.length > 0) setShowAutocomplete(true);
              }}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            />
            {showAutocomplete && (
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
                    }}
                  >
                    {p.nom} {p.prenom} <span style={{ color: "#64748b", marginLeft: 8 }}>{p.numeroPatient}</span>
                  </li>
                ))}
              </ul>
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

          {/* Diagnostic */}
          <div className={styles.formGroup}>
            <label htmlFor="diagnostic" className={styles.label}>
              Diagnostic <span aria-hidden="true" style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              id="diagnostic"
              name="diagnostic"
              className={styles.input}
              value={form.diagnostic}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {errors.diagnostic && <div className={styles.errorField}>{errors.diagnostic}</div>}
          </div>

          {/* ✅ Catégories de maladies */}
          {categories.length > 0 && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Catégories de maladies
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
                          <span className={styles.categoryCode}>{cat.code}</span>
                        </div>
                        <div className={styles.categoryActions}>
                          {!cat.isPrincipal && (
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
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowCategorySelector(!showCategorySelector)}
                    className={styles.addCategoryBtn}
                    disabled={loading}
                  >
                    + Ajouter une catégorie
                  </button>

                  {showCategorySelector && (
                    <div className={styles.categorySelectorDropdown}>
                      {availableCategories.map((cat) => (
                        <div
                          key={cat.id}
                          className={styles.categorySelectorItem}
                          onClick={() => handleAddCategory(cat.id)}
                        >
                          <strong>{cat.nom}</strong>
                          <span className={styles.categoryCode}>{cat.code}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {errors.categories && <div className={styles.errorField}>{errors.categories}</div>}
            </div>
          )}

          {/* Prescription */}
          <div className={styles.formGroup}>
            <label htmlFor="prescription" className={styles.label}>Prescription</label>
            <input
              id="prescription"
              name="prescription"
              className={styles.input}
              value={form.prescription}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

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