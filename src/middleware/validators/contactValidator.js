const { body, param, query } = require('express-validator');

/**
 * Validation rules for contact form submission
 */
const validateContactSubmission = [
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

/**
 * Validation rules for contact status update
 */
const validateContactStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['new', 'read', 'replied', 'archived'])
    .withMessage('Status must be one of: new, read, replied, archived')
];

/**
 * Validation rules for contact ID parameter
 */
const validateContactId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid contact ID format')
];

/**
 * Validation rules for status parameter
 */
const validateStatusParam = [
  param('status')
    .isIn(['new', 'read', 'replied', 'archived'])
    .withMessage('Status must be one of: new, read, replied, archived')
];

/**
 * Validation rules for pagination query parameters
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

  query('sort')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'fullName', 'email', 'status', 'priority'])
    .withMessage('Sort field must be one of: createdAt, updatedAt, fullName, email, status, priority'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc'),

  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),

  query('status')
    .optional()
    .isIn(['new', 'read', 'replied', 'archived'])
    .withMessage('Status filter must be one of: new, read, replied, archived'),

  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority filter must be one of: low, medium, high')
];

module.exports = {
  validateContactSubmission,
  validateContactStatusUpdate,
  validateContactId,
  validateStatusParam,
  validatePagination
};
