const mongoose = require('mongoose');
require('dotenv').config();

// Import database config
const connectDB = require('./config/db');

async function resetUserSchema() {
  try {
    // Kết nối database
    await connectDB();
    console.log('Connected to MongoDB');

    // Xóa collection User nếu tồn tại
    const collections = await mongoose.connection.db.listCollections().toArray();
    const userCollectionExists = collections.some(col => col.name === 'users');
    
    if (userCollectionExists) {
      await mongoose.connection.db.dropCollection('users');
      console.log('✅ Dropped existing User collection');
    } else {
      console.log('ℹ️  User collection does not exist');
    }

    // Import User model để tạo lại schema
    const User = require('./models/UsersModel');
    
    // Tạo collection mới với schema hiện tại
    await User.createCollection();
    console.log('✅ Created new User collection with updated schema');

    // Tạo indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    console.log('✅ Created unique indexes on email and username fields');

    // Tạo một user admin mặc định
    const defaultAdmin = {
      username: 'admin',
      name: 'Administrator',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      is_active: 1,
      phone: '0123456789',
      school: 'System Admin',
      grade: 12
    };

    const existingAdmin = await User.findByEmail(defaultAdmin.email);
    if (!existingAdmin) {
      await User.createUser(defaultAdmin);
      console.log('✅ Created default admin user');
      console.log('   Username: admin');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    }

    // Tạo một user thường mặc định
    const defaultUser = {
      username: 'user01',
      name: 'Test User',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      status: 'active',
      is_active: 1,
      phone: '0987654321',
      school: 'THPT ABC',
      grade: 12
    };

    const existingUser = await User.findByEmail(defaultUser.email);
    if (!existingUser) {
      await User.createUser(defaultUser);
      console.log('✅ Created default regular user');
      console.log('   Username: user01');
      console.log('   Email: user@example.com');
      console.log('   Password: user123');
    }

    console.log('\n🎉 User schema reset successfully!');
    
  } catch (error) {
    console.error('❌ Error resetting User schema:', error.message);
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Chạy script
resetUserSchema();
