import React, { useState, useEffect, useRef } from "react";
import styles from "./CreateDataEntryModal.module.css";

const CreateDataEntryModal = ({
  open,
  onClose,
  onSaved,
  dispensaires = [],
  patients = [],
  initialData = null,
  onSubmit, // async (data) => {}
  isEdit = false,
}) => {
  const [form, setForm] = useState({
    dateConsultation: "",
    patientId: "",
    dispensaireId: "",
    diagnostic: "",
    prescription: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const firstInputRef = useRef();

  useEffect(() => {
    if (open) {
      setForm({
        dateConsultation: initialData?.dateConsultation
          ? initialData.dateConsultation.slice(0, 16)
          : new Date().toISOString().slice(0, 16), // <-- date/heure actuelle par défaut
        patientId: initialData?.patient?.id || "",
        dispensaireId: initialData?.dispensaire?.id || "",
        diagnostic: initialData?.diagnostic || "",
        prescription: initialData?.prescription || "",
        notes: initialData?.notes || "",
      });
      setErrors({});
      setServerError("");
      setLoading(false);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [open, initialData]);

  const validate = () => {
    const e = {};
    if (!form.dateConsultation) e.dateConsultation = "Date requise";
    if (!form.patientId) e.patientId = "Patient requis";
    if (!form.dispensaireId) e.dispensaireId = "Dispensaire requis";
    if (!form.diagnostic.trim()) e.diagnostic = "Diagnostic requis";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
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
      await onSubmit({
        ...form,
        dateConsultation: new Date(form.dateConsultation).toISOString(),
      });
      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
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
           <div className={styles.formGroup}>
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
                setForm(f => {
                  const patient = patients.find(p => p.numeroPatient === numero);
                  return {
                    ...f,
                    numeroPatient: numero,
                    patientId: patient ? patient.id : "",
                    fullName: patient ? `${patient.nom} ${patient.prenom}` : "",
                  };
                });
              }}
              autoComplete="off"
              disabled={loading}
            />
          </div>
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
                    p.nom.toLowerCase().includes(value.toLowerCase()) ||
                    p.prenom.toLowerCase().includes(value.toLowerCase())
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
              disabled={loading}
              onFocus={() => {
                if (form.fullName && filteredPatients?.length > 0) setShowAutocomplete(true);
              }}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            />
            {showAutocomplete && (
              <ul className={styles.autocompleteList}>
                {filteredPatients.map((p, idx) => (
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
              disabled={loading}
            >
              <option value="">Sélectionner…</option>
              {dispensaires.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {errors.dispensaireId && <div className={styles.errorField}>{errors.dispensaireId}</div>}
          </div>
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
         
          <div className={styles.btnRow}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>Annuler</button>
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