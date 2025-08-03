const User = require('../models/UserModel');
const getRecentUsers = async (limit = 5) => {
    return await User.find({})
        .sort({ created_at: -1 })
        .limit(limit)
        .select('-password');
};

const getAllUsers = async () => {
    return await User.getAllUsers();
};

const getUserById = async (userId) => {
    return await User.findById(userId);
};

const createUser = async (userData) => {
    const { name, email, password, role, username, phone, school, grade } = userData;
    if (await User.emailExists(email)) {
        throw new Error('Email đã được sử dụng');
    }
    if (username && await User.usernameExists(username)) {
        throw new Error('Username đã được sử dụng');
    }
    const newUser = await User.createUser({ 
        name, 
        email, 
        password, 
        username,
        phone,
        school,
        grade,
        role: role || 'user',
        created_at: new Date(),
    });

    return await newUser.toObject();
};

const updateUser = async (userId, updateData) => {
    const { email, username } = updateData;
    const existingUser = await User.findById(userId);
    if (!existingUser) {
        throw new Error('Người dùng không tồn tại');
    }
    
    if (email && email !== existingUser.email) {
        if (await User.emailExists(email)) {
            throw new Error('Email đã được sử dụng bởi tài khoản khác');
        }
    }
    
    if (username && username !== existingUser.username) {
        if (await User.usernameExists(username)) {
            throw new Error('Username đã được sử dụng bởi tài khoản khác');
        }
    }
    const result = await User.updateUserById(userId, updateData);
    return result;
};

const updateEmail = async (userId, email) => {
    const existingUser = await User.findById(userId);
    if (await User.emailExists(email)) {
        throw new Error('Email đã được sử dụng bởi tài khoản khác');
    }
    existingUser.email = email;
    const result = await existingUser.save();
    return result;
};

const deleteUser = async (userId) => {
    return await User.deleteUserById(userId);
};

const register = async (userData) => {
    const { name, email, password, username, phone, school, grade } = userData;
    if (!name || !email || !password || !username || !phone || !school || !grade) {
        throw new Error('Vui lòng nhập đầy đủ thông tin');
    }
    if (await User.emailExists(email)) {
        throw new Error('Email đã được sử dụng');
    }
    if (username && await User.usernameExists(username)) {
        throw new Error('Username đã được sử dụng');
    }
    const newUser = await User.createUser({ 
        name, 
        email, 
        password,
        username, 
        phone,
        school,
        grade,
        role: 'user',
        created_at: new Date(),
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    return userResponse;
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId);
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
        throw new Error('Mật khẩu hiện tại không đúng');
    }
    user.password = newPassword;
    await user.save();

    return { message: 'Đổi mật khẩu thành công' };
};

const lockUser = async (userId) => {
    const user = await User.findById(userId);
    
    user.is_active = 0;
    await user.save();
    return { message: 'Đã khóa tài khoản' };
};

const toggleUserStatus = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    
    user.is_active = user.is_active === 1 ? 0 : 1;
    await user.save();
    
    const action = user.is_active === 0 ? 'khóa' : 'mở khóa';
    return { message: `Đã ${action} tài khoản thành công` };
};


module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    updateEmail,
    getRecentUsers,
    deleteUser,
    register,
    changePassword,
    lockUser,
    toggleUserStatus,
    getRecentUsers,
};

