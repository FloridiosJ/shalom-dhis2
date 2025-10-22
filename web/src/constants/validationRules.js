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
  age: {
    min: 0,
    max: 150,
    message: "L'âge doit être entre 0 et 150 ans"
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
 * Valider un âge
 * @param {number} age - L'âge à valider
 * @returns {{ valid: boolean, message: string }} Résultat de la validation
 */
export function validateAge(age) {
  const ageNum = parseInt(age, 10);
  
  if (isNaN(ageNum)) {
    return { valid: false, message: "L'âge doit être un nombre" };
  }
  
  if (ageNum < VALIDATION_RULES.age.min || ageNum > VALIDATION_RULES.age.max) {
    return { valid: false, message: VALIDATION_RULES.age.message };
  }
  
  return { valid: true, message: "" };
}