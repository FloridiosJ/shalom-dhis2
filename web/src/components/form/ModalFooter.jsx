import React from 'react';
import styles from './ModalFooter.module.css';

/**
 * ModalFooter - Reusable modal footer with action buttons
 * @param {Object} props
 * @param {function} props.onCancel - Cancel button handler
 * @param {function} props.onSubmit - Submit button handler (optional if form handles it)
 * @param {string} props.cancelLabel - Cancel button text
 * @param {string} props.submitLabel - Submit button text
 * @param {boolean} props.loading - Is submit in progress
 * @param {string} props.loadingLabel - Loading state text
 * @param {boolean} props.submitDisabled - Is submit disabled
 */
const ModalFooter = ({
  onCancel,
  onSubmit,
  cancelLabel = 'Annuler',
  submitLabel = 'Enregistrer',
  loading = false,
  loadingLabel = 'Enregistrement...',
  submitDisabled = false,
}) => {
  return (
    <div className={styles.footer}>
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className={styles.cancelBtn}
        aria-label={cancelLabel}
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={loading || submitDisabled}
        className={styles.submitBtn}
        aria-label={submitLabel}
      >
        {loading ? loadingLabel : submitLabel}
      </button>
    </div>
  );
};

export default ModalFooter;
