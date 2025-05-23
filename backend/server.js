const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request body

// Connect to MongoDB
connectDB();

// Import models
require('./models/TestsModel');
require('./models/SectionsModel');
require('./models/QuestionsModel');


// Import controllers
const TestController = require('./controllers/TestController');
const LoginController = require('./controllers/LoginController');

// Import routes
const authRoutes = require('./routes/AuthRoutes');
const testsRoutes = require('./routes/TestsRoutes');
const usersRoutes = require('./routes/UsersRoutes');

// Login route
app.post('/api/login', LoginController.login);

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/users', usersRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Lỗi server:', err);
    res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
