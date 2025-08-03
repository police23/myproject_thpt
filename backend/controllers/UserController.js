const UserService = require('../services/UserService');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await UserService.getAllUsers();
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await UserService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const userData = req.body;
        const newUser = await UserService.createUser(userData);
        res.status(201).json(newUser);
    } catch (error) {
        if (error.message === 'Email đã được sử dụng') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await UserService.updateUser(req.params.id, req.body);
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        if (error.message === 'Người dùng không tồn tại') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Email đã được sử dụng bởi tài khoản khác' || 
            error.message === 'Username đã được sử dụng bởi tài khoản khác') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateEmail = async (req, res) => {
    try {
        const userId = req.params.id;
        const email = req.body.email;
        if (!email) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email mới' });
        }
        const updatedUser = await UserService.updateEmail(userId, email);
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        if (error.message === 'Email đã được sử dụng bởi tài khoản khác') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const result = await UserService.deleteUser(req.params.id);
        res.json({ message: result.message });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        const userData = req.body;
        const newUser = await UserService.register(userData);
        res.status(201).json(newUser);
    } catch (error) {
        if (error.message === 'Vui lòng nhập đầy đủ thông tin' || 
            error.message === 'Email đã được sử dụng') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.params.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin mật khẩu' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        const result = await UserService.changePassword(userId, currentPassword, newPassword);
        res.json({ message: result.message });
    } catch (error) {
        if (error.message === 'User not found' || error.message === 'Người dùng không tồn tại') {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        if (error.message === 'Current password is incorrect' || error.message === 'Mật khẩu hiện tại không đúng') {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.lockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await UserService.lockUser(userId);
        res.json({ message: result.message });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await UserService.toggleUserStatus(userId);
        res.json({ message: result.message });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Upload avatar controller
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Không có file ảnh' });
        }
        // Đường dẫn public cho frontend
        const avatarUrl = `/uploads/${req.file.filename}`;
        // Lưu vào DB
        const userId = req.params.id;
        const updatedUser = await UserService.updateUser(userId, { avatar: avatarUrl });
        res.json({ avatarUrl });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi upload avatar', error: error.message });
    }
};