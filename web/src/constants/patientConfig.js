/**
 * Religions disponibles
 */
export const RELIGIONS = [
  { value: "Kristianina", label: "Kristianina", icon: "✝️" },
  { value: "Musulman", label: "Musulman", icon: "☪️" },
  { value: "traditionnelle", label: "Traditionnelle", icon: "🌿" },
];

/**
 * Sexes disponibles
 */
export const SEXES = [
  { value: "M", label: "Masculin", icon: "♂️" },
  { value: "F", label: "Féminin", icon: "♀️" },
];

/**
 * Catégories d'âge
 */
export const CATEGORIES_AGE = [
  { min: 0, max: 1, label: "Nourrisson (0-1 an)", icon: "👶" },
  { min: 1, max: 5, label: "Petit enfant (1-5 ans)", icon: "🧒" },
  { min: 5, max: 12, label: "Enfant (5-12 ans)", icon: "👦" },
  { min: 12, max: 18, label: "Adolescent (12-18 ans)", icon: "👨" },
  { min: 18, max: 65, label: "Adulte (18-65 ans)", icon: "👨‍🦱" },
  { min: 65, max: 999, label: "Senior (65+ ans)", icon: "👴" },
];

/**
 * Récupérer la catégorie d'âge
 * @param {number} age - L'âge du patient
 * @returns {string} La catégorie d'âge
 */
export function getCategorieAge(age) {
  const categorie = CATEGORIES_AGE.find(c => age >= c.min && age < c.max);
  return categorie ? categorie.label : "Inconnu";
}

/**
 * Récupérer le label d'une religion
 * @param {string} value - La valeur de la religion
 * @returns {string} Le label correspondant
 */
export function getReligionLabel(value) {
  const religion = RELIGIONS.find(r => r.value === value);
  return religion ? religion.label : value;
}

/**
 * Récupérer le label d'un sexe
 * @param {string} value - La valeur du sexe
 * @returns {string} Le label correspondant
 */
export function getSexeLabel(value) {
  const sexe = SEXES.find(s => s.value === value);
  return sexe ? sexe.label : value;
}