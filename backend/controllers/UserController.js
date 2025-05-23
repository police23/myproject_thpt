const UserService = require('../services/UserService');

exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const result = await UserService.getAllUsers(
            req.query.search,
            req.query.role,
            page,
            pageSize
        );
        
        res.json(result);
    } catch (error) {
        console.error('Error fetching users:', error);
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
        console.error('Error fetching user:', error);
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
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await UserService.updateUser(req.params.id, req.body);
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
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
        console.error('Error deleting user:', error);
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
        console.error('Error register user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
