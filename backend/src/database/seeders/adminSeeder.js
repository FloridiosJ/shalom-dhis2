import { User } from '../../../models/index.js';

export const seedAdmin = async () => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({
      where: { email: 'admin@dhis2.org' }
    });

    if (!adminExists) {
      await User.create({
        email: 'admin@dhis2.org',
        password: 'Admin123!',
        role: 'admin'
      });
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  }
};