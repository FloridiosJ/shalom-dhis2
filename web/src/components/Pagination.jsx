import React from 'react';
import styles from '../pages/DataEntries.module.css';

/**
 * Pagination component for navigating through pages
 * @param {Object} props
 * @param {number} props.currentPage - Current page number (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.startIndex - Index of first item on current page (0-indexed)
 * @param {number} props.endIndex - Index of last item on current page (0-indexed)
 * @param {Function} props.onPageChange - Callback when page changes
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={styles.pagination} role="navigation" aria-label="Pagination de la table">
      <button 
        className={styles.paginationBtn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Page précédente"
        aria-disabled={currentPage === 1}
      >
        ← Précédent
      </button>
      <div className={styles.paginationInfo} aria-live="polite" aria-atomic="true">
        Page {currentPage} sur {totalPages} — Affichage de {startIndex + 1} à {Math.min(endIndex, totalItems)} sur {totalItems} résultat{totalItems > 1 ? 's' : ''}
      </div>
      <button 
        className={styles.paginationBtn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Page suivante"
        aria-disabled={currentPage === totalPages}
      >
        Suivant →
      </button>
    </nav>
  );
};

export default Pagination;
