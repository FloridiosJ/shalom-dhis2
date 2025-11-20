# Guide d'utilisation : PrescriptionSubForm

## Vue d'ensemble

Le composant `PrescriptionSubForm` est un sous-formulaire réutilisable pour la saisie structurée des prescriptions médicales. Il combine tous les champs nécessaires dans une interface cohérente et facile à utiliser.

## Composants disponibles

### Composant principal
- **PrescriptionSubForm** : Formulaire complet pour une prescription

### Pickers individuels
- **MédicamentPicker** / **MedicationSelector** : Sélection du médicament
- **FréquencePicker** / **FrequencySelector** : Sélection de la fréquence
- **DuréePicker** / **DurationSelector** : Sélection de la durée

## Installation / Import

```javascript
// Import du composant complet
import PrescriptionSubForm from './components/prescription/PrescriptionSubForm';

// OU via l'index centralisé
import { PrescriptionSubForm, MédicamentPicker, FréquencePicker, DuréePicker } from './components/prescription';

// Import des pickers individuels si nécessaire
import { MedicationSelector, FrequencySelector, DurationSelector } from './components/prescription';
```

## Utilisation de base

### Exemple simple : Une seule prescription

```javascript
import React, { useState } from 'react';
import PrescriptionSubForm from './components/prescription/PrescriptionSubForm';

function MonComposant() {
  const [prescription, setPrescription] = useState({
    medicament: '',
    dose: '',
    frequence: '',
    duree: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Prescription:', prescription);
    // Envoyer à l'API...
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nouvelle prescription</h2>
      
      <PrescriptionSubForm
        value={prescription}
        onChange={setPrescription}
        disabled={false}
      />
      
      <button type="submit">Enregistrer</button>
    </form>
  );
}
```

### Exemple avancé : Plusieurs prescriptions

```javascript
import React, { useState } from 'react';
import PrescriptionSubForm from './components/prescription/PrescriptionSubForm';

function FormulairePrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);

  const handleAddPrescription = () => {
    const newPrescription = {
      id: `temp-${Date.now()}`,
      medicament: '',
      dose: '',
      frequence: '',
      duree: '',
      notes: ''
    };
    setPrescriptions([...prescriptions, newPrescription]);
  };

  const handleRemovePrescription = (id) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  const handlePrescriptionChange = (id, updatedPrescription) => {
    setPrescriptions(
      prescriptions.map(p => 
        p.id === id ? { ...p, ...updatedPrescription } : p
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Valider que chaque prescription a au moins un médicament
    const validPrescriptions = prescriptions.filter(p => p.medicament.trim());
    console.log('Prescriptions valides:', validPrescriptions);
    // Envoyer à l'API...
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Prescriptions</h2>
      
      {prescriptions.map((prescription, index) => (
        <PrescriptionSubForm
          key={prescription.id}
          value={prescription}
          onChange={(updated) => handlePrescriptionChange(prescription.id, updated)}
          onRemove={() => handleRemovePrescription(prescription.id)}
          index={index}
          disabled={false}
        />
      ))}
      
      <button type="button" onClick={handleAddPrescription}>
        + Ajouter un médicament
      </button>
      
      <button type="submit">Enregistrer toutes les prescriptions</button>
    </form>
  );
}
```

## Props du composant PrescriptionSubForm

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `value` | Object | `{}` | Objet contenant les valeurs : `{ medicament, dose, frequence, duree, notes }` |
| `onChange` | Function | Required | Callback appelé avec l'objet prescription mis à jour |
| `disabled` | Boolean | `false` | Si true, tous les champs sont désactivés |
| `showLabels` | Boolean | `true` | Si true, affiche les labels des champs |
| `onRemove` | Function | Optional | Callback pour retirer cette prescription (affiche le bouton ✕) |
| `index` | Number | Optional | Index de la prescription (affiche "Médicament #X") |

## Objet prescription

```javascript
{
  medicament: string,  // OBLIGATOIRE - Nom du médicament
  dose: string,        // Optionnel - Ex: "500mg", "2 comprimés"
  frequence: string,   // Optionnel - Ex: "3x/jour", "Matin et soir"
  duree: string,       // Optionnel - Ex: "7 jours", "2 semaines"
  notes: string        // Optionnel - Précisions supplémentaires
}
```

## Utilisation des pickers individuels

Si vous avez besoin d'utiliser les pickers séparément :

