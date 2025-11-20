/**
 * Point d'entrée centralisé pour tous les composants de prescription
 * 
 * Usage:
 * import { PrescriptionSubForm, MédicamentPicker, FréquencePicker, DuréePicker } from './components/prescription';
 */

// Composants principaux
export { default as PrescriptionSubForm } from './PrescriptionSubForm';
export { default as PrescriptionItemCard } from './PrescriptionItemCard';

// Pickers individuels (noms anglais)
export { default as MedicationSelector } from './MedicationSelector';
export { default as FrequencySelector } from './FrequencySelector';
export { default as DurationSelector } from './DurationSelector';

// Pickers individuels (alias français)
export { default as MédicamentPicker } from './MedicamentPicker';
export { default as FréquencePicker } from './FrequencePicker';
export { default as DuréePicker } from './DureePicker';
