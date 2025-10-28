import React, { useState } from 'react';
import styles from './CreateDataEntryModal.module.css';

/**
 * PatientAutocomplete component - Autocomplete input for patient selection
 * @param {Object} props
 * @param {string} props.value - Current patient full name value
 * @param {string} props.patientId - Selected patient ID
 * @param {string} props.numeroPatient - Selected patient number
 * @param {Array} props.patients - Array of patient objects
 * @param {Function} props.onChange - Callback when input changes (value, patientId, numeroPatient)
 * @param {Function} props.onCreatePatient - Optional callback when "Create Patient" is clicked
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.isEdit - Whether in edit mode (affects disabling)
 * @param {boolean} props.loading - Whether form is loading
 * @param {string} props.error - Error message to display
 */
const PatientAutocomplete = ({
  value,
  patientId,
  numeroPatient,
  patients = [],
  onChange,
  onCreatePatient,
  disabled = false,
  isEdit = false,
  loading = false,
  error = "",
}) => {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showCreatePatientButton, setShowCreatePatientButton] = useState(false);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    // Remove patient number from search if present
    const searchValue = inputValue.replace(/\s*\([^)]*\)\s*$/, '').trim();
    
    const filtered = patients.filter(
      p =>
        `${p.nom} ${p.prenom}`.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.nom?.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.prenom?.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.numeroPatient?.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    // Only clear patient selection if the value doesn't match the current selection
    const currentPatientMatch = patientId && patients.find(p => 
      p.id === patientId && 
      `${p.nom} ${p.prenom}` === searchValue
    );
    
    onChange(
      searchValue,
      currentPatientMatch ? patientId : "",
      currentPatientMatch ? numeroPatient : ""
    );
    setShowAutocomplete(searchValue.length > 0);
    setFilteredPatients(filtered);
    setShowCreatePatientButton(filtered.length === 0 && searchValue.length > 0);
  };

  const handlePatientSelect = (patient) => {
    onChange(
      `${patient.nom} ${patient.prenom}`,
      patient.id,
      patient.numeroPatient
    );
    setShowAutocomplete(false);
    setShowCreatePatientButton(false);
  };

  const handleFocus = () => {
    if (!patientId && value && filteredPatients?.length > 0) {
      setShowAutocomplete(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowAutocomplete(false);
      setShowCreatePatientButton(false);
    }, 200);
  };

  const displayValue = patientId && numeroPatient 
    ? `${value} (${numeroPatient})`
    : value || "";

  return (
    <div className={styles.formGroup} style={{ position: "relative" }}>
      <label htmlFor="fullName" className={styles.label}>
        Patient <span aria-hidden="true" style={{ color: "#dc2626" }}>*</span>
      </label>
      <input
        id="fullName"
        name="fullName"
        className={styles.input}
        value={displayValue}
        onChange={handleInputChange}
        autoComplete="off"
        disabled={loading || disabled || isEdit}
        placeholder="Rechercher un patient par nom, prénom ou numéro..."
        style={{ 
          backgroundColor: patientId ? '#e0f2fe' : '#f8fafc',
          cursor: patientId && isEdit ? 'not-allowed' : 'text'
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {error && <div className={styles.errorField}>{error}</div>}
      
      {showAutocomplete && filteredPatients.length > 0 && (
        <ul className={styles.autocompleteList}>
          {filteredPatients.map((p) => (
            <li
              key={p.id}
              className={styles.autocompleteItem}
              onMouseDown={() => handlePatientSelect(p)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ fontWeight: 500 }}>
                  {p.nom} {p.prenom}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', gap: '0.75rem' }}>
                  <span>📋 {p.numeroPatient}</span>
                  {p.dispensaire && <span>🏥 {p.dispensaire.name}</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {showCreatePatientButton && onCreatePatient && (
        <div className={styles.createPatientPrompt}>
          <span>Patient introuvable.</span>
          <button
            type="button"
            className={styles.createPatientBtn}
            onMouseDown={() => {
              setShowCreatePatientButton(false);
              setShowAutocomplete(false);
              onCreatePatient(value);
            }}
          >
            + Créer un nouveau patient
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientAutocomplete;
