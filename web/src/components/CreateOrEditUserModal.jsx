import React, { useState, useRef, useEffect } from 'react';
import usersService from '../services/usersService';
import { USER_ROLES, SPECIALITES } from '../constants';
import styles from './CreateUserModal.module.css';
import {
  InputField,
  InputWithGenerator,
  SelectField,
  StatusSwitch,
  ModalFooter,
  ModalTitle,
  FormRow,
} from './form';

function randomString(length = 8) {
  return Math.random().toString(36).slice(-length);
}

const CreateOrEditUserModal = ({
  open,
  onClose,
  onSaved,
  dispensaires = [],
  user = null,
}) => {
  const isEdit = !!user;
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

  // Pré-remplir le formulaire si user existe
  useEffect(() => {
    if (open) {
      if (isEdit && user) {
        setForm({
          email: user.email || '',
          login: user.login || '',
          password: '', // vide pour la sécurité
          nom: user.nom || '',
          prenom: user.prenom || '',
          role: user.role || '',
          specialite: user.specialite || '',
          dispensaireId: user.dispensaireId || user.dispensaire?.id || '',
          isActive: user.isActive !== undefined ? user.isActive : true,
        });
      } else {
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
      }
      setErrors({});
      setServerError('');
      setLoading(false);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
    // eslint-disable-next-line
  }, [open, user]);

  // Génération login (création uniquement)
  const handleGenerateLogin = () => {
    const digits = Math.floor(1000 + Math.random() * 9000); // 4 chiffres
    setForm(f => ({ ...f, login: '' + digits }));
  };

  // Génération mot de passe (création uniquement)
  const handleGeneratePassword = () => {
    setForm(f => ({ ...f, password: randomString(10) }));
  };

  // Dynamique spécialité/dispensaire selon rôle
  useEffect(() => {
    if (form.role === 'agent') {
      setForm(f => ({
        ...f,
        specialite: f.specialite || SPECIALITES[0].value,
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

  // Validation
  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    if (!form.nom) e.nom = 'Nom requis';
    if (!form.prenom) e.prenom = 'Prénom requis';
    if (!form.role) e.role = 'Rôle requis';
    
    // ✅ CORRECTION : Valider dispensaire et specialite seulement pour les agents
    if (form.role === 'agent') {
      if (!form.specialite) e.specialite = 'Spécialité requise';
      if (!form.dispensaireId) e.dispensaireId = 'Dispensaire requis';
    }
    
    // Validation du mot de passe
    if (!isEdit && !form.password) {
      e.password = 'Mot de passe requis';
    }
    if (form.password && form.password.length < 6) {
      e.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return e;
  };

  // Changement de champ
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Soumission
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
      // ✅ CORRECTION : Ne pas envoyer dispensaireId/specialite si pas agent
      const payload = {
        email: form.email,
        login: form.login,
        password: form.password,
        nom: form.nom,
        prenom: form.prenom,
        role: form.role,
        isActive: form.isActive,
      };

      // ✅ Ajouter dispensaireId et specialite seulement pour les agents
      if (form.role === 'agent') {
        payload.dispensaireId = form.dispensaireId;
        payload.specialite = form.specialite;
      }

      // En création, retire isActive du payload
      if (!isEdit) {
        delete payload.isActive;
      }
      
      // En édition, retire password si vide
      if (isEdit && !form.password) {
        delete payload.password;
      }

      let res;
      if (isEdit) {
        res = await usersService.update(user.id, payload);
      } else {
        res = await usersService.create(payload);
      }
      
      if (res.success) {
        onSaved && onSaved(res.user);
        onClose && onClose();
      } else {
        setServerError(res.errors?.join(', ') || "Erreur lors de l'enregistrement");
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
        className={`${styles.modal} ${form.role === 'agent' ? styles.modalScrollable : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <ModalTitle
          title={isEdit ? "Modifier l'utilisateur" : "Ajouter un nouvel utilisateur"}
          subtitle={
            isEdit
              ? "Modifiez les informations de l'utilisateur puis enregistrez."
              : "Remplissez les informations pour ajouter un utilisateur au système."
          }
        />
        
        <div aria-live="polite" className={styles.errorZone}>
          {serverError && (
            <div className={styles.errorMsg}>
              {serverError}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Login */}
          <InputWithGenerator
            label="Login"
            id="login"
            name="login"
            value={form.login}
            onChange={handleChange}
            onGenerate={handleGenerateLogin}
            placeholder="Auto-généré ou personnalisé"
            error={errors.login}
            disabled={loading || isEdit}
            showGenerator={!isEdit}
            inputRef={firstInputRef}
          />

          {/* Mot de passe */}
          <InputWithGenerator
            label="Mot de passe"
            id="password"
            name="password"
            type="text"
            value={form.password}
            onChange={handleChange}
            onGenerate={handleGeneratePassword}
            placeholder={isEdit ? "Laisser vide pour ne pas changer" : "Mot de passe sécurisé"}
            error={errors.password}
            disabled={loading}
            showGenerator={!isEdit}
          />

          {/* Email */}
          <InputField
            label="Email"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="nom@exemple.com"
            error={errors.email}
            disabled={loading || isEdit}
            autoComplete="email"
          />

          {/* Prénom et Nom - Side by side */}
          <FormRow gap="md">
            <InputField
              label="Prénom"
              id="prenom"
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              required
              placeholder="Entrez le prénom"
              error={errors.prenom}
              disabled={loading}
            />
            <InputField
              label="Nom"
              id="nom"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              placeholder="Entrez le nom"
              error={errors.nom}
              disabled={loading}
            />
          </FormRow>

          {/* Rôle */}
          <SelectField
            label="Rôle"
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            options={USER_ROLES}
            required
            placeholder="Sélectionnez un rôle"
            error={errors.role}
            disabled={loading}
          />

          {/* Spécialité (agent) */}
          {form.role === 'agent' && (
            <SelectField
              label="Spécialité"
              id="specialite"
              name="specialite"
              value={form.specialite}
              onChange={handleChange}
              options={SPECIALITES}
              required
              placeholder="Sélectionnez une spécialité"
              error={errors.specialite}
              disabled={loading}
            />
          )}

          {/* Dispensaire (agent) */}
          {form.role === 'agent' && (
            <SelectField
              label="Dispensaire"
              id="dispensaireId"
              name="dispensaireId"
              value={form.dispensaireId}
              onChange={handleChange}
              options={dispensaires.map(d => ({ value: d.id, label: d.name }))}
              required
              placeholder={dispensaires.length === 0 ? 'Chargement...' : 'Sélectionnez un dispensaire'}
              error={errors.dispensaireId}
              disabled={loading || dispensaires.length === 0}
            />
          )}

          {/* Statut actif */}
          {isEdit && (
            <StatusSwitch
              id="isActive"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              disabled={loading}
              activeLabel="Actif"
              inactiveLabel="Inactif"
              ariaLabel="Statut de l'utilisateur"
            />
          )}

          {/* Boutons */}
          <ModalFooter
            onCancel={onClose}
            cancelLabel="Annuler"
            submitLabel={isEdit ? "Enregistrer" : "Enregistrer"}
            loading={loading}
            loadingLabel={isEdit ? 'Enregistrement...' : 'Création...'}
          />
        </form>
      </div>
    </div>
  );
};

export default CreateOrEditUserModal;