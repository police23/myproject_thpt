const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true })); 
const upload = require('./middlewares/uploadMiddleware');
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));
connectDB();

require('./models/TestModel');
require('./models/SectionModel');
require('./models/QuestionModel');
require('./models/BlogModel');

const TestController = require('./controllers/TestController');
const LoginController = require('./controllers/LoginController');
const UserController = require('./controllers/UserController');
const BlogController = require('./controllers/BlogController');
const StudyTimeController = require('./controllers/StudyTimeController');
const loginRoutes = require('./routes/LoginRoutes');
const testsRoutes = require('./routes/TestsRoutes');
const usersRoutes = require('./routes/UsersRoutes');
const blogRoutes= require('./routes/BlogRoutes');
const studyTimeRoutes = require('./routes/StudyTimeRoutes');
const statsRoutes = require('./routes/StatsRoutes');

app.post('/api/login', LoginController.login);

app.use('/api/auth', loginRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/study-time', studyTimeRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', statsRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((err, req, res, next) => {
    console.error('Lỗi server:', err);
    res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
});

const PORT = process.env.PORT || 5000;
const http = require('http');
const server = http.createServer(app);
const { setupSocket } = require('./socket');
setupSocket(server);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
