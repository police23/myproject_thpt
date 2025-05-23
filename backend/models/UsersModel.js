const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Phương thức pre-save để tự động hash password và cập nhật thời gian
userSchema.pre('save', async function(next) {
  // Cập nhật thời gian
  this.updated_at = Date.now();
  
  // Nếu password được thay đổi thì hash
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Phương thức so sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Phương thức tạo user mới
userSchema.statics.createUser = async function(userData) {
  try {
    const newUser = new this(userData);
    await newUser.save();
    return newUser;
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

// Phương thức cập nhật thông tin user
userSchema.statics.updateUserById = async function(userId, updateData) {
  try {
    // Không cho phép cập nhật trực tiếp password qua phương thức này
    if (updateData.password) {
      delete updateData.password;
    }
    
    updateData.updated_at = Date.now();
    
    const updatedUser = await this.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    return updatedUser;
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

// Phương thức đổi mật khẩu
userSchema.statics.changePassword = async function(userId, currentPassword, newPassword) {
  try {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Kiểm tra mật khẩu hiện tại
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      throw new Error('Current password is incorrect');
    }
    
    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();
    
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    throw new Error(`Error changing password: ${error.message}`);
  }
};

// Phương thức xóa user
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

// Phương thức tìm user theo email
userSchema.statics.findByEmail = async function(email) {
  return this.findOne({ email });
};

// Static method to find users with search and pagination
userSchema.statics.findWithFilters = async function(search, role, page, pageSize) {
  let query = {};
  
  // Handle search
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query = {
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    };
  }
  
  // Handle role filter
  if (role && role !== 'all') {
    query.role = role;
  }
  
  const skip = (page - 1) * pageSize;
  
  const users = await this.find(query)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(pageSize)
    .select('-password');
    
  const total = await this.countDocuments(query);
  
  return {
    users,
    total,
    page,
    pageSize,
    pages: Math.ceil(total / pageSize)
  };
};

// Static method to find user by ID and exclude password
userSchema.statics.findByIdNoPassword = async function(id) {
  return this.findById(id).select('-password');
};

// Static method to check if email exists
userSchema.statics.emailExists = async function(email) {
  return await this.findOne({ email }) !== null;
};

// Static method to hash password
userSchema.statics.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, 12);
};

// Đảm bảo không đăng ký model nhiều lần
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
