import React, { useState } from 'react';
import PrescriptionSubForm from '../components/prescription/PrescriptionSubForm';
import styles from '../components/CreateDataEntryModal.module.css';

/**
 * PrescriptionSubFormExample - Page de démonstration du composant PrescriptionSubForm
 * 
 * Cette page montre comment utiliser le composant réutilisable PrescriptionSubForm
 * dans différents scénarios.
 */
const PrescriptionSubFormExample = () => {
  const [singlePrescription, setSinglePrescription] = useState({
    medicament: '',
    dose: '',
    frequence: '',
    duree: '',
    notes: ''
  });

  const [multiplePrescriptions, setMultiplePrescriptions] = useState([]);

  const handleAddPrescription = () => {
    const newPrescription = {
      id: `temp-${Date.now()}`,
      medicament: '',
      dose: '',
      frequence: '',
      duree: '',
      notes: ''
    };
    setMultiplePrescriptions([...multiplePrescriptions, newPrescription]);
  };

  const handleRemovePrescription = (id) => {
    setMultiplePrescriptions(multiplePrescriptions.filter(p => p.id !== id));
  };

  const handlePrescriptionChange = (id, updatedPrescription) => {
    setMultiplePrescriptions(
      multiplePrescriptions.map(p => 
        p.id === id ? { ...p, ...updatedPrescription } : p
      )
    );
  };

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (!singlePrescription.medicament.trim()) {
      alert('Le médicament est obligatoire');
      return;
    }
    console.log('Single Prescription:', singlePrescription);
    alert(`Prescription enregistrée:\n${JSON.stringify(singlePrescription, null, 2)}`);
  };

  const handleMultipleSubmit = (e) => {
    e.preventDefault();
    const validPrescriptions = multiplePrescriptions.filter(p => p.medicament.trim());
    if (validPrescriptions.length === 0) {
      alert('Ajoutez au moins une prescription avec un médicament');
      return;
    }
    console.log('Multiple Prescriptions:', validPrescriptions);
    alert(`${validPrescriptions.length} prescription(s) enregistrée(s):\n${JSON.stringify(validPrescriptions, null, 2)}`);
  };

  const examplePrescription = {
    medicament: 'Paracétamol',
    dose: '500mg',
    frequence: '3x/jour',
    duree: '3 jours',
    notes: 'Prendre après les repas'
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>PrescriptionSubForm - Exemples d'utilisation</h1>
      
      {/* Section 1: Single Prescription */}
      <section style={{ 
        marginBottom: '3rem', 
        padding: '1.5rem', 
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        backgroundColor: '#fff'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#0284c7' }}>
          Exemple 1 : Prescription unique
        </h2>
        <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
          Formulaire simple avec un seul médicament à prescrire
        </p>
        
        <form onSubmit={handleSingleSubmit}>
          <PrescriptionSubForm
            value={singlePrescription}
            onChange={setSinglePrescription}
            disabled={false}
          />
          
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button 
              type="submit" 
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Enregistrer
            </button>
            <button 
              type="button"
              onClick={() => setSinglePrescription({
                medicament: '',
                dose: '',
                frequence: '',
                duree: '',
                notes: ''
              })}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#64748b',
                color: '#fff',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </section>

      {/* Section 2: Multiple Prescriptions */}
      <section style={{ 
        marginBottom: '3rem', 
        padding: '1.5rem', 
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        backgroundColor: '#fff'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#0284c7' }}>
          Exemple 2 : Prescriptions multiples
        </h2>
        <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
          Liste de médicaments avec possibilité d'en ajouter ou retirer
        </p>
        
        <form onSubmit={handleMultipleSubmit}>
          {multiplePrescriptions.map((prescription, index) => (
            <PrescriptionSubForm
              key={prescription.id}
              value={prescription}
              onChange={(updated) => handlePrescriptionChange(prescription.id, updated)}
              onRemove={() => handleRemovePrescription(prescription.id)}
              index={index}
              disabled={false}
            />
          ))}
          
          <button
            type="button"
            onClick={handleAddPrescription}
            className={styles.addCategoryBtn}
            style={{ marginBottom: '1rem', marginTop: multiplePrescriptions.length > 0 ? '0.5rem' : '0' }}
          >
            + Ajouter un médicament
          </button>
          
          {multiplePrescriptions.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button 
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Enregistrer toutes les prescriptions
              </button>
              <button 
                type="button"
                onClick={() => setMultiplePrescriptions([])}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Tout supprimer
              </button>
            </div>
          )}
        </form>
      </section>

      {/* Section 3: Read-only Example */}
      <section style={{ 
        marginBottom: '3rem', 
        padding: '1.5rem', 
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        backgroundColor: '#fff'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#0284c7' }}>
          Exemple 3 : Mode lecture seule
        </h2>
        <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
          Affichage d'une prescription existante (non modifiable)
        </p>
        
        <PrescriptionSubForm
          value={examplePrescription}
          onChange={() => {}}
          disabled={true}
        />
      </section>

      {/* Section 4: Without Labels */}
      <section style={{ 
        marginBottom: '3rem', 
        padding: '1.5rem', 
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        backgroundColor: '#fff'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#0284c7' }}>
          Exemple 4 : Sans labels (compact)
        </h2>
        <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
          Affichage compact sans les labels de champs
        </p>
        
        <PrescriptionSubForm
          value={examplePrescription}
          onChange={() => {}}
          disabled={true}
          showLabels={false}
        />
      </section>

      {/* Information Section */}
      <section style={{ 
        padding: '1.5rem', 
        backgroundColor: '#f1f5f9',
        borderRadius: '0.5rem',
        border: '1px solid #cbd5e1'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#334155' }}>
          ℹ️ Informations
        </h3>
        <ul style={{ color: '#64748b', lineHeight: 1.8 }}>
          <li>Le champ <strong>Médicament</strong> est obligatoire (marqué par *)</li>
          <li>Les autres champs (Dose, Fréquence, Durée, Notes) sont optionnels</li>
          <li>Utilisez les listes déroulantes pour sélectionner rapidement les valeurs courantes</li>
          <li>Vous pouvez aussi saisir des valeurs personnalisées</li>
          <li>Le composant est réutilisable dans n'importe quel formulaire</li>
          <li>Consultez <code>PRESCRIPTION_SUBFORM_USAGE.md</code> pour plus d'exemples</li>
        </ul>
      </section>
    </div>
  );
};

export default PrescriptionSubFormExample;
