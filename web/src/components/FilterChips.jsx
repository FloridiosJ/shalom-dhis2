import React from 'react';
import styles from './FilterChips.module.css';

const FilterChips = ({ 
  dispensaires = [], 
  selectedDispensaire, 
  onDispensaireChange,
  selectedStatut,
  onStatutChange,
  selectedSexe,
  onSexeChange,
  onClearAll
}) => {
  const statuts = [
    { value: 'all', label: 'Tous' },
    { value: 'actif', label: 'Actif' },
    { value: 'inactif', label: 'Inactif' }
  ];

  const sexes = [
    { value: 'all', label: 'Tous' },
    { value: 'M', label: 'Masculin' },
    { value: 'F', label: 'Féminin' }
  ];

  const hasActiveFilters = selectedDispensaire !== 'all' || selectedStatut !== 'all' || selectedSexe !== 'all';

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Dispensaire:</label>
        <div className={styles.chipGroup}>
          <button
            className={`${styles.chip} ${selectedDispensaire === 'all' ? styles.active : ''}`}
            onClick={() => onDispensaireChange('all')}
            type="button"
          >
            Tous
          </button>
          {dispensaires.map((disp) => (
            <button
              key={disp.id}
              className={`${styles.chip} ${selectedDispensaire === disp.id ? styles.active : ''}`}
              onClick={() => onDispensaireChange(disp.id)}
              type="button"
            >
              {disp.name}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Statut:</label>
        <div className={styles.chipGroup}>
          {statuts.map((statut) => (
            <button
              key={statut.value}
              className={`${styles.chip} ${selectedStatut === statut.value ? styles.active : ''}`}
              onClick={() => onStatutChange(statut.value)}
              type="button"
            >
              {statut.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Sexe:</label>
        <div className={styles.chipGroup}>
          {sexes.map((sexe) => (
            <button
              key={sexe.value}
              className={`${styles.chip} ${selectedSexe === sexe.value ? styles.active : ''}`}
              onClick={() => onSexeChange(sexe.value)}
              type="button"
            >
              {sexe.label}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          className={styles.clearButton}
          onClick={onClearAll}
          type="button"
          aria-label="Effacer tous les filtres"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 4 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Effacer les filtres
        </button>
      )}
    </div>
  );
};

export default FilterChips;
