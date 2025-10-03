import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { runSeeders } from '../src/database/seeders/index.js';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: console.log,
});

// Test connection and sync models
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync all models
    await sequelize.sync({ force: true }); // Be careful with force: true in production!
    console.log('✅ Database synchronized successfully.');
    
    // Run seeders
    await runSeeders();
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

initDatabase();

export default sequelize;