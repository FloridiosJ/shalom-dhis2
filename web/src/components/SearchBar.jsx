import React from 'react';
import styles from '../pages/DataEntries.module.css';

/**
 * SearchBar component for filtering data
 * @param {Object} props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Callback when search value changes
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {string} props.className - Optional additional CSS class
 */
const SearchBar = ({ value, onChange, placeholder = "Rechercher...", className = "" }) => {
  return (
    <div className={`${styles.searchBar} ${className}`}>
      <input
        className={styles.searchInput}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
