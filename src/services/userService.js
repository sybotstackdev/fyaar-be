const User = require('../models/userModel');
const OTP = require('../models/otpModel');
const { generateToken, generateRefreshToken, verifyToken } = require('../middleware/auth');
const emailService = require('./emailService');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const { uploadProfileImageS3, deleteFromS3 } = require('./fileUploadService');

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

    const refreshToken = generateRefreshToken(user); // <-- new function

    // Return user data without password
    const userResponse = user.getPublicProfile();

    logger.info(`User logged in: ${user.email}`);

    return {
      user: userResponse,
      token,
      refreshToken
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
    const user = await User.findById(userId)
      .select('-password')
      .populate('favAuthors', 'authorName')
      .populate('favGenres', 'title');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user.getPublicProfile();
  } catch (error) {
    logger.error('Get profile error:', error.message);
    throw error;
  }
};



const getRefreshToken = async (reqrefreshToken) => {
  try {
    const decoded = verifyToken(reqrefreshToken);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    // Generate token
    const token = generateToken(user);

    const refreshToken = generateRefreshToken(user); // <-- new function

    return {
      token,
      refreshToken
    };
  } catch (error) {
    logger.error('Get refresh token error:', error.message);
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
    const allowedUpdates = [
      'firstName',
      'lastName',
      'bio',
      'favAuthors',
      'favGenres'
    ];
    const safeUpdateData = {};

    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        safeUpdateData[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: safeUpdateData },
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('favAuthors', 'authorName')
      .populate('favGenres', 'title');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    logger.info(`User profile updated: ${user.email}`);

    return user.getPublicProfile();
  } catch (error) {
    logger.error('Update profile error:', error.message);
    throw error;
  }
};

/**
 * Update user profile image
 * @param {string} userId - User ID
 * @param {Object} file - The file object from multer
 * @returns {Object} Updated user profile
 */
const updateProfileImage = async (userId, file) => {
  try {
    if (!file) {
      throw new ApiError(400, 'No image file provided.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Store the old image URL to delete it after the new one is uploaded
    const oldImageUrl = user.profileImage;

    // Upload new image to S3
    const folder = `profile-images/${userId}`;
    const imageUrl = await uploadProfileImageS3(file, folder);

    // Update user's profileImage field
    user.profileImage = imageUrl;
    await user.save();

    logger.info(`Profile image updated for user: ${user.email}`);

    // If user already had a profile image, delete the old one from S3
    if (oldImageUrl) {
      await deleteFromS3(oldImageUrl);
    }
    return {
      profileImage: imageUrl,
    }
  } catch (error) {
    logger.error('Update profile image error:', error.message);
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
      throw new ApiError(404, 'User not found');
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
      throw new ApiError(404, 'User not found');
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
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new ApiError(400, 'Current password is incorrect');
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

/**
 * Send OTP for login
 * @param {string} email - User email
 * @returns {Object} Success message
 */
const sendLoginOTP = async (email) => {
  try {
    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.isActive) {
      throw new ApiError(400, 'Account is deactivated');
    }

    // Generate OTP
    const otp = OTP.generateOTP();

    // Invalidate any existing OTPs for this email
    await OTP.invalidateOTPs(email, 'login');

    // Create new OTP
    const otpRecord = new OTP({
      email: email.toLowerCase(),
      otp,
      type: 'login'
    });
    await otpRecord.save();

    // Send OTP email
    await emailService.sendOTPEmail(email, otp, 'login');

    logger.info(`Login OTP sent to ${email}`);

    return {
      message: 'OTP sent successfully',
      email: email
    };
  } catch (error) {
    logger.error('Send login OTP error:', error.message);
    throw error;
  }
};

/**
 * Verify OTP and login
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @returns {Object} User data and token
 */
const verifyLoginOTP = async (email, otp) => {
  try {
    // Find valid OTP
    const otpRecord = await OTP.findValidOTP(email, otp, 'login');
    if (!otpRecord) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }

    // Delete the OTP record after successful verification
    // This is more secure than just marking as used and helps with database cleanup
    await OTP.findByIdAndDelete(otpRecord._id);

    // Get user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.isActive) {
      throw new ApiError(400, 'Account is deactivated');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return user data without password
    const userResponse = user.getPublicProfile();

    logger.info(`User logged in with OTP: ${user.email}`);

    return {
      user: userResponse,
      token,
      refreshToken
    };
  } catch (error) {
    logger.error('Verify login OTP error:', error.message);
    throw error;
  }
};

/**
 * Send OTP for registration
 * @param {string} email - User email
 * @returns {Object} Success message
 */
const sendRegistrationOTP = async (email) => {
  try {
    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'Email already exists');
    }

    // Generate OTP
    const otp = OTP.generateOTP();

    // Invalidate any existing OTPs for this email
    await OTP.invalidateOTPs(email, 'registration');

    // Create new OTP
    const otpRecord = new OTP({
      email: email.toLowerCase(),
      otp,
      type: 'registration'
    });
    await otpRecord.save();

    // Send OTP email
    await emailService.sendOTPEmail(email, otp, 'registration');

    logger.info(`Registration OTP sent to ${email}`);

    return {
      message: 'OTP sent successfully',
      email: email
    };
  } catch (error) {
    logger.error('Send registration OTP error:', error.message);
    throw error;
  }
};

/**
 * Register user with OTP verification
 * @param {Object} userData - User registration data
 * @param {string} otp - OTP code
 * @returns {Object} Created user and token
 */
const registerWithOTP = async (userData, otp) => {
  try {
    // Verify OTP
    const otpRecord = await OTP.findValidOTP(userData.email, otp, 'registration');
    if (!otpRecord) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }

    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new ApiError(409, 'User already exists');
    }

    // Delete the OTP record after successful verification
    // This is more secure than just marking as used and helps with database cleanup
    await OTP.findByIdAndDelete(otpRecord._id);

    // Create new user
    const user = new User(userData);
    await user.save();

    // Send welcome email
    // await emailService.sendWelcomeEmail(user.email, user.firstName);

    // Generate token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return user data without password
    const userResponse = user.getPublicProfile();

    logger.info(`New user registered with OTP: ${user.email}`);

    return {
      user: userResponse,
      token,
      refreshToken
    };
  } catch (error) {
    logger.error('Register with OTP error:', error.message);
    throw error;
  }
};

/**
 * Delete a user's own account
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
const deleteAccount = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Prevent admin accounts from being deleted via this endpoint
    if (user.role === 'admin') {
      throw new ApiError(403, 'Admin accounts cannot be deleted.');
    }

    await User.findByIdAndDelete(userId);

    logger.info(`User account deleted: ${user.email}`);

    return true;
  } catch (error) {
    logger.error('Delete account error:', error.message);
    throw error;
  }
};

module.exports = {
  register,
  login,
  sendLoginOTP,
  verifyLoginOTP,
  sendRegistrationOTP,
  registerWithOTP,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  deleteUser,
  changePassword,
  getRefreshToken,
  deleteAccount,
  updateProfileImage
}; 