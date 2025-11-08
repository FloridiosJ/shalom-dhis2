import React from 'react';
import styles from './ModernSearchBar.module.css';

/**
 * ModernSearchBar component with filter button
 * @param {Object} props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Callback when search value changes
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {Function} props.onFilterClick - Callback when filter button is clicked
 * @param {boolean} props.showFilter - Whether to show the filter button
 */
const ModernSearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Rechercher par nom...", 
  onFilterClick,
  showFilter = true 
}) => {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <svg 
          className={styles.searchIcon} 
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.searchInput}
          aria-label="Rechercher"
        />
      </div>
      {showFilter && (
        <button 
          type="button"
          onClick={onFilterClick}
          className={styles.filterButton}
          aria-label="Filtrer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Filtrer
        </button>
      )}
    </div>
  );
};

export default ModernSearchBar;
