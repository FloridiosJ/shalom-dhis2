import React, { useState, useRef, useEffect } from 'react';
import usersService from '../services/usersService';
import styles from './CreateUserModal.module.css';

const roles = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'manager', label: 'Manager' },
  { value: 'agent', label: 'Agent' },
];

const specialites = [
  { value: 'sage_femme', label: 'Sage-femme' },
  { value: 'infirmier', label: 'Infirmier' },
  { value: 'infirmière', label: 'Infirmière' },
];

function randomString(length = 8) {
  return Math.random().toString(36).slice(-length);
}

const CreateUserModal = ({
  open,
  onClose,
  onCreated,
  dispensaires = [],
}) => {
  const [form, setForm] = useState({
    email: '',
    login: '',
    password: '',
    nom: '',
    prenom: '',
    role: '',
    specialite: '',
    dispensaireId: '',
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const firstInputRef = useRef();

  useEffect(() => {
    if (open) {
      setForm({
        email: '',
        login: '',
        password: '',
        nom: '',
        prenom: '',
        role: '',
        specialite: '',
        dispensaireId: '',
        isActive: true,
      });
      setErrors({});
      setServerError('');
      setLoading(false);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleGenerateLogin = () => {
    const digits = Math.floor(1000 + Math.random() * 9000); // 4 chiffres
    setForm(f => ({ ...f, login: '' + digits.toString() }));
  };

  const handleGeneratePassword = () => {
    setForm(f => ({ ...f, password: randomString(10) }));
  };

  useEffect(() => {
    if (form.role === 'agent') {
      setForm(f => ({
        ...f,
        specialite: f.specialite || specialites[0].value,
        dispensaireId: f.dispensaireId || (dispensaires[0]?.id || ''),
      }));
    } else {
      setForm(f => ({
        ...f,
        specialite: '',
        dispensaireId: '',
      }));
    }
    // eslint-disable-next-line
  }, [form.role]);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    if (!form.nom) e.nom = 'Nom requis';
    if (!form.prenom) e.prenom = 'Prénom requis';
    if (!form.role) e.role = 'Rôle requis';
    if (form.role === 'agent') {
      if (!form.specialite) e.specialite = 'Spécialité requise';
      if (!form.dispensaireId) e.dispensaireId = 'Dispensaire requis';
    }
    return e;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
      // Retire isActive du payload envoyé à l'API
      const { isActive, ...payload } = {
        ...form,
        dispensaireId: form.role === 'agent' ? form.dispensaireId : undefined,
        specialite: form.role === 'agent' ? form.specialite : undefined,
      };
      const res = await usersService.create(payload);
      if (res.success) {
        onCreated && onCreated(res.user);
        onClose && onClose();
      } else {
        setServerError(res.errors?.join(', ') || "Erreur lors de la création");
      }
    } catch (err) {
      setServerError(err.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

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
            <circle cx="12" cy="7" r="5" fill="#2563eb" opacity="0.15"/>
            <circle cx="12" cy="7" r="4" fill="#2563eb"/>
            <rect x="4" y="15" width="16" height="6" rx="3" fill="#2563eb" opacity="0.15"/>
            <rect x="6" y="16" width="12" height="4" rx="2" fill="#2563eb"/>
          </svg>
          Créer un utilisateur
        </h2>
        <div className={styles.subtitle}>
          Remplissez les informations pour ajouter un utilisateur au système.
        </div>
        <div
          aria-live="polite"
          className={styles.errorZone}
        >
          {serverError && (
            <div className={styles.errorMsg}>
              {serverError}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              ref={firstInputRef}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              aria-label="Email"
              tabIndex={0}
              placeholder="exemple@domaine.com"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            />
            {errors.email && <div className={styles.errorField}>{errors.email}</div>}
          </div>
          {/* Login */}
          <div className={styles.formGroup}>
            <label htmlFor="login" className={styles.label}>
              Login
            </label>
            <div className={styles.inputRow}>
              <input
                id="login"
                name="login"
                type="text"
                value={form.login}
                onChange={handleChange}
                disabled={loading || form.role === 'agent'}
                aria-label="Login"
                tabIndex={0}
                placeholder="Auto-généré ou personnalisé"
                className={`${styles.input} ${errors.login ? styles.inputError : ''}`}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label="Générer login"
                onClick={handleGenerateLogin}
                disabled={loading || form.role === 'agent'}
                className={styles.genBtn}
              >Générer</button>
            </div>
            {errors.login && <div className={styles.errorField}>{errors.login}</div>}
          </div>
          {/* Mot de passe */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Mot de passe
            </label>
            <div className={styles.inputRow}>
              <input
                id="password"
                name="password"
                type="text"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                aria-label="Mot de passe"
                tabIndex={0}
                placeholder="Mot de passe sécurisé"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label="Générer mot de passe"
                onClick={handleGeneratePassword}
                disabled={loading}
                className={styles.genBtn}
              >Générer</button>
            </div>
            {errors.password && <div className={styles.errorField}>{errors.password}</div>}
          </div>
          {/* Nom */}
          <div className={styles.formGroup}>
            <label htmlFor="nom" className={styles.label}>
              Nom <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              required
              value={form.nom}
              onChange={handleChange}
              disabled={loading}
              aria-label="Nom"
              tabIndex={0}
              placeholder="Nom de famille"
              className={`${styles.input} ${errors.nom ? styles.inputError : ''}`}
            />
            {errors.nom && <div className={styles.errorField}>{errors.nom}</div>}
          </div>
          {/* Prénom */}
          <div className={styles.formGroup}>
            <label htmlFor="prenom" className={styles.label}>
              Prénom <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="prenom"
              name="prenom"
              type="text"
              required
              value={form.prenom}
              onChange={handleChange}
              disabled={loading}
              aria-label="Prénom"
              tabIndex={0}
              placeholder="Prénom"
              className={`${styles.input} ${errors.prenom ? styles.inputError : ''}`}
            />
            {errors.prenom && <div className={styles.errorField}>{errors.prenom}</div>}
          </div>
          {/* Rôle */}
          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.label}>
              Rôle <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              id="role"
              name="role"
              required
              value={form.role}
              onChange={handleChange}
              disabled={loading}
              aria-label="Rôle"
              tabIndex={0}
              className={`${styles.select} ${errors.role ? styles.selectError : ''}`}
            >
              <option value="">Sélectionner un rôle</option>
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errors.role && <div className={styles.errorField}>{errors.role}</div>}
          </div>
          {/* Spécialité (agent) */}
          {form.role === 'agent' && (
            <div className={styles.formGroup}>
              <label htmlFor="specialite" className={styles.label}>
                Spécialité <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                id="specialite"
                name="specialite"
                required
                value={form.specialite}
                onChange={handleChange}
                disabled={loading}
                aria-label="Spécialité"
                tabIndex={0}
                className={`${styles.select} ${errors.specialite ? styles.selectError : ''}`}
              >
                <option value="">Sélectionner une spécialité</option>
                {specialites.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {errors.specialite && <div className={styles.errorField}>{errors.specialite}</div>}
            </div>
          )}
          {/* Dispensaire (agent) */}
          {form.role === 'agent' && (
            <div className={styles.formGroup}>
              <label htmlFor="dispensaireId" className={styles.label}>
                Dispensaire <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                id="dispensaireId"
                name="dispensaireId"
                required
                value={form.dispensaireId}
                onChange={handleChange}
                disabled={loading}
                aria-label="Dispensaire"
                tabIndex={0}
                className={`${styles.select} ${errors.dispensaireId ? styles.selectError : ''}`}
              >
                <option value="">Sélectionner un dispensaire</option>
                {dispensaires.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {errors.dispensaireId && <div className={styles.errorField}>{errors.dispensaireId}</div>}
            </div>
          )}
          {/* Statut actif */}
          <div className={styles.checkboxRow}>
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
              disabled={loading}
              aria-label="Statut actif"
              tabIndex={0}
              className={styles.checkbox}
            />
            <label htmlFor="isActive" className={styles.checkboxLabel}>
              Utilisateur actif
            </label>
          </div>
          {/* Boutons */}
          <div className={styles.btnRow}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              tabIndex={0}
              aria-label="Annuler la création"
              className={styles.cancelBtn}
            >Annuler</button>
            <button
              type="submit"
              disabled={loading}
              tabIndex={0}
              aria-label="Créer l'utilisateur"
              className={styles.submitBtn}
            >
              {loading ? 'Création...' : "Créer l'utilisateur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;