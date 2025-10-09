import sequelize from '../config/db.js';

export async function initDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // ✅ Import du fichier index qui charge tous les modèles et associations
    console.log('📦 Loading all models...');
    await import('../models/index.js');
    
    console.log('🔄 Synchronizing database...');
    
    // ✅ Synchroniser tous les modèles avec leurs associations
    await sequelize.sync({ 
      force: process.env.NODE_ENV === 'development', // Force seulement en dev
      alter: process.env.NODE_ENV !== 'production',  // Alter sauf en production
      logging: console.log 
    });
    
    console.log('✅ Database synchronized successfully.');
    console.log('🔍 Tables created:', Object.keys(sequelize.models));
    
    console.log('🔄 Running seeders...');
    const { seedAdmin } = await import('./seeders/adminSeeder.js');
    await seedAdmin();
    console.log('✅ Seeders completed successfully.');
    
  } catch (error) {
    console.error('❌ Unable to initialize database:', error);
    throw error;
  }
}