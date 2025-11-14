import React from 'react';
import MedicationSelector from './MedicationSelector';
import DurationSelector from './DurationSelector';
import FrequencySelector from './FrequencySelector';
import styles from '../CreateDataEntryModal.module.css';

const PrescriptionItemCard = ({ item, index, onRemove, onChange, loading }) => {
  const handleFieldChange = (field, value) => {
    onChange(item.id, field, value);
  };

  return (
    <div className={styles.prescriptionItem}>
      <div className={styles.prescriptionHeader}>
        <strong style={{ color: '#0284c7', fontSize: '0.9rem' }}>
          Médicament #{index + 1}
        </strong>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className={styles.removeBtn}
          title="Retirer ce médicament"
        >
          ✕
        </button>
      </div>
      
      {/* Médicament avec dropdown */}
      <div className={styles.prescriptionField}>
        <label className={styles.prescriptionFieldLabel}>
          Médicament <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <MedicationSelector
          itemId={item.id}
          value={item.medicament}
          onChange={(value) => handleFieldChange('medicament', value)}
          disabled={loading}
        />
      </div>
      
      {/* Dose */}
      <div className={styles.prescriptionField}>
        <label className={styles.prescriptionFieldLabel}>Dose</label>
        <input
          type="text"
          className={styles.input}
          value={item.dose}
          onChange={(e) => handleFieldChange('dose', e.target.value)}
          placeholder="Ex: 500mg, 2 comprimés..."
          disabled={loading}
        />
      </div>
      
      {/* Fréquence avec dropdown */}
      <div className={styles.prescriptionField}>
        <label className={styles.prescriptionFieldLabel}>Fréquence</label>
        <FrequencySelector
          value={item.frequence}
          onChange={(value) => handleFieldChange('frequence', value)}
          disabled={loading}
        />
      </div>
      
      {/* Durée avec dropdown */}
      <div className={styles.prescriptionField}>
        <label className={styles.prescriptionFieldLabel}>Durée</label>
        <DurationSelector
          itemId={item.id}
          value={item.duree}
          onChange={(value) => handleFieldChange('duree', value)}
          disabled={loading}
        />
      </div>
      
      {/* Notes pour ce médicament */}
      <div className={styles.prescriptionField}>
        <label className={styles.prescriptionFieldLabel}>Notes</label>
        <input
          type="text"
          className={styles.input}
          value={item.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="Précisions pour ce médicament..."
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default PrescriptionItemCard;
