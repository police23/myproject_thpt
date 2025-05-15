const express = require('express');
const router = express.Router();
const LoginController = require('../controllers/LoginController');

// Log khi có request tới /api/login
router.post('/login', (req, res, next) => {
    console.log('Nhận request POST /api/login:', req.body);
    next();
}, LoginController.login);

module.exports = router;
