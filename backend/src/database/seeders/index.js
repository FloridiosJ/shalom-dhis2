import { seedAdmin } from './adminSeeder.js';
import { seedTypeConsultation } from './typeConsultationSeeder.js';

export const runSeeders = async () => {
  console.log('🌱 Starting database seeding...');
  await seedAdmin();
  await seedTypeConsultation();
  console.log('✅ Database seeding completed');
};