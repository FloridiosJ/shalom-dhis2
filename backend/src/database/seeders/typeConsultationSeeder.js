import TypeConsultation from '../../models/typeConsultation.js';

const typesConsultation = [
  {
    code: 'CONSULTATION_GENERALE',
    label: 'Consultation Générale',
    description: 'Consultation médicale générale'
  },
  {
    code: 'CPN',
    label: 'Consultation Prénatale',
    description: 'Suivi de grossesse et consultation prénatale'
  },
  {
    code: 'ACCOUCHEMENT',
    label: 'Accouchement',
    description: 'Accompagnement et suivi d\'accouchement'
  },
  {
    code: 'VACCINATION',
    label: 'Vaccination',
    description: 'Administration de vaccins'
  },
  {
    code: 'SUIVI_NUTRITIONNEL',
    label: 'Suivi Nutritionnel',
    description: 'Évaluation et suivi de l\'état nutritionnel'
  },
  {
    code: 'PLANIFICATION_FAMILIALE',
    label: 'Planification Familiale',
    description: 'Conseil et services de planification familiale'
  },
  {
    code: 'IST_SIDA',
    label: 'IST/SIDA',
    description: 'Dépistage et traitement IST/SIDA'
  },
  {
    code: 'ROUGEOLE',
    label: 'Rougeole',
    description: 'Prise en charge de la rougeole'
  },
  {
    code: 'PALUDISME',
    label: 'Paludisme',
    description: 'Diagnostic et traitement du paludisme'
  }
];

export async function seedTypeConsultation() {
  try {
    console.log('🌱 Seeding TypeConsultation...');
    
    for (const type of typesConsultation) {
      await TypeConsultation.findOrCreate({
        where: { code: type.code },
        defaults: type
      });
    }
    
    console.log('✅ TypeConsultation seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding TypeConsultation:', error);
    throw error;
  }
}