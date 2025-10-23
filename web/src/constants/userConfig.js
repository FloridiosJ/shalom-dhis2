/**
 * Rôles utilisateur disponibles
 */
export const USER_ROLES = [
  { 
    value: 'admin', 
    label: 'Administrateur',
    icon: '👑',
    description: 'Accès complet au système'
  },
  { 
    value: 'manager', 
    label: 'Manager',
    icon: '👨‍💼',
    description: 'Gestion d\'un dispensaire'
  },
  { 
    value: 'agent', 
    label: 'Agent',
    icon: '👨‍⚕️',
    description: 'Personnel soignant'
  },
];

/**
 * Spécialités médicales disponibles
 */
export const SPECIALITES = [
  { value: 'sage_femme', label: 'Sage-femme', icon: '🤱' },
  { value: 'infirmier', label: 'Infirmier', icon: '💉' },
  { value: 'infirmière', label: 'Infirmière', icon: '💉' },
];

/**
 * Récupérer le label d'un rôle
 * @param {string} value - La valeur du rôle
 * @returns {string} Le label correspondant
 */
export function getRoleLabel(value) {
  const role = USER_ROLES.find(r => r.value === value);
  return role ? role.label : value;
}

/**
 * Récupérer le label d'une spécialité
 * @param {string} value - La valeur de la spécialité
 * @returns {string} Le label correspondant
 */
export function getSpecialiteLabel(value) {
  const specialite = SPECIALITES.find(s => s.value === value);
  return specialite ? specialite.label : value;
}