```javascript
import { MédicamentPicker, FréquencePicker, DuréePicker } from './components/prescription';

function MonFormulaire() {
  const [medicament, setMedicament] = useState('');
  const [frequence, setFrequence] = useState('');
  const [duree, setDuree] = useState('');

  return (
    <div>
      <MédicamentPicker 
        value={medicament} 
        onChange={setMedicament} 
      />
      
      <FréquencePicker 
        value={frequence} 
        onChange={setFrequence} 
      />
      
      <DuréePicker 
        value={duree} 
        onChange={setDuree} 
      />
    </div>
  );
}
```

## Listes de valeurs disponibles

Les pickers utilisent des listes prédéfinies de valeurs courantes :

### Médicaments (COMMON_MEDICATIONS)
~93 médicaments courants incluant :
- Antibiotiques (Amoxicilline, Azithromycine, etc.)
- Antipaludéens (Coartem, Artésunate, etc.)
- Antipyrétiques (Paracétamol, Ibuprofène, etc.)
- Et bien d'autres...

### Fréquences (COMMON_FREQUENCIES)
- "1x/jour", "2x/jour", "3x/jour", "4x/jour"
- "Matin", "Soir", "Matin et soir"
- "Toutes les 6 heures", "Toutes les 8 heures", etc.

### Durées (COMMON_DURATIONS)
- "3 jours", "5 jours", "7 jours", "10 jours", "14 jours"
- "2 semaines", "3 semaines"
- "1 mois", "2 mois", "3 mois"
- "En continu", "Jusqu'à amélioration"

Ces listes sont définies dans `web/src/constants/medications.js` et peuvent être étendues selon les besoins.

## Validation

Le composant marque le champ "Médicament" comme obligatoire (indicateur visuel *). 
Pour la validation côté formulaire :

```javascript
const validatePrescription = (prescription) => {
  const errors = {};
  
  if (!prescription.medicament || !prescription.medicament.trim()) {
    errors.medicament = 'Le médicament est obligatoire';
  }
  
  return errors;
};

// Dans votre composant
const handleSubmit = (e) => {
  e.preventDefault();
  const errors = validatePrescription(prescription);
  
  if (Object.keys(errors).length > 0) {
    console.error('Erreurs de validation:', errors);
    return;
  }
  
  // Soumettre...
};
```

## Intégration avec l'existant

Le composant PrescriptionSubForm peut remplacer PrescriptionItemCard dans les endroits où vous souhaitez une interface simplifiée :

```javascript
// Avant
import PrescriptionItemCard from './prescription/PrescriptionItemCard';

// Après
import PrescriptionSubForm from './prescription/PrescriptionSubForm';

// Utilisation identique, mais interface plus simple
```

## Styles

Le composant utilise les classes CSS de `CreateDataEntryModal.module.css` :
- `.prescriptionItem` : Conteneur principal
- `.prescriptionHeader` : En-tête avec numéro et bouton
- `.prescriptionField` : Champ individuel
- `.prescriptionFieldLabel` : Label de champ
- `.input` : Input texte
- `.removeBtn` : Bouton de suppression

## Accessibilité

- Tous les champs ont des labels appropriés
- Les pickers supportent la navigation au clavier
- Le bouton de suppression a un titre descriptif
- Les champs requis sont clairement marqués

## Exemples de cas d'usage

### Cas 1 : Prescription simple sans choix

```javascript
<PrescriptionSubForm
  value={{ medicament: 'Paracétamol', dose: '500mg', frequence: '3x/jour', duree: '3 jours', notes: '' }}
  onChange={setPrescription}
  showLabels={false}  // Sans labels pour un affichage compact
/>
```

### Cas 2 : Mode lecture seule

```javascript
<PrescriptionSubForm
  value={prescriptionExistante}
  onChange={() => {}}  // Pas de changements
  disabled={true}      // Tous les champs désactivés
/>
```

### Cas 3 : Formulaire inline dans un modal

```javascript
function EditPrescriptionModal({ prescription, onSave, onCancel }) {
  const [editedPrescription, setEditedPrescription] = useState(prescription);
  
  return (
    <div className="modal">
      <h3>Modifier la prescription</h3>
      <PrescriptionSubForm
        value={editedPrescription}
        onChange={setEditedPrescription}
      />
      <button onClick={() => onSave(editedPrescription)}>Enregistrer</button>
      <button onClick={onCancel}>Annuler</button>
    </div>
  );
}
```

## Support

Pour toute question ou problème :
1. Vérifier que les constants sont bien importées
2. Vérifier que les styles CSS existent
3. Consulter les tests unitaires pour des exemples d'utilisation
4. Contacter l'équipe de développement

---

**Version** : 1.0.0  
**Date** : 2025-11-20  
**Auteur** : GitHub Copilot pour FloridiosJ/shalom-dhis2
