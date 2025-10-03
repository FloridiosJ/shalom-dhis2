import { seedAdmin } from './adminSeeder.js';

export const runSeeders = async () => {
  console.log('🌱 Starting database seeding...');
  await seedAdmin();
  console.log('✅ Database seeding completed');
};