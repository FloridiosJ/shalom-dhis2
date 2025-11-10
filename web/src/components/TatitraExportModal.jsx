import React, { useState } from 'react';
import styles from './TatitraExportModal.module.css';

const TatitraExportModal = ({ isOpen, onClose, onExport, loading }) => {
  const currentYear = new Date().getFullYear();
  const [quarter, setQuarter] = useState('EFATRA');
  const [year, setYear] = useState(currentYear);

  const quarters = [
    { value: 'VOALOHANY', label: 'Trimestre 1 (Jan-Mar)', months: 'Janoary - Martsa' },
    { value: 'FAHAROA', label: 'Trimestre 2 (Apr-Jun)', months: 'Aprily - Jona' },
    { value: 'FAHATELO', label: 'Trimestre 3 (Jul-Sep)', months: 'Jolay - Septambra' },
    { value: 'EFATRA', label: 'Trimestre 4 (Oct-Dec)', months: 'Oktobra - Desambra' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onExport({ quarter, year });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Exporter le Rapport Trimestriel (Tatitra)
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fermer"
            disabled={loading}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="quarter" className={styles.label}>
              Sélectionner le trimestre :
            </label>
            <select
              id="quarter"
              className={styles.select}
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              disabled={loading}
              required
            >
              {quarters.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.label} - {q.months}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="year" className={styles.label}>
              Année :
            </label>
            <select
              id="year"
              className={styles.select}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              disabled={loading}
              required
            >
              {[...Array(5)].map((_, i) => {
                const y = currentYear - i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>

          <div className={styles.infoBox}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 16h-1v-6h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className={styles.infoText}>
                Le rapport Tatitra (CSB Loterana) sera généré au format PDF avec les données du trimestre sélectionné.
              </p>
              <p className={styles.infoText}>
                Le rapport inclut les statistiques de santé par zone et par catégorie de maladie.
              </p>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={styles.exportButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24">
                    <circle
                      className={styles.spinnerCircle}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                  </svg>
                  Génération...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exporter PDF
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TatitraExportModal;
