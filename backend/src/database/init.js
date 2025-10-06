import sequelize from '../../config/db.js';

export async function initDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Import models dans l'ordre de dépendance
    console.log('📦 Importing models...');
    const Dispensaire = (await import('../../models/dispensaire.js')).default;
    const User = (await import('../../models/user.js')).default;
    const DataEntry = (await import('../../models/dataEntry.js')).default;

    console.log('🔄 Synchronizing database in correct order...');
    
    // Créer les tables sans associations d'abord
    await Dispensaire.sync({ force: true, logging: console.log });
    console.log('✅ Dispensaire table created');
    
    await User.sync({ force: true, logging: console.log });
    console.log('✅ User table created');
    
    await DataEntry.sync({ force: true, logging: console.log });
    console.log('✅ DataEntry table created');
    
    console.log('✅ Database synchronized successfully.');
    
    console.log('🔄 Running seeders...');
    const { seedAdmin } = await import('./seeders/adminSeeder.js');
    await seedAdmin();
    console.log('✅ Seeders completed successfully.');
    
  } catch (error) {
    console.error('❌ Unable to initialize database:', error);
    throw error;
  }
}