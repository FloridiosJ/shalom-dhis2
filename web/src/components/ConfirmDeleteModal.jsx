import React, { useRef, useEffect, useState } from 'react';
import styles from './CreateUserModal.module.css';

const ConfirmDeleteModal = ({
  open,
  onClose,
  onConfirm,
  user,
  loading = false,
  error = '',
}) => {
  const cancelBtnRef = useRef();

  useEffect(() => {
    if (open) {
      setTimeout(() => cancelBtnRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-desc"
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        style={{ maxWidth: 400, textAlign: 'center' }}
        onClick={e => e.stopPropagation()}
      >
        <h2
          id="confirm-delete-title"
          className={styles.title}
          style={{ color: '#ef4444', justifyContent: 'center' }}
        >
          Confirmer la suppression
        </h2>
        <div
          id="confirm-delete-desc"
          className={styles.subtitle}
          style={{ marginBottom: 18 }}
        >
          Êtes-vous sûr de vouloir supprimer l'utilisateur&nbsp;
          <b>
            {user?.nom} {user?.prenom}
            {user?.email ? ` (${user.email})` : ''}
          </b>
          &nbsp;? Cette action est <span style={{ color: '#ef4444', fontWeight: 600 }}>irréversible</span>.
        </div>
        {error && (
          <div className={styles.errorMsg} style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}
        <div className={styles.btnRow} style={{ justifyContent: 'center', gap: 16 }}>
          <button
            ref={cancelBtnRef}
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={loading}
            aria-label="Annuler la suppression"
            style={{ minWidth: 120 }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            aria-label="Supprimer définitivement"
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.7em 1.5em',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(239,68,68,0.13)',
              minWidth: 180,
              transition: 'background 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Suppression...' : 'Supprimer définitivement'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;