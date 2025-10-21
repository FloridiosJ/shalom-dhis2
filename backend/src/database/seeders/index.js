import { seedAdmin } from './adminSeeder.js';
import { seedTypeConsultation } from './typeConsultationSeeder.js';
import { seedCategorieMaladie } from './categorieMaladieSeeder.js';

export const runSeeders = async () => {
  console.log('🌱 Starting database seeding...');
  await seedAdmin();
  await seedTypeConsultation();
  await seedCategorieMaladie();
  console.log('✅ Database seeding completed');
};