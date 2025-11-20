import React, { useState, useEffect, useRef } from "react";
import { useAuth } from '../hooks/useAuth';
import { TYPES_CONSULTATION, getConsultationTypesByGender } from "../constants";
import PatientAutocomplete from './PatientAutocomplete';
import CategoriesSelector from './CategoriesSelector';
import PrescriptionInputWithModal from './prescription/PrescriptionInputWithModal';
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
  
  // ✅ État pour gérer les catégories sélectionnées
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // ✅ État pour gérer les prescriptions structurées
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  
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

  // Filtrer les types de consultation selon le sexe du patient
  const selectedPatient = patients.find(p => p.id === form.patientId);
  const availableConsultationTypes = getConsultationTypesByGender(selectedPatient?.sexe);

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
          <PatientAutocomplete
            value={form.fullName}
            patientId={form.patientId}
            numeroPatient={form.numeroPatient}
            patients={patients}
            onChange={(fullName, patientId, numeroPatient) => {
              setForm(f => ({ ...f, fullName, patientId, numeroPatient }));
            }}
            onCreatePatient={onCreatePatient}
            disabled={false}
            isEdit={isEdit}
            loading={loading}
            error={errors.patientId}
          />

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
              {availableConsultationTypes.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
            {errors.typeConsultation && <div className={styles.errorField}>{errors.typeConsultation}</div>}
          </div>

          {/* ✅ Catégories de maladies - DÉPLACÉ EN PREMIER */}
          {categories.length > 0 && (
            <CategoriesSelector
              categories={categories}
              selectedCategories={selectedCategories}
              onChange={setSelectedCategories}
              loading={loading}
              error={errors.categories}
            />
          )}

          {/* ✅ Prescriptions structurées */}
          <PrescriptionInputWithModal
            prescriptions={prescriptionItems}
            onChange={setPrescriptionItems}
            disabled={loading}
          />

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