const { validationResult, body, param, query } = require('express-validator');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Validate user registration data
 */
const validateRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  handleValidationErrors
];

/**
 * Validate user login data
 */
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

/**
 * Validate send OTP data
 */
const validateSendOTP = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  handleValidationErrors
];

/**
 * Validate OTP verification data
 */
const validateOTPVerification = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),

  handleValidationErrors
];

/**
 * Validate registration with OTP data
 */
const validateRegistrationWithOTP = [

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),

  handleValidationErrors
];

/**
 * Validate user update data
 */
const validateUserUpdate = [
  // Check that at least one field is being updated
  body().custom((value, { req }) => {
    const allowedFields = ['firstName', 'lastName', 'bio', 'favAuthors', 'favGenres'];
    const bodyKeys = Object.keys(req.body);
    if (bodyKeys.length === 0 || !bodyKeys.some(key => allowedFields.includes(key))) {
      throw new ApiError(400, 'At least one valid field is required for update');
    }
    return true;
  }),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage('Bio cannot be more than 250 characters'),

  body('favAuthors')
    .optional()
    .isArray()
    .withMessage('Favorite authors must be an array')
    .custom((value) => {
      if (!value.every(mongoose.Types.ObjectId.isValid)) {
        throw new Error('Invalid author ID in favorite authors');
      }
      return true;
    }),

  body('favGenres')
    .optional()
    .isArray()
    .withMessage('Favorite genres must be an array')
    .custom((value) => {
      if (!value.every(mongoose.Types.ObjectId.isValid)) {
        throw new Error('Invalid genre ID in favorite genres');
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validate genre creation/update data
 */
const validateGenre = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Genre title must be between 2 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Genre description must be between 10 and 5000 characters'),

  handleValidationErrors
];

/**
 * Validate spice mood creation/update data
 */
const validateSpiceLevel = [
  body('comboName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Combo name must be between 2 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),

  handleValidationErrors
];

/**
 * Validate narrative creation/update data
 */
const validateNarrative = [
  body('optionLabel')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Option label must be between 2 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),

  handleValidationErrors
];

/**
 * Validate ending creation/update data
 */
const validateEnding = [
  body('optionLabel')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Option label must be between 2 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),

  handleValidationErrors
];

/**
 * Validate tag creation/update data
 */
const validateTag = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  handleValidationErrors
];

/**
 * Validate location creation/update data
 */
const validateLocation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location name must be between 2 and 100 characters'),

  body('category')
    .isIn(['tier1-cities', 'tier2-cities', 'vacation-travel', 'international', 'speculative-fantasy'])
    .withMessage('Category must be one of: tier1-cities, tier2-cities, vacation-travel, international, speculative-fantasy'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Location description must be between 10 and 1000 characters'),

  body('country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),

  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),

  handleValidationErrors
];

/**
 * Validate author creation/update data
 */
const validateAuthor = [
  body('authorName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Author name must be between 2 and 100 characters'),

  body('writingStyle')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Writing style must be between 10 and 1000 characters'),

  body('designStyle')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Design style must be between 10 and 1000 characters'),

  body('penName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Pen name must be between 2 and 100 characters'),

  handleValidationErrors
];

/**
 * Validate instruction creation/update data
 */
const validateInstruction = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Instruction name must be between 2 and 100 characters'),

  body('instructions')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Instructions must be between 10 and 5000 characters'),

  handleValidationErrors
];

/**
 * Validate plot creation/update data
 */
const validatePlot = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Plot title must be between 2 and 200 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Plot description must be between 10 and 5000 characters'),

  body('genre')
    .isMongoId()
    .withMessage('Genre must be a valid MongoDB ObjectId'),

  body('chapters')
    .optional()
    .isArray()
    .withMessage('Chapters must be an array'),

  handleValidationErrors
];

/**
 * Validate chapter creation/update data
 */
const validateChapter = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Chapter name must be between 2 and 200 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Chapter description must be between 10 and 2000 characters'),

  body('plot')
    .isMongoId()
    .withMessage('Plot must be a valid MongoDB ObjectId'),

  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Chapter order must be a positive integer'),

  handleValidationErrors
];

/**
 * Validate visual prompt creation/update data
 */
const validateVisualPrompt = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Visual prompt name must be between 2 and 200 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Visual prompt description must be between 10 and 2000 characters'),

  body('plot')
    .isMongoId()
    .withMessage('Plot must be a valid MongoDB ObjectId'),

  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Visual prompt order must be a positive integer'),

  handleValidationErrors
];

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),

  handleValidationErrors
];

/**
 * Validate pagination parameters
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateSendOTP,
  validateOTPVerification,
  validateRegistrationWithOTP,
  validateUserUpdate,
  validateGenre,
  validateSpiceLevel,
  validateNarrative,
  validateEnding,
  validateTag,
  validateLocation,
  validateAuthor,
  validateInstruction,
  validatePlot,
  validateChapter,
  validateVisualPrompt,
  validateObjectId,
  validatePagination
}; 