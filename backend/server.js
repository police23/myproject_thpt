const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
const cors = require('cors');
app.use(cors());
connectDB(); // kết nối MongoDB

app.use(express.json());

// Đảm bảo require model trước controller
const UserModel = require('./models/UsersModel');
const Question = require('./models/QuestionsModel');
const Test = require('./models/TestsModel');
const Section = require('./models/SectionsModel');
const TestController = require('./controllers/TestController');

// Test route để kiểm tra kết nối backend
app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong' });
});

// Route debug kiểm tra database và tìm user
app.get('/api/debug', async (req, res) => {
    try {
        // Kiểm tra kết nối database
        const dbStatus = mongoose.connection.readyState;
        let dbStatusText = '';
        switch (dbStatus) {
            case 0: dbStatusText = 'Đã ngắt kết nối'; break;
            case 1: dbStatusText = 'Đã kết nối'; break;
            case 2: dbStatusText = 'Đang kết nối'; break;
            case 3: dbStatusText = 'Đang ngắt kết nối'; break;
        }

        // Thử lấy danh sách user
        const usersCount = await UserModel.countDocuments();

        res.json({
            dbStatus: dbStatusText,
            dbConnected: dbStatus === 1,
            usersInDB: usersCount,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            message: 'Lỗi khi kiểm tra database',
            error: err.message
        });
    }
});

// Cần gọi API này trước khi thử tạo test
app.get('/api/create-collections', async (req, res) => {
    try {
        // Tạo collections bằng cách gọi model
        console.log('Creating collections...');
        await Question.createCollection();
        await Section.createCollection();
        await Test.createCollection();

        res.json({ message: 'Collections created successfully!' });
    } catch (err) {
        console.error('Error creating collections:', err);
        res.status(500).json({ error: err.message });
    }
});

// Route thêm đề thi mới
app.post('/api/add-test', TestController.createTest);

// Route lấy danh sách đề thi
app.get('/api/list-tests', TestController.getAllTests);

// Mount route groups
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const userRoutes = require('./routes/users'); // Add this line

app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/users', userRoutes); // Add this line

// Add additional route for getting a single test by ID if not already included in testRoutes
app.get('/api/tests/:id', TestController.getTestById);

// Middleware xử lý lỗi (luôn trả về JSON)
app.use((err, req, res, next) => {
    console.error('Lỗi server:', err);
    res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
