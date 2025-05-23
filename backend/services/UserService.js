const User = require('../models/UsersModel');

exports.getAllUsers = async (search, role, page, pageSize) => {
    return await User.findWithFilters(search, role, page, pageSize);
};

exports.getUserById = async (userId) => {
    return await User.findByIdNoPassword(userId);
};

exports.createUser = async (userData) => {
    const { name, email, password, role } = userData;
    
    // Check if email already exists
    if (await User.emailExists(email)) {
        throw new Error('Email đã được sử dụng');
    }
    
    // Create user with provided data
    const newUser = await User.createUser({ 
        name, 
        email, 
        password, 
        role: role || 'user' 
    });
    
    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    return userResponse;
};

exports.updateUser = async (userId, updateData) => {
    return await User.updateUserById(userId, updateData);
};

exports.deleteUser = async (userId) => {
    return await User.deleteUserById(userId);
};

exports.register = async (userData) => {
    const { name, email, password } = userData;
    
    // Validate required fields
    if (!name || !email || !password) {
        throw new Error('Vui lòng nhập đầy đủ thông tin');
    }
    
    // Check if email already exists
    if (await User.emailExists(email)) {
        throw new Error('Email đã được sử dụng');
    }
    
    // Create new user with 'user' role
    const newUser = await User.createUser({ 
        name, 
        email, 
        password, 
        role: 'user' 
    });
    
    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    return userResponse;
};
