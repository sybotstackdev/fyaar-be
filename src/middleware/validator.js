const { validationResult, body, param, query } = require('express-validator');

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
 * Validate user update data
 */
const validateUserUpdate = [
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
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
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
    .isLength({ min: 10, max: 1000 })
    .withMessage('Genre description must be between 10 and 1000 characters'),
  
  handleValidationErrors
];

/**
 * Validate spice mood creation/update data
 */
const validateSpiceMood = [
  body('comboName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Combo name must be between 2 and 100 characters'),
  
  body('moodSpiceBlend')
    .isArray({ min: 1 })
    .withMessage('Mood + Spice Blend must be an array with at least one item'),
  
  body('moodSpiceBlend.*')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each mood + spice blend item must be between 1 and 200 characters'),
  
  body('intensity')
    .isIn(['Low', 'Low–Med', 'Medium', 'High', 'Very High'])
    .withMessage('Intensity must be one of: Low, Low–Med, Medium, High, Very High'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
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
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
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
  validateUserUpdate,
  validateGenre,
  validateSpiceMood,
  validateNarrative,
  validateObjectId,
  validatePagination
}; 