import React, { useState } from 'react';
import styles from './TatitraExportModal.module.css';

const TatitraExportModal = ({ isOpen, onClose, onExport }) => {
  const currentYear = new Date().getFullYear();
  const [quarter, setQuarter] = useState('VOALOHANY');
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);

  // Quarter options in Malagasy
  const quarters = [
    { value: 'VOALOHANY', label: 'VOALOHANY (Janvier - Mars)' },
    { value: 'FAHAROA', label: 'FAHAROA (Avril - Juin)' },
    { value: 'FAHATELO', label: 'FAHATELO (Juillet - Septembre)' },
    { value: 'EFATRA', label: 'EFATRA (Octobre - Décembre)' }
  ];

  // Generate year options (current year and 4 previous years)
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleExport = async () => {
    setLoading(true);
    try {
      await onExport(quarter, year);
      setLoading(false);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Exporter Rapport Tatitra</h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Fermer"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label htmlFor="quarter" className={styles.label}>
              Taon-jato (Trimestre) :
            </label>
            <select
              id="quarter"
              className={styles.select}
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              disabled={loading}
            >
              {quarters.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="year" className={styles.label}>
              Taona (Année) :
            </label>
            <select
              id="year"
              className={styles.select}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              disabled={loading}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.info}>
            <p className={styles.infoText}>
              📄 Le rapport sera généré au format PDF et téléchargé automatiquement.
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            className={styles.exportButton}
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Génération...
              </>
            ) : (
              'Exporter PDF'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TatitraExportModal;
