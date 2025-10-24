import { seedAdmin } from './adminSeeder.js';
import { seedDispensaire } from './dispensaireSeeder.js';
import { seedTypeConsultation } from './typeConsultationSeeder.js';
import { seedCategorieMaladie } from './categorieMaladieSeeder.js';
import { seedVaccination } from './vaccinationSeeder.js';

export const runSeeders = async () => {
  console.log('🌱 Starting database seeding...');
  console.log('');
  
  // 1. Dispensaires d'abord (requis pour les autres)
  await seedDispensaire();
  console.log('');
  
  // 2. Admin (peut avoir un dispensaire)
  await seedAdmin();
  console.log('');
  
  // 3. Types de consultation
  await seedTypeConsultation();
  console.log('');
  
  // 4. Catégories de maladies
  await seedCategorieMaladie();
  console.log('');
  
  // 5. Vaccinations (après patients et agents)
  await seedVaccination();
  console.log('');
  
  console.log('✅ Database seeding completed');
  console.log('='.repeat(50));
  
};