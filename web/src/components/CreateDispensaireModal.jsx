import React, { useState, useRef, useEffect } from 'react';
import styles from './CreateUserModal.module.css'; // On réutilise le même CSS que CreateOrEditUserModal
import dispensaireService from '../services/dispensaires'; // Assure-toi que l'import est correct

const SYNODA_OPTIONS = ["SPBM", "SPA", "SPMel", "SPSofia"];

const CreateDispensaireModal = ({
  open,
  onClose,
  onCreated,
}) => {
  const [form, setForm] = useState({
    name: '',
    fileovana: '',
    synoda: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef();

  useEffect(() => {
    if (open) {
      setForm({ name: '', fileovana: '', synoda: '' });
      setErrors({});
      setServerError('');
      setLoading(false);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [open]);

  // Validation
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.fileovana.trim()) e.fileovana = 'Fileovana requis';
    if (!form.synoda) e.synoda = 'Synoda requis';
    return e;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
      // Prépare le payload pour la création
      const payload = {
        name: form.name,
        fileovana: form.fileovana,
        synoda: form.synoda,
      };
      // Appel du service
      const res = await dispensaireService.create(payload);
      if (res && res.id) {
        onCreated && onCreated(res);
        onClose && onClose();
      } else {
        setServerError("Erreur lors de la création du dispensaire");
      }
    } catch (err) {
      setServerError(err.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  // Fermer la modale avec ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = e => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={e => e.stopPropagation()}
      >
        <h2 className={styles.title}>
          <svg width={26} height={26} fill="none" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="8" fill="#2563eb" opacity="0.15"/>
            <rect x="6" y="6" width="12" height="12" rx="6" fill="#2563eb"/>
          </svg>
          Créer un dispensaire
        </h2>
        <div className={styles.subtitle}>
          Remplissez les informations pour ajouter un dispensaire.
        </div>
        <div aria-live="polite" className={styles.errorZone}>
          {serverError && (
            <div className={styles.errorMsg}>
              {serverError}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Nom */}
          <div className={styles.formGroup}>
            <label htmlFor="disp-name" className={styles.label}>
              Nom du dispensaire <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              ref={firstInputRef}
              id="disp-name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              aria-label="Nom du dispensaire"
              tabIndex={0}
              placeholder="Nom du dispensaire"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            />
            {errors.name && <div className={styles.errorField}>{errors.name}</div>}
          </div>
          {/* Fileovana */}
          <div className={styles.formGroup}>
            <label htmlFor="disp-fileovana" className={styles.label}>
              Fileovana <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="disp-fileovana"
              name="fileovana"
              type="text"
              required
              value={form.fileovana}
              onChange={handleChange}
              disabled={loading}
              aria-label="Fileovana"
              tabIndex={0}
              placeholder="Fileovana"
              className={`${styles.input} ${errors.fileovana ? styles.inputError : ''}`}
            />
            {errors.fileovana && <div className={styles.errorField}>{errors.fileovana}</div>}
          </div>
          {/* Synoda */}
          <div className={styles.formGroup}>
            <label htmlFor="disp-synoda" className={styles.label}>
              Synoda <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              id="disp-synoda"
              name="synoda"
              required
              value={form.synoda}
              onChange={handleChange}
              disabled={loading}
              aria-label="Synoda"
              tabIndex={0}
              className={`${styles.select} ${errors.synoda ? styles.selectError : ''}`}
            >
              <option value="">Sélectionner…</option>
              {SYNODA_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors.synoda && <div className={styles.errorField}>{errors.synoda}</div>}
          </div>
          {/* Boutons */}
          <div className={styles.btnRow}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              tabIndex={0}
              aria-label="Annuler"
              className={styles.cancelBtn}
            >Annuler</button>
            <button
              type="submit"
              disabled={loading}
              tabIndex={0}
              aria-label="Créer le dispensaire"
              className={styles.submitBtn}
            >
              {loading ? 'Création...' : 'Créer le dispensaire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDispensaireModal;