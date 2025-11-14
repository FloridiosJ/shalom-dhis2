import React, { useState, useRef, useEffect } from 'react';
import { COMMON_FREQUENCIES } from '../../constants';
import styles from '../CreateDataEntryModal.module.css';

const FrequencySelector = ({ value, onChange, disabled }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleSelect = (frequency) => {
    onChange(frequency);
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSearchTerm(newValue);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
    setSearchTerm(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const filteredFrequencies = COMMON_FREQUENCIES.filter(freq => {
    const searchLower = (searchTerm || value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const freqLower = freq.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return freqLower.includes(searchLower);
  });

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder="Ex: 3x/jour, matin et soir..."
        disabled={disabled}
        autoComplete="off"
        aria-label="Fréquence du médicament"
      />

      {showDropdown && filteredFrequencies.length > 0 && (
        <div 
          className={styles.categorySelectorDropdown}
          role="listbox"
          aria-label="Sélecteur de fréquence"
        >
          <div className={styles.categoryListContainer}>
            {filteredFrequencies.map((freq) => (
              <div
                key={freq}
                className={styles.categorySelectorItem}
                onClick={() => handleSelect(freq)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(freq);
                  }
                }}
                role="option"
                tabIndex={0}
                aria-selected={value === freq}
              >
                <div className={styles.categoryItemContent}>
                  <strong className={styles.categoryItemName}>{freq}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.categoryDropdownFooter}>
            <button
              type="button"
              className={styles.categoryCloseBtn}
              onClick={() => {
                setShowDropdown(false);
                inputRef.current?.blur();
              }}
            >
              Fermer (Échap)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrequencySelector;
