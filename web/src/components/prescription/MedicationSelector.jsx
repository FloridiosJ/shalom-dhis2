import React, { useState, useRef, useEffect } from 'react';
import { COMMON_MEDICATIONS } from '../../constants';
import styles from '../CreateDataEntryModal.module.css';

const MedicationSelector = ({ itemId, value, onChange, disabled }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSearchTerm('');
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleSelect = (medication) => {
    onChange(medication);
    setShowDropdown(false);
    setSearchTerm('');
  };

  const filteredMedications = COMMON_MEDICATIONS.filter(med => {
    const searchLower = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const medLower = med.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return medLower.includes(searchLower);
  });

  if (value) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        padding: '0.5rem',
        background: '#fff',
        borderRadius: '0.5rem',
        border: '1px solid #cbd5e1'
      }}>
        <span style={{ flex: 1, fontWeight: 500 }}>{value}</span>
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '0.25rem',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) {
            setTimeout(() => searchRef.current?.focus(), 100);
          }
        }}
        className={styles.addCategoryBtn}
        disabled={disabled}
        style={{ width: '100%' }}
      >
        + Sélectionner un médicament
      </button>

      {showDropdown && (
        <div 
          className={styles.categorySelectorDropdown}
          role="listbox"
          aria-label="Sélecteur de médicaments"
        >
          <div className={styles.categorySearchContainer}>
            <input
              ref={searchRef}
              type="text"
              className={styles.categorySearchInput}
              placeholder="Rechercher un médicament..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowDropdown(false);
                  setSearchTerm('');
                }
              }}
              aria-label="Rechercher un médicament"
            />
            <svg 
              className={styles.categorySearchIcon}
              width="16" 
              height="16" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className={styles.categoryListContainer}>
            {filteredMedications.map((med) => (
              <div
                key={med}
                className={styles.categorySelectorItem}
                onClick={() => handleSelect(med)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(med);
                  }
                }}
                role="option"
                tabIndex={0}
                aria-selected="false"
              >
                <div className={styles.categoryItemContent}>
                  <strong className={styles.categoryItemName}>{med}</strong>
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
                setSearchTerm('');
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

export default MedicationSelector;
