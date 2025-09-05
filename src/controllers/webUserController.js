const WebUserService = require('../services/webUserService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

/**
 * Register a new web user
 * POST /api/web/register
 */
const register = asyncHandler(async (req, res) => {
  const userData = req.body;

  // If a file was uploaded, add the base64 file information to userData
  if (req.file) {
    userData.writingSampleFile = req.file.base64; // Store base64 string
    userData.fileInfo = {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      dataUrl: req.file.dataUrl // Full data URL for easy display
    };
  }

  const result = await WebUserService.register(userData);

  return ApiResponse.created(res, 'User registered successfully', {
    ...result,
    status: 'registered',
    fileUploaded: !!req.file
  });
});

/**
 * Check if email already exists
 * GET /api/web/check-email/:email
 */
const checkEmailExists = asyncHandler(async (req, res) => {
  const { email } = req.params;
  
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const exists = await WebUserService.emailExists(email);

  return ApiResponse.success(res, 200, 'Email check completed', {
    email,
    exists,
    status: exists ? 'taken' : 'available',
    message: exists ? 'Email already registered' : 'Email is available'
  });
});


/**
 * Get all registered users (Admin only)
 * GET /api/web/users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, status } = req.query;

  const result = await WebUserService.getAllUsers({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc',
    search: search || '',
    status: status || ''
  });

  return ApiResponse.success(res, 200, 'Users retrieved successfully', {
    ...result,
    status: 'success',
    totalCount: result.pagination.totalUsers
  });
});

/**
 * Get specific user by ID (Admin only)
 * GET /api/web/users/:id
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await WebUserService.getUserById(req.params.id);

  return ApiResponse.success(res, 200, 'User retrieved successfully', {
    ...user,
    status: 'found'
  });
});

/**
 * Update user registration status (Admin only)
 * PUT /api/web/users/:id/status
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, 'Status is required');
  }

  const updatedUser = await WebUserService.updateUserStatus(req.params.id, status);

  return ApiResponse.success(res, 200, 'User status updated successfully', {
    ...updatedUser,
    status: 'updated',
    newStatus: status
  });
});

/**
 * Update user data (Admin only)
 * PUT /api/web/users/:id
 */
const updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await WebUserService.updateUser(req.params.id, req.body);

  return ApiResponse.success(res, 200, 'User updated successfully', {
    ...updatedUser,
    status: 'updated'
  });
});

/**
 * Delete user (Admin only)
 * DELETE /api/web/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  await WebUserService.deleteUser(req.params.id);

  return ApiResponse.success(res, 200, 'User deleted successfully', {
    status: 'deleted',
    userId: req.params.id
  });
});

/**
 * Get users by status (Admin only)
 * GET /api/web/users/status/:status
 */
const getUsersByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const { page, limit, sort, order } = req.query;

  const users = await WebUserService.getUsersByStatus(status, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc'
  });

  return ApiResponse.success(res, 200, `Users with status '${status}' retrieved successfully`, {
    users,
    status: 'success',
    filterStatus: status,
    count: users.length
  });
});

/**
 * Get registration statistics (Admin only)
 * GET /api/web/users/stats
 */
const getRegistrationStats = asyncHandler(async (req, res) => {
  const stats = await WebUserService.getRegistrationStats();

  return ApiResponse.success(res, 200, 'Registration statistics retrieved successfully', {
    ...stats,
    status: 'success',
    generatedAt: new Date().toISOString()
  });
});

module.exports = {
  register,
  checkEmailExists,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUser,
  deleteUser,
  getUsersByStatus,
  getRegistrationStats
};
