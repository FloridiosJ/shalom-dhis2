import React from 'react';
import MedicationSelector from './MedicationSelector';
import FrequencySelector from './FrequencySelector';
import DurationSelector from './DurationSelector';
import styles from '../CreateDataEntryModal.module.css';

/**
 * PrescriptionSubForm - Composant réutilisable pour la saisie d'une prescription structurée
 * 
 * Ce composant combine tous les champs nécessaires pour une prescription :
 * - Médicament (obligatoire) avec MédicamentPicker
 * - Dose (texte libre, optionnel)
 * - Fréquence avec FréquencePicker
 * - Durée avec DuréePicker
 * - Notes (texte libre, optionnel)
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.value - L'objet prescription contenant { medicament, dose, frequence, duree, notes }
 * @param {Function} props.onChange - Callback appelé avec l'objet prescription mis à jour
 * @param {boolean} props.disabled - Si true, tous les champs sont désactivés
 * @param {boolean} props.showLabels - Si true, affiche les labels des champs (par défaut: true)
 * @param {Function} props.onRemove - Callback optionnel pour retirer cette prescription
 * @param {number} props.index - Index de la prescription (pour affichage)
 * 
 * @example
 * const [prescription, setPrescription] = useState({
 *   medicament: '',
 *   dose: '',
 *   frequence: '',
 *   duree: '',
 *   notes: ''
 * });
 * 
 * <PrescriptionSubForm 
 *   value={prescription}
 *   onChange={setPrescription}
 *   disabled={false}
 *   index={0}
 *   onRemove={handleRemove}
 * />
 */
const PrescriptionSubForm = ({ 
  value = {}, 
  onChange, 
  disabled = false,
  showLabels = true,
  onRemove,
  index
}) => {
  const handleFieldChange = (field, fieldValue) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className={styles.prescriptionItem}>
      {/* Header avec numéro et bouton de suppression */}
      {(typeof index === 'number' || onRemove) && (
        <div className={styles.prescriptionHeader}>
          {typeof index === 'number' && (
            <strong style={{ color: '#0284c7', fontSize: '0.9rem' }}>
              Médicament #{index + 1}
            </strong>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className={styles.removeBtn}
              title="Retirer ce médicament"
            >
              ✕
            </button>
          )}
        </div>
      )}
      
      {/* Médicament - OBLIGATOIRE */}
      <div className={styles.prescriptionField}>
        {showLabels && (
          <label className={styles.prescriptionFieldLabel}>
            Médicament <span style={{ color: "#dc2626" }}>*</span>
          </label>
        )}
        <MedicationSelector
          value={value.medicament || ''}
          onChange={(val) => handleFieldChange('medicament', val)}
          disabled={disabled}
        />
      </div>
      
      {/* Dose */}
      <div className={styles.prescriptionField}>
        {showLabels && (
          <label className={styles.prescriptionFieldLabel}>Dose</label>
        )}
        <input
          type="text"
          className={styles.input}
          value={value.dose || ''}
          onChange={(e) => handleFieldChange('dose', e.target.value)}
          placeholder="Ex: 500mg, 2 comprimés..."
          disabled={disabled}
        />
      </div>
      
      {/* Fréquence */}
      <div className={styles.prescriptionField}>
        {showLabels && (
          <label className={styles.prescriptionFieldLabel}>Fréquence</label>
        )}
        <FrequencySelector
          value={value.frequence || ''}
          onChange={(val) => handleFieldChange('frequence', val)}
          disabled={disabled}
        />
      </div>
      
      {/* Durée */}
      <div className={styles.prescriptionField}>
        {showLabels && (
          <label className={styles.prescriptionFieldLabel}>Durée</label>
        )}
        <DurationSelector
          value={value.duree || ''}
          onChange={(val) => handleFieldChange('duree', val)}
          disabled={disabled}
        />
      </div>
      
      {/* Notes */}
      <div className={styles.prescriptionField}>
        {showLabels && (
          <label className={styles.prescriptionFieldLabel}>Notes</label>
        )}
        <input
          type="text"
          className={styles.input}
          value={value.notes || ''}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="Précisions pour ce médicament..."
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default PrescriptionSubForm;
