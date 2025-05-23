const LoginService = require('../services/LoginService');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Use service for authentication logic
        const user = await LoginService.authenticateUser(email, password);

        // If authentication failed
        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // Return authenticated user
        res.status(200).json({
            user: user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
