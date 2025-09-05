const express = require('express');
const {
  register,
  checkEmailExists,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUser,
  deleteUser,
  getUsersByStatus,
  getRegistrationStats
} = require('../controllers/webUserController');
const { authenticate, authorize } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { upload, convertToBase64 } = require('../middleware/writingSampleUpload');
const {
  validateObjectId,
  validatePagination
} = require('../middleware/validator');
const {
  validateWebUserRegistration,
  validateUserStatusUpdate
} = require('../middleware/validators/webUserValidator');

const router = express.Router();

// Public routes
// Check if email exists
router.get('/web/check-email/:email',
  authLimiter,
  checkEmailExists
);

// Register new user (with optional file upload)
router.post('/web/register',
  authLimiter,
  upload.single('writingSample'),
  convertToBase64,
  validateWebUserRegistration,
  register
);

// Admin only routes
// Get all users with pagination and filtering
router.get('/web/users',
  authenticate,
  authorize('admin'),
  validatePagination,
  getAllUsers
);

// Get user by ID
router.get('/web/users/:id',
  authenticate,
  authorize('admin'),
  validateObjectId,
  getUserById
);

// Update user registration status
router.put('/web/users/:id/status',
  authenticate,
  authorize('admin'),
  validateObjectId,
  validateUserStatusUpdate,
  updateUserStatus
);

// Update user data
router.put('/web/users/:id',
  authenticate,
  authorize('admin'),
  validateObjectId,
  updateUser
);

// Delete user
router.delete('/web/users/:id',
  authenticate,
  authorize('admin'),
  validateObjectId,
  deleteUser
);

// Get users by status
router.get('/web/users/status/:status',
  authenticate,
  authorize('admin'),
  validatePagination,
  getUsersByStatus
);

// Get registration statistics
router.get('/web/users/stats',
  authenticate,
  authorize('admin'),
  getRegistrationStats
);

module.exports = router;
