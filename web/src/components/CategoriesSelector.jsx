import React, { useState, useEffect, useRef } from 'react';
import styles from './CreateDataEntryModal.module.css';

/**
 * CategoriesSelector component - Manages disease category selection
 * @param {Object} props
 * @param {Array} props.categories - Array of all available categories
 * @param {Array} props.selectedCategories - Array of selected categories with metadata
 * @param {Function} props.onChange - Callback when categories change
 * @param {boolean} props.loading - Whether form is loading
 * @param {string} props.error - Error message to display
 */
const CategoriesSelector = ({
  categories = [],
  selectedCategories = [],
  onChange,
  loading = false,
  error = "",
}) => {
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const categorySearchRef = useRef();
  const categoryDropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCategorySelector && 
          categoryDropdownRef.current && 
          !categoryDropdownRef.current.contains(event.target)) {
        setShowCategorySelector(false);
        setCategorySearchTerm("");
      }
    };

    if (showCategorySelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCategorySelector]);

  const handleAddCategory = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    // Check if already added
    if (selectedCategories.some(c => c.categorieMaladieId === categoryId)) {
      return;
    }

    const newCategory = {
      categorieMaladieId: categoryId,
      isPrincipal: selectedCategories.length === 0, // First is principal by default
      notes: "",
      // Info for display
      nom: category.nom,
      code: category.code,
    };

    onChange([...selectedCategories, newCategory]);
    setShowCategorySelector(false);
    setCategorySearchTerm("");
  };

  const handleRemoveCategory = (categoryId) => {
    onChange(selectedCategories.filter(c => c.categorieMaladieId !== categoryId));
  };

  const handleSetPrincipal = (categoryId) => {
    onChange(
      selectedCategories.map(c => ({
        ...c,
        isPrincipal: c.categorieMaladieId === categoryId
      }))
    );
  };

  const handleCategoryNoteChange = (categoryId, notes) => {
    onChange(
      selectedCategories.map(c => 
        c.categorieMaladieId === categoryId ? { ...c, notes } : c
      )
    );
  };

  // Filter available categories (not yet selected)
  const availableCategories = categories.filter(
    cat => !selectedCategories.some(sc => sc.categorieMaladieId === cat.id)
  );

  // Filter categories by search term
  const filteredCategories = availableCategories.filter(cat => {
    if (!categorySearchTerm.trim()) return true;
    const searchLower = categorySearchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const nomLower = (cat.nom || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return nomLower.includes(searchLower);
  });

  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        Catégories de maladies <span aria-hidden="true" style={{ color: "#dc2626" }}>*</span>
      </label>
      
      {/* List of selected categories */}
      {selectedCategories.length > 0 && (
        <div className={styles.categoriesList}>
          {selectedCategories.map((cat) => (
            <div key={cat.categorieMaladieId} className={styles.categoryItem}>
              <div className={styles.categoryHeader}>
                <div className={styles.categoryName}>
                  {cat.isPrincipal && (
                    <span className={styles.principalBadge}>★ Principale</span>
                  )}
                  <strong>{cat.nom}</strong>
                </div>
                <div className={styles.categoryActions}>
                  {!cat.isPrincipal && selectedCategories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleSetPrincipal(cat.categorieMaladieId)}
                      className={styles.setPrincipalBtn}
                      title="Marquer comme principale"
                    >
                      ★
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat.categorieMaladieId)}
                    className={styles.removeBtn}
                    title="Retirer"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Notes pour cette catégorie (optionnel)"
                value={cat.notes}
                onChange={(e) => handleCategoryNoteChange(cat.categorieMaladieId, e.target.value)}
                className={styles.categoryNotesInput}
              />
            </div>
          ))}
        </div>
      )}

      {/* Add category button */}
      {availableCategories.length > 0 && (
        <div style={{ position: 'relative' }} ref={categoryDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setShowCategorySelector(!showCategorySelector);
              if (!showCategorySelector) {
                setTimeout(() => categorySearchRef.current?.focus(), 100);
              }
            }}
            className={styles.addCategoryBtn}
            disabled={loading}
            aria-expanded={showCategorySelector}
            aria-haspopup="listbox"
          >
            + Ajouter une catégorie
          </button>

          {showCategorySelector && (
            <div 
              className={styles.categorySelectorDropdown}
              role="listbox"
              aria-label="Sélecteur de catégories"
            >
              {/* Search field */}
              <div className={styles.categorySearchContainer}>
                <input
                  ref={categorySearchRef}
                  type="text"
                  className={styles.categorySearchInput}
                  placeholder="Rechercher une catégorie..."
                  value={categorySearchTerm}
                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowCategorySelector(false);
                      setCategorySearchTerm("");
                    } else if (e.key === 'Enter' && filteredCategories.length === 1) {
                      e.preventDefault();
                      handleAddCategory(filteredCategories[0].id);
                    }
                  }}
                  aria-label="Rechercher une catégorie"
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

              {/* Filtered categories list */}
              <div className={styles.categoryListContainer}>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className={styles.categorySelectorItem}
                      onClick={() => handleAddCategory(cat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleAddCategory(cat.id);
                        }
                      }}
                      role="option"
                      tabIndex={0}
                      aria-selected="false"
                    >
                      <div className={styles.categoryItemContent}>
                        <strong className={styles.categoryItemName}>{cat.nom}</strong>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.categoryNoResults}>
                    Aucune catégorie trouvée
                  </div>
                )}
              </div>

              {/* Close button */}
              <div className={styles.categoryDropdownFooter}>
                <button
                  type="button"
                  className={styles.categoryCloseBtn}
                  onClick={() => {
                    setShowCategorySelector(false);
                    setCategorySearchTerm("");
                  }}
                >
                  Fermer (Échap)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {error && <div className={styles.errorField}>{error}</div>}
    </div>
  );
};

export default CategoriesSelector;
