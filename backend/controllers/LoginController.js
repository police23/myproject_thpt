const User = require('../models/UsersModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user theo email
        const user = await User.findOne({ email });

        // Nếu không tìm thấy user
        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // Kiểm tra mật khẩu
        // Nếu bạn đã hash mật khẩu khi đăng ký:
        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) {
        //     return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        // }

        // Cho mục đích demo, tạm thời bỏ qua so sánh pass (có thể bật lại nếu cần)
        if (password !== user.password) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // Tạo token JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', {
            expiresIn: '1d'
        });

        // Trả về thông tin user (không bao gồm password)
        const userObject = user.toObject();
        delete userObject.password;

        res.status(200).json({
            user: {
                ...userObject,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
