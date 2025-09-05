const WebUser = require('../models/webUserModel');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Register a new web user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user data
 */
const register = async (userData) => {
  try {
    // Check if email already exists
    const existingUser = await WebUser.findByEmail(userData.email);
    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    // Create new user
    const user = new WebUser(userData);
    await user.save();

    logger.info(`New web user registered: ${user.email}`);

    return user.getPublicProfile();
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, 'Email already registered');
    }
    throw error;
  }
};

/**
 * Get all registered users with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Users data with pagination info
 */
const getAllUsers = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc',
    search = '',
    status = ''
  } = options;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  // Build query
  const query = {};
  
  if (status) {
    query.registrationStatus = status;
  }
  
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { penName: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute query
  const [users, total] = await Promise.all([
    WebUser.find(query)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    WebUser.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalUsers: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      startIndex: skip + 1,
      endIndex: Math.min(skip + limit, total),
      showing: `${skip + 1}-${Math.min(skip + limit, total)} of ${total}`
    }
  };
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 */
const getUserById = async (userId) => {
  const user = await WebUser.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user.getPublicProfile();
};

/**
 * Update user registration status
 * @param {string} userId - User ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated user data
 */
const updateUserStatus = async (userId, status) => {
  // Status validation removed - accept any string value

  const user = await WebUser.findByIdAndUpdate(
    userId,
    { registrationStatus: status },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  logger.info(`User ${user.email} status updated to: ${status}`);

  return user.getPublicProfile();
};

/**
 * Update user data
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user data
 */
const updateUser = async (userId, updateData) => {
  const user = await WebUser.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user.getPublicProfile();
};

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const deleteUser = async (userId) => {
  const user = await WebUser.findByIdAndDelete(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  logger.info(`User deleted: ${user.email}`);
};

/**
 * Get users by status with pagination
 * @param {string} status - Registration status
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Users data with pagination info
 */
const getUsersByStatus = async (status, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc'
  } = options;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  // Build query
  const query = { registrationStatus: status };

  // Execute query with pagination
  const [users, total] = await Promise.all([
    WebUser.find(query)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    WebUser.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    users: users.map(user => {
      // Create a public profile for each user
      const { _id, fullName, email, penName, ageGroup, languages, experienceLevel, 
              publishedBefore, contentTypes, genres, readyContent, monthlyOutput, 
              registrationStatus, createdAt, updatedAt } = user;
      return {
        _id,
        fullName,
        email,
        penName,
        ageGroup,
        languages,
        experienceLevel,
        publishedBefore,
        contentTypes,
        genres,
        readyContent,
        monthlyOutput,
        registrationStatus,
        createdAt,
        updatedAt
      };
    }),
    pagination: {
      currentPage: page,
      totalPages,
      totalUsers: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      startIndex: skip + 1,
      endIndex: Math.min(skip + limit, total),
      showing: `${skip + 1}-${Math.min(skip + limit, total)} of ${total}`
    }
  };
};

/**
 * Check if email exists
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if email exists
 */
const emailExists = async (email) => {
  const exists = await WebUser.emailExists(email);
  return exists;
};

/**
 * Get registration statistics
 * @returns {Promise<Object>} Statistics data
 */
const getRegistrationStats = async () => {
  const stats = await WebUser.aggregate([
    {
      $group: {
        _id: '$registrationStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalUsers = await WebUser.countDocuments();
  
  const statusCounts = {
    pending: 0,
    approved: 0,
    rejected: 0,
    under_review: 0
  };

  stats.forEach(stat => {
    statusCounts[stat._id] = stat.count;
  });

  return {
    totalUsers,
    statusCounts,
    approvalRate: totalUsers > 0 ? (statusCounts.approved / totalUsers * 100).toFixed(2) : 0
  };
};

module.exports = {
  register,
  emailExists,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUser,
  deleteUser,
  getUsersByStatus,
  getRegistrationStats
};
