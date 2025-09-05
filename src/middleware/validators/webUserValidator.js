const { body } = require('express-validator');

/**
 * Validate web user registration data
 */
const validateWebUserRegistration = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .notEmpty()
    .withMessage('Full name is required'),

  body('penName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Pen name cannot be more than 50 characters'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required'),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot be more than 20 characters'),

  body('ageGroup')
    .trim()
    .notEmpty()
    .withMessage('Age group is required'),

  body('languages')
    .isArray({ min: 1 })
    .withMessage('At least one language must be specified')
    .custom((languages) => {
      if (!Array.isArray(languages) || languages.length === 0) {
        throw new Error('Languages must be a non-empty array');
      }
      return true;
    }),

  body('socialLinks')
    .optional()
    .isArray()
    .withMessage('Social links must be an array'),

  body('experienceLevel')
    .trim()
    .notEmpty()
    .withMessage('Experience level is required'),

  body('publishedBefore')
    .trim()
    .notEmpty()
    .withMessage('Published before status is required'),

  body('sharedWork')
    .optional()
    .isArray()
    .withMessage('Shared work must be an array'),

  body('sharedWorkOther')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Other shared work description cannot be more than 200 characters')
    .custom((value, { req }) => {
      // If sharedWork includes 'other', then sharedWorkOther is required
      if (req.body.sharedWork && req.body.sharedWork.includes('other')) {
        if (!value || value.trim().length === 0) {
          throw new Error('Please specify other shared work details when "other" is selected');
        }
      }
      return true;
    }),

  body('wordCounts')
    .optional()
    .isArray()
    .withMessage('Word counts must be an array'),

  body('contentTypes')
    .isArray({ min: 1 })
    .withMessage('At least one content type must be specified')
    .custom((types) => {
      if (!Array.isArray(types) || types.length === 0) {
        throw new Error('Content types must be a non-empty array');
      }
      return true;
    }),

  body('contentTypesOther')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Other content types description cannot be more than 200 characters')
    .custom((value, { req }) => {
      // If contentTypes includes 'other', then contentTypesOther is required
      if (req.body.contentTypes && req.body.contentTypes.includes('other')) {
        if (!value || value.trim().length === 0) {
          throw new Error('Please specify other content types when "other" is selected');
        }
      }
      return true;
    }),

  body('genres')
    .isArray({ min: 1 })
    .withMessage('At least one genre must be specified')
    .custom((genres) => {
      if (!Array.isArray(genres) || genres.length === 0) {
        throw new Error('Genres must be a non-empty array');
      }
      return true;
    }),

  body('genresOther')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Other genres description cannot be more than 200 characters')
    .custom((value, { req }) => {
      // If genres includes 'other', then genresOther is required
      if (req.body.genres && req.body.genres.includes('other')) {
        if (!value || value.trim().length === 0) {
          throw new Error('Please specify other genres when "other" is selected');
        }
      }
      return true;
    }),

  body('readyContent')
    .trim()
    .notEmpty()
    .withMessage('Ready content status is required'),

  body('monthlyOutput')
    .trim()
    .notEmpty()
    .withMessage('Monthly output is required'),

  body('writingSample')
    .optional()
    .trim(),

  body('writingSampleFile')
    .optional()
    .trim(),

  body('motivation')
    .trim()
    .notEmpty()
    .withMessage('Motivation is required'),

  body('originalContent')
    .isBoolean()
    .withMessage('Original content agreement must be a boolean value')
    .custom((value) => {
      if (value !== true) {
        throw new Error('You must agree to create original content');
      }
      return true;
    }),

  body('agreeToReview')
    .isBoolean()
    .withMessage('Agreement to review must be a boolean value')
    .custom((value) => {
      if (value !== true) {
        throw new Error('You must agree to the review process');
      }
      return true;
    })
];

/**
 * Validate user status update
 */
const validateUserStatusUpdate = [
  body('status')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Status must be between 1 and 20 characters')
    .notEmpty()
    .withMessage('Status is required')
];

module.exports = {
  validateWebUserRegistration,
  validateUserStatusUpdate
};
