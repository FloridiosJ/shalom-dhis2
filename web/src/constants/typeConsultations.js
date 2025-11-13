/**
 * Types de consultation disponibles dans le système
 * Ces codes correspondent aux enum définis dans le backend
 */
export const TYPES_CONSULTATION = [
  { code: "CURATIF", label: "Consultation Curative", icon: "🏥", femaleOnly: false },
  { code: "PREVENTIF", label: "Consultation Préventive", icon: "🛡️", femaleOnly: false },
  { code: "CPN", label: "Consultation Prénatale (CPN)", icon: "🤰", femaleOnly: true },
  { code: "CPON", label: "Consultation Post-Natale (CPON)", icon: "👶", femaleOnly: true },
  { code: "ACCOUCHEMENT", label: "Accouchement", icon: "🏥", femaleOnly: true },
  { code: "VACCINATION", label: "Vaccination", icon: "💉", femaleOnly: false },
  { code: "NUTRITION", label: "Nutrition", icon: "🥗", femaleOnly: false },
  { code: "PLANIFICATION", label: "Planification Familiale", icon: "👨‍👩‍👧‍👦", femaleOnly: false },
  { code: "IST", label: "IST/VIH", icon: "🔬", femaleOnly: false },
  { code: "PALUDISME", label: "Paludisme", icon: "🦟", femaleOnly: false },
  { code: "TUBERCULOSE", label: "Tuberculose", icon: "🫁", femaleOnly: false },
  { code: "URGENCE", label: "Urgence", icon: "🚨", femaleOnly: false },
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

/**
 * Filtrer les types de consultation selon le sexe du patient
 * @param {string} patientSexe - Le sexe du patient ('M', 'F', 'L')
 * @returns {Array} Liste des types de consultation autorisés
 */
export function getConsultationTypesByGender(patientSexe) {
  // Pour les patients masculins, exclure les consultations féminines
  if (patientSexe === 'M') {
    return TYPES_CONSULTATION.filter(t => !t.femaleOnly);
  }
  // Pour les autres (F, L, ou non défini), afficher tous les types
  return TYPES_CONSULTATION;
}