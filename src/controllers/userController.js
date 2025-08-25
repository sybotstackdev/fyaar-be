const UserService = require('../services/userService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const result = await UserService.register({
    firstName,
    lastName,
    email,
    password
  });

  return ApiResponse.created(res, 'User registered successfully', result);
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await UserService.login(email, password);

  return ApiResponse.success(res, 200, 'Login successful', result);
});

/**
 * Send login OTP
 * POST /api/auth/send-login-otp
 */
const sendLoginOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await UserService.sendLoginOTP(email);

  return ApiResponse.success(res, 200, 'OTP sent successfully', result);
});

/**
 * Login with OTP
 * POST /api/auth/login-otp
 */
const loginWithOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const result = await UserService.verifyLoginOTP(email, otp);

  return ApiResponse.success(res, 200, 'Login successful', result);
});

/**
 * Send registration OTP
 * POST /api/auth/send-registration-otp
 */
const sendRegistrationOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await UserService.sendRegistrationOTP(email);

  return ApiResponse.success(res, 200, 'OTP sent successfully', result);
});

/**
 * Register with OTP
 * POST /api/auth/register
 */
const registerWithOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const result = await UserService.registerWithOTP({
    email,
  }, otp);

  return ApiResponse.created(res, 'User registered successfully', result);
});

/**
 * Get user profile
 * GET /api/auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await UserService.getProfile(req.user._id);

  return ApiResponse.success(res, 200, 'Profile retrieved successfully', user);
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await UserService.updateProfile(req.user._id, req.body);

  return ApiResponse.success(res, 200, 'Profile updated successfully', updatedUser);
});

/**
 * Get all users (admin only)
 * GET /api/users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, role } = req.query;

  const result = await UserService.getAllUsers({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc',
    search: search || '',
    role: role || ''
  });

  return ApiResponse.success(res, 200, 'Users retrieved successfully', result);
});

/**
 * Get user by ID (admin only)
 * GET /api/users/:id
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await UserService.getUserById(req.params.id);

  return ApiResponse.success(res, 200, 'User retrieved successfully', user);
});

/**
 * Update user by ID (admin only)
 * PUT /api/users/:id
 */
const updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await UserService.updateProfile(req.params.id, req.body);

  return ApiResponse.success(res, 200, 'User updated successfully', updatedUser);
});

/**
 * Delete user by ID (admin only)
 * DELETE /api/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  await UserService.deleteUser(req.params.id);

  return ApiResponse.success(res, 200, 'User deleted successfully');
});

/**
 * Change password
 * POST /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await UserService.changePassword(req.user._id, currentPassword, newPassword);

  return ApiResponse.success(res, 200, 'Password changed successfully');
});

/**
 * Get current user info
 * GET /api/auth/me
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await UserService.getProfile(req.user._id);

  return ApiResponse.success(res, 200, 'Current user retrieved successfully', user);
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  logger.info(`User logged out: ${req.user.email}`);

  return ApiResponse.success(res, 200, 'Logged out successfully');
});

/**
 * Refresh token (if needed)
 * POST /api/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const user = await UserService.getRefreshToken(req.body.refreshToken);

  return ApiResponse.success(res, 200, 'Token refreshed successfully', user);
});

/**
 * Delete a user's own account
 * DELETE /api/auth/profile
 */
const deleteAccount = asyncHandler(async (req, res) => {
  await UserService.deleteAccount(req.user._id);

  return ApiResponse.success(res, 200, 'Your account has been deleted successfully');
});

/**
 * Update user profile image
 * PUT /api/auth/profile/image
 */
const updateProfileImage = asyncHandler(async (req, res) => {
  const updatedUser = await UserService.updateProfileImage(req.user._id, req.file);

  return ApiResponse.success(res, 200, 'Profile image updated successfully', updatedUser);
});

module.exports = {
  register,
  login,
  sendLoginOTP,
  loginWithOTP,
  sendRegistrationOTP,
  registerWithOTP,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  getCurrentUser,
  logout,
  refreshToken,
  deleteAccount,
  updateProfileImage
}; 