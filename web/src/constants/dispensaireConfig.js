/**
 * Synoda disponibles (régions ecclésiastiques)
 */
export const SYNODA_OPTIONS = [
  { 
    value: "SPBM", 
    label: "SPBM - Synoda-Paritany Boeny Mahajanga",
    region: "Boeny Mahajanga"
  },
  { 
    value: "SPA", 
    label: "SPA - Synoda-Paritany Antsiranana",
    region: "Antsiranana"
  },
  { 
    value: "SPMel", 
    label: "SPMel - Synoda-Paritany Melaky",
    region: "Melaky"
  },
  { 
    value: "SPSofia", 
    label: "SPSofia - Synoda-Paritany Sofia",
    region: "Sofia"
  },
];

/**
 * Récupérer le label complet d'un synoda
 * @param {string} value - La valeur du synoda
 * @returns {string} Le label correspondant
 */
export function getSynodaLabel(value) {
  const synoda = SYNODA_OPTIONS.find(s => s.value === value);
  return synoda ? synoda.label : value;
}

/**
 * Récupérer la région d'un synoda
 * @param {string} value - La valeur du synoda
 * @returns {string} La région correspondante
 */
export function getSynodaRegion(value) {
  const synoda = SYNODA_OPTIONS.find(s => s.value === value);
  return synoda ? synoda.region : "";
}