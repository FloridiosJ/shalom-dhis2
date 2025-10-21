import sequelize from '../config/db.js';

export async function initDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    console.log('📦 Loading all models...');
    await import('../models/index.js');
    
    console.log('🔄 Synchronizing database...');
    
    await sequelize.sync({ 
      force: process.env.NODE_ENV === 'development',
      alter: process.env.NODE_ENV !== 'production',
      logging: console.log 
    });
    
    console.log('✅ Database synchronized successfully.');
    console.log('🔍 Tables created:', Object.keys(sequelize.models));
    
    console.log('🔄 Running seeders...');
    const { runSeeders } = await import('./seeders/index.js');
    await runSeeders();
    console.log('✅ Seeders completed successfully.');
    
  } catch (error) {
    console.error('❌ Unable to initialize database:', error);
    throw error;
  }
}