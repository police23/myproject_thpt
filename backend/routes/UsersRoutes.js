const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const upload = require('../middlewares/uploadMiddleware');
// Test route to check if routes are working
router.get('/test', (req, res) => res.json({ ok: true, message: 'Users routes working' }));

// Test specific user route
router.get('/test/:id', (req, res) => {
    res.json({ 
        ok: true, 
        message: 'User ID route working', 
        userId: req.params.id,
        timestamp: new Date().toISOString()
    });
});

const UserService = require('../services/UserService');
router.get('/recent', async (req, res) => {
    try {
        const users = await UserService.getRecentUsers(5);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.post('/register', UserController.register);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id/email', UserController.updateEmail);
router.put('/:id', UserController.updateUser);
router.post('/:id/upload-avatar', upload.single('avatar'), UserController.uploadAvatar);
router.post('/:id/change-password', UserController.changePassword); 
router.post('/:id/lock', UserController.lockUser); 
router.post('/:id/toggle-status', UserController.toggleUserStatus); 
router.delete('/:id', UserController.deleteUser);
module.exports = router;
