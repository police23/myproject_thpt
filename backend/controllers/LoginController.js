
const LoginService = require('../services/LoginService');
const User = require('../models/UserModel');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
exports.forgotPassword = async (req, res) => {
    try {
        const result = await LoginService.forgotPassword(req.body.email);
        if (result.success) {
            res.json({ success: true, message: result.message });
        } else {
            res.status(result.status || 400).json({ message: result.message });
        }
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const result = await LoginService.verifyOtp(req.body.email, req.body.otp);
        if (result.success) {
            res.json({ success: true, message: result.message });
        } else {
            res.status(result.status || 400).json({ message: result.message });
        }
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
    try {
        const result = await LoginService.resetPassword(req.body.email, req.body.newPassword);
        if (result.success) {
            res.json({ success: true, message: result.message });
        } else {
            res.status(result.status || 400).json({ message: result.message });
        }
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await LoginService.authenticateUser(email, password);
        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng hoặc tài khoản bị khóa' });
        }
        const VisitsCounter = require('../models/VisitsCounter');
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10);
        await VisitsCounter.findOneAndUpdate(
          { date: dateStr },
          { $inc: { count: 1 } },
          { upsert: true }
        );
        res.status(200).json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
