const express = require('express');
const {
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
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');
const {
  validateSendOTP,
  validateOTPVerification,
  validateRegistrationWithOTP,
  validateUserUpdate,
  validateObjectId,
  validatePagination
} = require('../middleware/validator');

// Authentication routes
const authRoutes = express.Router();

// Send login OTP
authRoutes.post('/send-login-otp',
  authLimiter,
  validateSendOTP,
  sendLoginOTP
);

// Login with OTP
authRoutes.post('/login-otp',
  authLimiter,
  validateOTPVerification,
  loginWithOTP
);

// Send registration OTP
authRoutes.post('/register',
  authLimiter,
  validateSendOTP,
  sendRegistrationOTP
);

// Register with OTP
authRoutes.post('/register/verify',
  authLimiter,
  validateRegistrationWithOTP,
  registerWithOTP
);

// Get current user profile
authRoutes.get('/me',
  authenticate,
  getCurrentUser
);

// Update user profile
authRoutes.put('/profile',
  authenticate,
  validateUserUpdate,
  updateProfile
);

// Update profile image
authRoutes.put('/profile/image',
  authenticate,
  upload.single('profileImage'), // 'profileImage' is the field name for the file
  updateProfileImage
);

// Delete user account
authRoutes.delete('/profile',
  authenticate,
  deleteAccount
);

// Logout
authRoutes.post('/logout',
  authenticate,
  logout
);

// Refresh token
authRoutes.post('/refresh',
  refreshToken
);

// User management routes (admin only)
const userRoutes = express.Router();

// Get all users
userRoutes.get('/',
  authenticate,
  authorize('admin'),
  validatePagination,
  getAllUsers
);

// Get user by ID
userRoutes.get('/:id',
  authenticate,
  authorize('admin'),
  validateObjectId,
  getUserById
);

// Update user by ID
userRoutes.put('/:id',
  authenticate,
  authorize('admin'),
  validateObjectId,
  validateUserUpdate,
  updateUser
);

// Delete user by ID
userRoutes.delete('/:id',
  authenticate,
  authorize('admin'),
  validateObjectId,
  deleteUser
);

module.exports = {
  authRoutes,
  userRoutes
}; 