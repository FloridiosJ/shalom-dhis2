import TypeConsultation from '../../models/typeConsultation.js';

const typesConsultation = [
  {
    code: 'CURATIF',
    libelle: 'Consultation Curative',
    description: 'Consultation pour traitement de maladies',
    isActive: true
  },
  {
    code: 'PREVENTIF',
    libelle: 'Consultation Préventive',
    description: 'Consultation de prévention et dépistage',
    isActive: true
  },
  {
    code: 'CPN',
    libelle: 'Consultation Prénatale',
    description: 'Suivi de grossesse et consultation prénatale',
    isActive: true
  },
  {
    code: 'CPON',
    libelle: 'Consultation Post-Natale',
    description: 'Suivi après accouchement',
    isActive: true
  },
  {
    code: 'ACCOUCHEMENT',
    libelle: 'Accouchement',
    description: 'Accompagnement et suivi d\'accouchement',
    isActive: true
  },
  {
    code: 'VACCINATION',
    libelle: 'Vaccination',
    description: 'Administration de vaccins',
    isActive: true
  },
  {
    code: 'NUTRITION',
    libelle: 'Suivi Nutritionnel',
    description: 'Évaluation et suivi de l\'état nutritionnel',
    isActive: true
  },
  {
    code: 'PLANIFICATION',
    libelle: 'Planification Familiale',
    description: 'Conseil et services de planification familiale',
    isActive: true
  },
  {
    code: 'IST',
    libelle: 'IST/SIDA',
    description: 'Dépistage et traitement IST/SIDA',
    isActive: true
  },
  {
    code: 'PALUDISME',
    libelle: 'Paludisme',
    description: 'Diagnostic et traitement du paludisme',
    isActive: true
  },
  {
    code: 'TUBERCULOSE',
    libelle: 'Tuberculose',
    description: 'Dépistage et traitement de la tuberculose',
    isActive: true
  },
  {
    code: 'URGENCE',
    libelle: 'Urgence',
    description: 'Consultation d\'urgence',
    isActive: true
  }
];

export async function seedTypeConsultation() {
  try {
    console.log('🌱 Seeding TypeConsultation...');
    
    let created = 0;
    let updated = 0;

    for (const type of typesConsultation) {
      const [typeConsultation, isCreated] = await TypeConsultation.findOrCreate({
        where: { code: type.code },
        defaults: {
          libelle: type.libelle,
          description: type.description,
          isActive: type.isActive
        }
      });

      if (isCreated) {
        created++;
        console.log(`  ✅ Type créé: ${type.code} - ${type.libelle}`);
      } else {
        // Mettre à jour si existe déjà
        await typeConsultation.update({
          libelle: type.libelle,
          description: type.description,
          isActive: type.isActive
        });
        updated++;
        console.log(`  🔄 Type mis à jour: ${type.code} - ${type.libelle}`);
      }
    }
    
    console.log('✅ TypeConsultation seeded successfully');
    console.log(`📊 Créés: ${created} | Mis à jour: ${updated} | Total: ${typesConsultation.length}`);
  } catch (error) {
    console.error('❌ Error seeding TypeConsultation:', error);
    throw error;
  }
}