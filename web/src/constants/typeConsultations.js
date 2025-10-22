/**
 * Types de consultation disponibles dans le système
 * Ces codes correspondent aux enum définis dans le backend
 */
export const TYPES_CONSULTATION = [
  { code: "CURATIF", label: "Consultation Curative", icon: "🏥" },
  { code: "PREVENTIF", label: "Consultation Préventive", icon: "🛡️" },
  { code: "CPN", label: "Consultation Prénatale (CPN)", icon: "🤰" },
  { code: "CPON", label: "Consultation Post-Natale (CPON)", icon: "👶" },
  { code: "ACCOUCHEMENT", label: "Accouchement", icon: "🏥" },
  { code: "VACCINATION", label: "Vaccination", icon: "💉" },
  { code: "NUTRITION", label: "Nutrition", icon: "🥗" },
  { code: "PLANIFICATION", label: "Planification Familiale", icon: "👨‍👩‍👧‍👦" },
  { code: "IST", label: "IST/VIH", icon: "🔬" },
  { code: "PALUDISME", label: "Paludisme", icon: "🦟" },
  { code: "TUBERCULOSE", label: "Tuberculose", icon: "🫁" },
  { code: "URGENCE", label: "Urgence", icon: "🚨" },
];

/**
 * Récupérer le label d'un type de consultation
 * @param {string} code - Le code du type de consultation
 * @returns {string} Le label correspondant ou le code si non trouvé
 */
export function getConsultationTypeLabel(code) {
  const type = TYPES_CONSULTATION.find(t => t.code === code);
  return type ? type.label : code;
}

/**
 * Récupérer l'icône d'un type de consultation
 * @param {string} code - Le code du type de consultation
 * @returns {string} L'icône correspondante
 */
export function getConsultationTypeIcon(code) {
  const type = TYPES_CONSULTATION.find(t => t.code === code);
  return type ? type.icon : "📋";
}