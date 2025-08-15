import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'superadmin' });
    if (existingAdmin) {
      console.log('Super admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@ecommerce.com',
      password: 'admin123',
      role: 'superadmin',
      permissions: [
        'manage_users',
        'manage_products',
        'manage_categories', 
        'manage_orders',
        'manage_hero',
        'manage_footer',
        'manage_pages',
        'view_analytics'
      ],
      emailVerified: true,
      isActive: true
    });

    await adminUser.save();
    console.log('Super admin user created successfully!');
    console.log('Email: admin@ecommerce.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
};

createAdminUser();