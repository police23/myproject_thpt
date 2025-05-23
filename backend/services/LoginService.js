const User = require('../models/UsersModel');
const auth = require('../middlewares/authMiddleware');

exports.authenticateUser = async (email, password) => {
    // Find user by email
    const user = await User.findOne({ email });
    
    // If user not found, return null
    if (!user) {
        return null;
    }
    
    // Verify password
    const isPasswordValid = await auth.verifyPassword(password, user.password);
    if (!isPasswordValid) {
        return null;
    }
    
    // Generate JWT token
    const token = auth.generateToken(user.id);
    
    // Return user data without password
    const userObject = user.toObject();
    delete userObject.password;
    
    return {
        ...userObject,
        token
    };
};
