const User = require('../models/UserModel');
const auth = require('../middlewares/authMiddleware');
const nodemailer = require('nodemailer');

const authenticateUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        return null;
    }
    // Kiểm tra trạng thái tài khoản
    if (user.is_active === 0 || user.status === 'inactive') {
        return null;
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return null;
    }
    const token = auth.generateToken(user.id);
    const userObject = user.toObject();
    delete userObject.password;
    return {
        ...userObject,
        token
    };
};

// Gửi OTP quên mật khẩu
async function forgotPassword(email) {
    if (!email) return { success: false, message: 'Vui lòng nhập email', status: 400 };
    const user = await User.findOne({ email });
    if (!user) return { success: false, message: 'Email không tồn tại', status: 404 };
    // Tạo OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 phút
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = otpExpire;
    await user.save();
    // Gửi email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Mã OTP đặt lại mật khẩu',
        text: `Mã OTP của bạn là: ${otp}. Có hiệu lực trong 10 phút.`
    };
    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Đã gửi mã OTP đến email' };
    } catch (err) {
        console.error('Lỗi gửi email:', err);
        return { success: false, message: 'Không gửi được email. Vui lòng thử lại.', status: 500 };
    }
}

// Xác thực OTP
async function verifyOtp(email, otp) {
    if (!email || !otp) return { success: false, message: 'Thiếu thông tin', status: 400 };
    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordOTP || !user.resetPasswordOTPExpire) {
        return { success: false, message: 'OTP không hợp lệ', status: 400 };
    }
    if (user.resetPasswordOTP !== otp) {
        return { success: false, message: 'Mã OTP không đúng', status: 400 };
    }
    if (Date.now() > user.resetPasswordOTPExpire) {
        return { success: false, message: 'Mã OTP đã hết hạn', status: 400 };
    }
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpire = null;
    user.resetPasswordVerified = true;
    await user.save();
    return { success: true, message: 'OTP hợp lệ, bạn có thể đặt lại mật khẩu' };
}

// Đặt lại mật khẩu
async function resetPassword(email, newPassword) {
    if (!email || !newPassword) return { success: false, message: 'Thiếu thông tin', status: 400 };
    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordVerified) {
        return { success: false, message: 'Bạn chưa xác thực OTP hoặc email không hợp lệ', status: 400 };
    }
    user.password = newPassword;
    user.resetPasswordVerified = false;
    await user.save();
    return { success: true, message: 'Đặt lại mật khẩu thành công' };
}

module.exports = {
    authenticateUser,
    forgotPassword,
    verifyOtp,
    resetPassword
};
