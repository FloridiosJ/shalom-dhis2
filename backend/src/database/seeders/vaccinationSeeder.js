import Vaccination from '../../models/vaccination.js';
import { Patient, User } from '../../models/index.js';

export async function seedVaccination() {
  try {
    console.log('🌱 Seeding Vaccination...');

    // Vérifier qu'il existe au moins un patient et un agent
    const patient = await Patient.findOne();
    const agent = await User.findOne({ where: { role: 'agent' } });

    if (!patient) {
      console.log('⚠️  Aucun patient trouvé, skip seeding vaccination');
      return;
    }

    if (!agent) {
      console.log('⚠️  Aucun agent trouvé, skip seeding vaccination');
      return;
    }

    const vaccinations = [
      {
        patientId: patient.id,
        dateVaccination: new Date('2024-01-15'),
        typeVaccin: 'BCG_POLIO_O',
        lot: 'BCG2024A',
        agentId: agent.id,
        remarques: 'Vaccination à la naissance'
      },
      {
        patientId: patient.id,
        dateVaccination: new Date('2024-03-01'),
        typeVaccin: 'DTCOQ_HEP_B_POLIO_I',
        lot: 'DTCOQ2024B',
        agentId: agent.id,
        remarques: 'Première dose'
      }
    ];

    for (const vaccination of vaccinations) {
      await Vaccination.findOrCreate({
        where: {
          patientId: vaccination.patientId,
          typeVaccin: vaccination.typeVaccin,
          dateVaccination: vaccination.dateVaccination
        },
        defaults: vaccination
      });
    }

    console.log('✅ Vaccination seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding Vaccination:', error);
    throw error;
  }
}