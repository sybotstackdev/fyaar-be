const User = require('../models/userModel');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} Created user and token
 */
const register = async (userData) => {
  try {
    // Check if email already exists
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    const userResponse = user.getPublicProfile();

    logger.info(`New user registered: ${user.email}`);

    return {
      user: userResponse,
      token
    };
  } catch (error) {
    logger.error('User registration error:', error.message);
    throw error;
  }
};

/**
 * Authenticate user login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} User data and token
 */
const login = async (email, password) => {
  try {
    // Find user by email and include password for comparison
    const user = await User.findByEmail(email).select('+password');
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    const userResponse = user.getPublicProfile();

    logger.info(`User logged in: ${user.email}`);

    return {
      user: userResponse,
      token
    };
  } catch (error) {
    logger.error('User login error:', error.message);
    throw error;
  }
};

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Object} User profile
 */
const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    return user.getPublicProfile();
  } catch (error) {
    logger.error('Get profile error:', error.message);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated user profile
 */
const updateProfile = async (userId, updateData) => {
  try {
    // Remove sensitive fields that shouldn't be updated directly
    const { password, role, isActive, ...safeUpdateData } = updateData;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: safeUpdateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    logger.info(`User profile updated: ${user.email}`);

    return user.getPublicProfile();
  } catch (error) {
    logger.error('Update profile error:', error.message);
    throw error;
  }
};

/**
 * Get all users with pagination
 * @param {Object} options - Pagination and filter options
 * @returns {Object} Users and pagination info
 */
const getAllUsers = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search = '',
      role = ''
    } = options;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      results: users.map(user => user.getPublicProfile()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    logger.error('Get all users error:', error.message);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object} User profile
 */
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    return user.getPublicProfile();
  } catch (error) {
    logger.error('Get user by ID error:', error.message);
    throw error;
  }
};

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
const deleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    logger.info(`User deleted: ${user.email}`);

    return true;
  } catch (error) {
    logger.error('Delete user error:', error.message);
    throw error;
  }
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {boolean} Success status
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    return true;
  } catch (error) {
    logger.error('Change password error:', error.message);
    throw error;
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  deleteUser,
  changePassword
}; 