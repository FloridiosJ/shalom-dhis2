import React, { useState } from 'react';
import PrescriptionSubForm from './PrescriptionSubForm';
import styles from '../CreateDataEntryModal.module.css';

/**
 * PrescriptionInputWithModal - Composant qui affiche un input qui ouvre un modal
 * pour ajouter des prescriptions structurées
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.prescriptions - Liste des prescriptions
 * @param {Function} props.onChange - Callback quand la liste change
 * @param {boolean} props.disabled - Si true, le composant est désactivé
 */
const PrescriptionInputWithModal = ({ prescriptions = [], onChange, disabled = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState({
    medicament: '',
    dose: '',
    frequence: '',
    duree: '',
    notes: ''
  });

  const handleOpenModal = () => {
    if (!disabled) {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Reset form
    setCurrentPrescription({
      medicament: '',
      dose: '',
      frequence: '',
      duree: '',
      notes: ''
    });
  };

  const handleAddPrescription = () => {
    // Validation: médicament est obligatoire
    if (!currentPrescription.medicament.trim()) {
      alert('Le médicament est obligatoire');
      return;
    }

    // Ajouter la prescription à la liste
    const newPrescription = {
      id: `temp-${Date.now()}`,
      ...currentPrescription,
      ordre: prescriptions.length
    };

    onChange([...prescriptions, newPrescription]);

    // Reset form mais ne pas fermer le modal pour permettre d'ajouter d'autres
    setCurrentPrescription({
      medicament: '',
      dose: '',
      frequence: '',
      duree: '',
      notes: ''
    });
  };

  const handleRemovePrescription = (id) => {
    onChange(prescriptions.filter(p => p.id !== id));
  };

  const getMedicationsSummary = () => {
    if (prescriptions.length === 0) {
      return 'Cliquez pour ajouter des médicaments';
    }
    if (prescriptions.length === 1) {
      return prescriptions[0].medicament;
    }
    return `${prescriptions.length} médicaments prescrits`;
  };

  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        Prescriptions structurées
        <span style={{ color: "#64748b", fontSize: "0.875rem", fontWeight: "normal", marginLeft: "0.5rem" }}>
          (Recommandé pour analyse)
        </span>
      </label>

      {/* Input field that opens modal */}
      <div
        onClick={handleOpenModal}
        style={{
          padding: '0.75rem',
          border: '1px solid #cbd5e1',
          borderRadius: '0.375rem',
          backgroundColor: disabled ? '#f1f5f9' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: prescriptions.length === 0 ? '#94a3b8' : '#1e293b',
          fontSize: '0.875rem',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = '#0284c7';
            e.currentTarget.style.backgroundColor = '#f8fafc';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.backgroundColor = '#fff';
          }
        }}
      >
        {getMedicationsSummary()}
      </div>

      {/* Liste des médicaments ajoutés */}
      {prescriptions.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                marginBottom: '0.5rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#0284c7' }}>{prescription.medicament}</strong>
                {prescription.dose && <span style={{ marginLeft: '0.5rem', color: '#64748b' }}>- {prescription.dose}</span>}
                {prescription.frequence && <span style={{ marginLeft: '0.5rem', color: '#64748b' }}>- {prescription.frequence}</span>}
                {prescription.duree && <span style={{ marginLeft: '0.5rem', color: '#64748b' }}>({prescription.duree})</span>}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePrescription(prescription.id);
                }}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  marginLeft: '0.5rem'
                }}
                title="Retirer ce médicament"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={handleCloseModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '1rem'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                Ajouter un médicament
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '0.25rem',
                  lineHeight: 1
                }}
                title="Fermer"
              >
                ✕
              </button>
            </div>

            <PrescriptionSubForm
              value={currentPrescription}
              onChange={setCurrentPrescription}
              disabled={false}
              showLabels={true}
            />

            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              marginTop: '1.5rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1rem'
            }}>
              <button
                type="button"
                onClick={handleAddPrescription}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  backgroundColor: '#64748b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionInputWithModal;
