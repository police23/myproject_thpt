const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
router.get('/test', (req, res) => res.json({ ok: true }));

// Routes for user management
router.post('/register', UserController.register);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// Note: To connect with the frontend, ensure this router is mounted at '/api/users' 
// in your main Express app file (e.g., app.js or server.js)
// Example: app.use('/api/users', usersRouter);

module.exports = router;
