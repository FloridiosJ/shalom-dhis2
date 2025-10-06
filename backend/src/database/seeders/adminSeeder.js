import User from '../../../models/user.js';

export async function seedAdmin() {
  try {
    const existingAdmin = await User.findOne({
      where: { role: 'admin' }
    });

    if (existingAdmin) {
      console.log('✅ Admin already exists:', existingAdmin.email);
      return existingAdmin;
    }

    const adminData = {
      email: 'admin@shalom-dhis2.org',
      role: 'admin',
      nom: 'Administrateur',
      prenom: 'Système',
      password: 'Admin123!'
    };

    const admin = await User.create(adminData);
    
    console.log('✅ Admin created successfully:', {
      id: admin.id,
      email: admin.email,
      login: admin.login,
      role: admin.role
    });
    
    return admin;

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  }
}