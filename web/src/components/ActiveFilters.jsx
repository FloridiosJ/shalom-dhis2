import React from 'react';
import styles from './ActiveFilters.module.css';

/**
 * Component to display active filters as chips
 */
const ActiveFilters = ({ filters, onRemoveFilter, onClearAll }) => {
  const activeFilters = [];

  // Build array of active filters
  if (filters.dispensaire && filters.dispensaire !== 'all') {
    activeFilters.push({
      key: 'dispensaire',
      label: filters.dispensaireLabel || filters.dispensaire,
      value: filters.dispensaire,
    });
  }

  if (filters.period && filters.period !== 'month') {
    const periodLabels = {
      day: 'Par jour',
      week: 'Par semaine',
      month: 'Par mois',
      year: 'Par année',
    };
    activeFilters.push({
      key: 'period',
      label: periodLabels[filters.period] || filters.period,
      value: filters.period,
    });
  }

  if (filters.dateRange) {
    activeFilters.push({
      key: 'dateRange',
      label: `${filters.dateRange.startDate} → ${filters.dateRange.endDate}`,
      value: filters.dateRange,
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.label}>Filtres actifs:</div>
      <div className={styles.chipGroup}>
        {activeFilters.map((filter) => (
          <button
            key={filter.key}
            className={styles.chip}
            onClick={() => onRemoveFilter(filter.key)}
            type="button"
            aria-label={`Retirer le filtre ${filter.label}`}
          >
            <span className={styles.chipLabel}>{filter.label}</span>
            <svg 
              width="14" 
              height="14" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              className={styles.chipIcon}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ))}
        {activeFilters.length > 1 && (
          <button
            className={styles.clearAllBtn}
            onClick={onClearAll}
            type="button"
            aria-label="Effacer tous les filtres"
          >
            Tout effacer
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveFilters;
