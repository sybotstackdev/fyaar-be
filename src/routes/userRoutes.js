const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  getCurrentUser,
  logout,
  refreshToken
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');
const {
  validateRegistration,
  validateLogin,
  validateUserUpdate,
  validateObjectId,
  validatePagination
} = require('../middleware/validator');

const router = express.Router();

// Authentication routes
const authRoutes = express.Router();

// Register new user
authRoutes.post('/register', 
  authLimiter,
  validateRegistration,
  register
);

// Login user
authRoutes.post('/login', 
  authLimiter,
  validateLogin,
  login
);

// Get current user profile
authRoutes.get('/me', 
  authenticate,
  getCurrentUser
);

// Get user profile
authRoutes.get('/profile', 
  authenticate,
  getProfile
);

// Update user profile
authRoutes.put('/profile', 
  authenticate,
  validateUserUpdate,
  updateProfile
);

// Change password
authRoutes.post('/change-password', 
  authenticate,
  changePassword
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