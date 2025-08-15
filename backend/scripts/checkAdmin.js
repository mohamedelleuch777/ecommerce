import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const checkAdmin = async () => {
  try {
    await connectDB();
    const admin = await User.findOne({ email: 'admin@ecommerce.com' });
    console.log('Admin user found:', admin ? {
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.isActive,
      isAdminMethod: admin.isAdmin(),
      hasPermissionMethod: admin.hasPermission('manage_hero')
    } : 'No admin user found');
    
    // Test regular user
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (testUser) {
      console.log('Test user found:', {
        email: testUser.email,
        role: testUser.role,
        isAdminMethod: testUser.isAdmin()
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAdmin();