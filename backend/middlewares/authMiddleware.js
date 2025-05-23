const jwt = require('jsonwebtoken');
const User = require('../models/UsersModel');

// Hàm tạo JWT token
exports.generateToken = (userId) => {
    return jwt.sign(
        { id: userId }, 
        process.env.JWT_SECRET || 'your_jwt_secret', 
        { expiresIn: '1d' }
    );
};

// Middleware để bảo vệ route yêu cầu đăng nhập
exports.protect = async (req, res, next) => {
    try {
        let token;
        
        // Kiểm tra token từ header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        // Nếu không có token
        if (!token) {
            return res.status(401).json({ message: 'Không có quyền truy cập, vui lòng đăng nhập' });
        }
        
        try {
            // Xác thực token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
            
            // Tìm user từ id trong token và gán vào request
            const user = await User.findById(decoded.id);
            
            if (!user) {
                return res.status(401).json({ message: 'Người dùng không tồn tại' });
            }
            
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Middleware kiểm tra mật khẩu
exports.verifyPassword = async (plainPassword, hashedPassword) => {
    // Nếu sử dụng bcrypt
    // return await bcrypt.compare(plainPassword, hashedPassword);
    
    // Tạm thời so sánh trực tiếp như trong controller ban đầu
    return plainPassword === hashedPassword;
};
