import React from 'react';
import PrescriptionItemCard from './prescription/PrescriptionItemCard';
import styles from './CreateDataEntryModal.module.css';

/**
 * PrescriptionList component - Manages structured prescription items
 * @param {Object} props
 * @param {Array} props.items - Array of prescription items
 * @param {Function} props.onChange - Callback when items change
 * @param {boolean} props.loading - Whether form is loading
 */
const PrescriptionList = ({ items = [], onChange, loading = false }) => {
  const handleAddItem = () => {
    const newItem = {
      id: `temp-${Date.now()}`,
      medicament: "",
      dose: "",
      frequence: "",
      duree: "",
      notes: "",
      ordre: items.length
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (itemId) => {
    onChange(items.filter(item => item.id !== itemId));
  };

  const handleItemChange = (itemId, field, value) => {
    onChange(
      items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        Prescriptions structurées
        <span style={{ color: "#64748b", fontSize: "0.875rem", fontWeight: "normal", marginLeft: "0.5rem" }}>
          (Recommandé pour analyse)</span>
      </label>
      
      {/* List of prescription items */}
      {items.length > 0 && (
        <div className={styles.prescriptionsList}>
          {items.map((item, index) => (
            <PrescriptionItemCard
              key={item.id}
              item={item}
              index={index}
              onRemove={handleRemoveItem}
              onChange={handleItemChange}
              loading={loading}
            />
          ))}
        </div>
      )}
      
      {/* Add medication button */}
      <button
        type="button"
        onClick={handleAddItem}
        className={styles.addCategoryBtn}
        disabled={loading}
        style={{ marginTop: items.length > 0 ? '0.5rem' : '0' }}
      >
        + Ajouter un médicament
      </button>
    </div>
  );
};

export default PrescriptionList;
