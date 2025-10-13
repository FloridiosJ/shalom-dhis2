import React, { useState, useRef, useEffect } from 'react';
import styles from './CreateUserModal.module.css'; // Réutilise le style utilisateur

const RELIGIONS = ["Kristianina", "Musulman", "traditionnelle"];
const SEXES = ["M", "F"];

const CreatePatientModal = ({ open, onClose, onSaved, dispensaires }) => {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    age: '',
    sexe: '',
    religion: '',
    village: '',
    dispensaireId: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef();

  useEffect(() => {
    if (open) {
      setForm({
        nom: '',
        prenom: '',
        age: '',
        sexe: '',
        religion: '',
        village: '',
        dispensaireId: ''
      });
      setErrors({});
      setServerError('');
      setLoading(false);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [open]);

  const validate = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = 'Nom requis';
    if (!form.prenom.trim()) e.prenom = 'Prénom requis';
    if (!form.age || isNaN(form.age)) e.age = 'Âge requis';
    if (!form.sexe) e.sexe = 'Sexe requis';
    if (!form.religion) e.religion = 'Religion requise';
    if (!form.village.trim()) e.village = 'Village requis';
    if (!form.dispensaireId) e.dispensaireId = 'Dispensaire requis';
    return e;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});
    setServerError('');
    const eFront = validate();
    if (Object.keys(eFront).length) {
      setErrors(eFront);
      return;
    }
    setLoading(true);
    try {
      // Appel mutation GraphQL via patientService
      await window.patientService.create({
        ...form,
        age: parseInt(form.age, 10)
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
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Ajouter un patient</h2>
        {serverError && <div className={styles.errorMsg}>{serverError}</div>}
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
          <div className={styles.formGroup}>
            <label htmlFor="patient-nom" className={styles.label}>Nom <span aria-hidden="true" style={{color:'#dc2626'}}>*</span></label>
            <input
              ref={firstInputRef}
              id="patient-nom"
              name="nom"
              className={styles.input}
              value={form.nom}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {errors.nom && <div className={styles.errorField}>{errors.nom}</div>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="patient-prenom" className={styles.label}>Prénom <span aria-hidden="true" style={{color:'#dc2626'}}>*</span></label>
            <input
              id="patient-prenom"
              name="prenom"
              className={styles.input}
              value={form.prenom}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {errors.prenom && <div className={styles.errorField}>{errors.prenom}</div>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="patient-age" className={styles.label}>Âge <span aria-hidden="true" style={{color:'#dc2626'}}>*</span></label>
            <input
              id="patient-age"
              name="age"
              type="number"
              min="0"
              className={styles.input}
              value={form.age}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {errors.age && <div className={styles.errorField}>{errors.age}</div>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="patient-sexe" className={styles.label}>Sexe <span aria-hidden="true" style={{color:'#dc2626'}}>*</span></label>
            <select
              id="patient-sexe"
              name="sexe"
              className={styles.input}
              value={form.sexe}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Sélectionner…</option>
              {SEXES.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors.sexe && <div className={styles.errorField}>{errors.sexe}</div>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="patient-religion" className={styles.label}>Religion <span aria-hidden="true" style={{color:'#dc2626'}}>*</span></label>
            <select
              id="patient-religion"
              name="religion"
              className={styles.input}
              value={form.religion}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Sélectionner…</option>
              {RELIGIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors.religion && <div className={styles.errorField}>{errors.religion}</div>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="patient-village" className={styles.label}>Village <span aria-hidden="true" style={{color:'#dc2626'}}>*</span></label>
            <input
              id="patient-village"
              name="village"
              className={styles.input}
              value={form.village}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {errors.village && <div className={styles.errorField}>{errors.village}</div>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="patient-dispensaire" className={styles.label}>Dispensaire <span aria-hidden="true" style={{color:'#dc2626'}}>*</span></label>
            <select
              id="patient-dispensaire"
              name="dispensaireId"
              className={styles.input}
              value={form.dispensaireId}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Sélectionner…</option>
              {dispensaires.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {errors.dispensaireId && <div className={styles.errorField}>{errors.dispensaireId}</div>}
          </div>
          <div className={styles.btnRow}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Création..." : "Créer le patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePatientModal;