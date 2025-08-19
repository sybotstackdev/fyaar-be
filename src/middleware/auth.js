const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');
const { asyncHandler } = require('./errorHandler');
const environment = require('../config/environment');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */

const authenticate = asyncHandler(async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, 'Access denied. No token provided.');
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return ApiResponse.unauthorized(res, 'Access denied. No token provided.');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return ApiResponse.unauthorized(res, 'Invalid token. User not found.');
    }

    if (!user.isActive) {
      return ApiResponse.forbidden(res, 'Account is deactivated.');
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    logger.error('Authentication error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'Invalid token.');
    }

    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token expired.');
    }

    return ApiResponse.internalError(res, 'Authentication failed.');
  }
});

/**
 * Optional authentication middleware
 * Similar to authenticate but doesn't return error if no token
 */
const softAuthenticate = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, environment.jwt.secret);
        const user = await User.findById(decoded.id);
        req.user = user;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
});

/**
 * Role-based authorization middleware
 * @param {string[]} roles - Array of allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, 'Insufficient permissions.');
    }

    next();
  };
};

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h'
    }
  );
};
/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Or longer, depending on your policy
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  authenticate,
  softAuthenticate,
  authorize,
  generateToken,
  verifyToken,
  generateRefreshToken
}; 