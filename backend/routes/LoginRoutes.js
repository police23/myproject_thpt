const express = require('express');
const router = express.Router();
const LoginController = require('../controllers/LoginController');
router.post('/', LoginController.login);
router.post('/login', LoginController.login);
router.post('/forgot-password', LoginController.forgotPassword);
router.post('/verify-otp', LoginController.verifyOtp);
router.post('/reset-password', LoginController.resetPassword);

module.exports = router;
