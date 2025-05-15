const mongoose = require('mongoose');
const connectDB = require('./config/db');
const UserModel = require('./models/UsersModel');

async function initializeUsers() {
    await connectDB();
    console.log('✅ Đã kết nối đến MongoDB');
    try {
        // Thêm user mẫu
        const user = new UserModel({
            name: 'Admin',
            email: 'admin@example.com',
            password: '123456',
            role: 'admin'
        });
        await user.save();
        console.log('✅ User đã được tạo');
    } catch (err) {
        console.error('❌ Lỗi:', err);
    } finally {
        mongoose.connection.close();
    }
}

initializeUsers();