/**
 * Règles de validation pour les formulaires
 */

export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Email invalide"
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial"
  },
  phoneNumber: {
    pattern: /^(\+261|0)[23][0-9]{8}$/,
    message: "Numéro de téléphone malgache invalide"
  },
  dateNaissance: {
    maxYearsAgo: 150,
    message: "La date de naissance doit être dans le passé et ne peut pas dépasser 150 ans"
  },
  required: {
    message: "Ce champ est requis"
  }
};

/**
 * Valider un email
 * @param {string} email - L'email à valider
 * @returns {boolean} true si valide
 */
export function validateEmail(email) {
  return VALIDATION_RULES.email.pattern.test(email);
}

/**
 * Valider un mot de passe
 * @param {string} password - Le mot de passe à valider
 * @returns {{ valid: boolean, message: string }} Résultat de la validation
 */
export function validatePassword(password) {
  if (!password || password.length < VALIDATION_RULES.password.minLength) {
    return {
      valid: false,
      message: `Le mot de passe doit contenir au moins ${VALIDATION_RULES.password.minLength} caractères`
    };
  }
  
  if (!VALIDATION_RULES.password.pattern.test(password)) {
    return {
      valid: false,
      message: VALIDATION_RULES.password.message
    };
  }
  
  return { valid: true, message: "" };
}

/**
 * Valider une date de naissance
 * @param {string} dateNaissance - La date de naissance à valider (YYYY-MM-DD)
 * @returns {{ valid: boolean, message: string }} Résultat de la validation
 */
export function validateDateNaissance(dateNaissance) {
  if (!dateNaissance) {
    return { valid: false, message: "La date de naissance est requise" };
  }
  
  const birthDate = new Date(dateNaissance);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    return { valid: false, message: "Date invalide" };
  }
  
  if (birthDate > today) {
    return { valid: false, message: "La date de naissance ne peut pas être dans le futur" };
  }
  
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age > VALIDATION_RULES.dateNaissance.maxYearsAgo) {
    return { valid: false, message: VALIDATION_RULES.dateNaissance.message };
  }
  
  return { valid: true, message: "" };
}