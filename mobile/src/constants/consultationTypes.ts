/**
 * Types de consultation disponibles dans le système
 * Ces données sont embarquées côté front (pas d'appel réseau requis initialement)
 * 
 * @description
 * Ce fichier définit les types de consultation disponibles pour l'écran de nouvelle consultation.
 * Chaque type inclut un code unique, un libellé, une description et un état d'activité.
 * 
 * @usage
 * ```tsx
 * import { TYPES_CONSULTATION, getActiveConsultationTypes } from '../constants/consultationTypes';
 * 
 * // Récupérer tous les types actifs
 * const activeTypes = getActiveConsultationTypes();
 * 
 * // Trouver un type spécifique
 * const type = getConsultationTypeByCode('CURATIF');
 * ```
 * 
 * @see ConsultationPicker component for UI implementation
 */

export interface ConsultationType {
  code: string;          // Code unique du type (ex: 'CURATIF')
  libelle: string;       // Libellé affiché à l'utilisateur
  description: string;   // Description détaillée du type
  isActive: boolean;     // Indique si le type est actif et sélectionnable
}

export const TYPES_CONSULTATION: ConsultationType[] = [
  {
    code: 'CURATIF',
    libelle: 'Consultation Curative',
    description: 'Consultation pour traitement de maladies',
    isActive: true,
  },
  {
    code: 'PREVENTIF',
    libelle: 'Consultation Préventive',
    description: 'Consultation de prévention et dépistage',
    isActive: true,
  },
  {
    code: 'CPN',
    libelle: 'Consultation Prénatale',
    description: 'Suivi de grossesse et consultation prénatale',
    isActive: true,
  },
  {
    code: 'CPON',
    libelle: 'Consultation Post-Natale',
    description: 'Suivi après accouchement',
    isActive: true,
  },
  {
    code: 'ACCOUCHEMENT',
    libelle: 'Accouchement',
    description: "Accompagnement et suivi d'accouchement",
    isActive: true,
  },
  {
    code: 'VACCINATION',
    libelle: 'Vaccination',
    description: 'Administration de vaccins',
    isActive: true,
  },
  {
    code: 'NUTRITION',
    libelle: 'Suivi Nutritionnel',
    description: 'Suivi et conseil nutritionnel',
    isActive: true,
  },
  {
    code: 'PLANIFICATION',
    libelle: 'Planification Familiale',
    description: 'Conseil et services de planification familiale',
    isActive: true,
  },
  {
    code: 'IST',
    libelle: 'IST/SIDA',
    description: 'Dépistage et traitement IST/SIDA',
    isActive: true,
  },
  {
    code: 'PALUDISME',
    libelle: 'Paludisme',
    description: 'Diagnostic et traitement du paludisme',
    isActive: true,
  },
  {
    code: 'TUBERCULOSE',
    libelle: 'Tuberculose',
    description: 'Dépistage et traitement de la tuberculose',
    isActive: true,
  },
  {
    code: 'URGENCE',
    libelle: 'Urgence',
    description: "Consultation d'urgence",
    isActive: true,
  },
];

/**
 * Récupérer les types de consultation actifs
 */
export function getActiveConsultationTypes(): ConsultationType[] {
  return TYPES_CONSULTATION.filter(type => type.isActive);
}

/**
 * Récupérer un type de consultation par son code
 */
export function getConsultationTypeByCode(
  code: string,
): ConsultationType | undefined {
  return TYPES_CONSULTATION.find(type => type.code === code);
}
