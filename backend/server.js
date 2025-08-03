const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' })); // Parse JSON request body, tăng giới hạn lên 5mb
app.use(express.urlencoded({ limit: '5mb', extended: true })); // Tăng giới hạn cho form-data

// Tích hợp uploadMiddleware cho các route cần upload ảnh
const upload = require('./middlewares/uploadMiddleware');

// Serve static uploads folder
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Connect to MongoDB
connectDB();

// Import models
require('./models/TestsModel');
require('./models/SectionsModel');
require('./models/QuestionsModel');
require('./models/StudyTimeModel');
require('./models/BlogModel');


// Import controllers
const TestController = require('./controllers/TestController');
const LoginController = require('./controllers/LoginController');
const UserController = require('./controllers/UserController');
const BlogController = require('./controllers/BlogController');
const StudyTimeController = require('./controllers/StudyTimeController');
// Import routes
const loginRoutes = require('./routes/LoginRoutes');
const testsRoutes = require('./routes/TestsRoutes');
const usersRoutes = require('./routes/UsersRoutes');
const blogRoutes= require('./routes/BlogRoutes');
const studyTimeRoutes = require('./routes/StudyTimeRoutes');
const statsRoutes = require('./routes/StatsRoutes');

// Login route
app.post('/api/login', LoginController.login);

// Register routes
app.use('/api/auth', loginRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/study-time', studyTimeRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', statsRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Lỗi server:', err);
    res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
});

// Start server with socket.io
const PORT = process.env.PORT || 5000;
const http = require('http');
const server = http.createServer(app);
const { setupSocket } = require('./socket');
setupSocket(server);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
