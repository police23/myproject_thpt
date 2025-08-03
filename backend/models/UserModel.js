const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, default: 'active' },
  is_active: { type: Number, enum: [0, 1], default: 1 }, 
  phone: String,
  school: String,
  grade: Number,
  avatar: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
    // Thêm các trường cho quên mật khẩu
    resetPasswordOTP: { type: String },
    resetPasswordOTPExpire: { type: Number },
    resetPasswordVerified: { type: Boolean, default: false }
});

userSchema.pre('save', async function(next) {
  this.updated_at = Date.now();
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


userSchema.statics.createUser = async function(userData) {
  try {
    const newUser = new this(userData);
    await newUser.save();
    return newUser;
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

userSchema.statics.updateUserById = async function(userId, updateData) {
  try {
    console.log('UsersModel.updateUserById called with:', { userId, updateData });
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }
    
    updateData.updated_at = Date.now();
    const updatedUser = await this.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    console.log('User updated successfully in model:', updatedUser._id);
    return updatedUser;
  } catch (error) {
    console.error('Error in updateUserById model:', error);
    throw new Error(`Error updating user: ${error.message}`);
  }
};

userSchema.statics.changePassword = async function(userId, currentPassword, newPassword) {
  try {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      throw new Error('Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    throw new Error(`Error changing password: ${error.message}`);
  }
};

userSchema.statics.deleteUserById = async function(userId) {
  try {
    const result = await this.findByIdAndDelete(userId);
    if (!result) {
      throw new Error('User not found');
    }
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};

userSchema.statics.findByEmail = async function(email) {
  return this.findOne({ email });
};

userSchema.statics.findByUsername = async function(username) {
  return this.findOne({ username });
};

// Get all users without filtering (frontend will handle filtering)
userSchema.statics.getAllUsers = async function() {
  const users = await this.find({})
    .select('-password') // Don't send password to frontend
    .sort({ created_at: -1 });
    
  return users;
};

userSchema.statics.emailExists = async function(email) {
  return await this.findOne({ email }) !== null;
};

userSchema.statics.usernameExists = async function(username) {
  return await this.findOne({ username }) !== null;
};

userSchema.statics.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

userSchema.statics.lockUser = async function(userId) {
  try {
    const user = await this.findById(userId);
    user.is_active = 0;
    await user.save();
    return { success: true, message: 'Account locked successfully' };
  } catch (error) { 
    throw new Error(`Error locking account: ${error.message}`);
  }
}


module.exports = mongoose.models.User || mongoose.model('User', userSchema);
