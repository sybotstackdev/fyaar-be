const { body } = require('express-validator');
const { handleValidationErrors } = require('../validator');

const validateNewBook = [
    body('title')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Book title must be between 2 and 200 characters'),

    body('description')
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Book description must be between 10 and 5000 characters'),

    body('authors')
        .isArray({ min: 1 })
        .withMessage('At least one author is required'),
    body('authors.*')
        .isMongoId()
        .withMessage('Each author must be a valid ID'),

    body('tags')
        .isArray({ min: 1 })
        .withMessage('At least one tag is required'),
    body('tags.*')
        .isMongoId()
        .withMessage('Each tag must be a valid ID'),

    body('chapters')
        .optional()
        .isArray({ min: 1 }).withMessage('If provided, chapters must be an array with at least one item.'),
    body('chapters.*.title')
        .exists({ checkFalsy: true }).withMessage('Each chapter must have a title.')
        .isString().withMessage('Chapter title must be a string.')
        .isLength({ min: 3 }).withMessage('Chapter title must be at least 3 characters.'),
    body('chapters.*.content')
        .exists({ checkFalsy: true }).withMessage('Each chapter must have content.')
        .isString().withMessage('Chapter content must be a string.')
        .isLength({ min: 10 }).withMessage('Chapter content must be at least 10 characters.'),

    body('bookCover')
        .trim()
        .isURL()
        .withMessage('Book cover must be a valid URL'),

    body('genres')
        .optional()
        .isArray()
        .withMessage('Genres must be an array of IDs'),
    body('genres.*')
        .isMongoId()
        .withMessage('Each genre must be a valid ID'),

    body('plots')
        .optional()
        .isArray()
        .withMessage('Plots must be an array of IDs'),
    body('plots.*')
        .isMongoId()
        .withMessage('Each plot must be a valid ID'),

    body('narrative')
        .optional()
        .isArray()
        .withMessage('Narrative must be an array of IDs'),
    body('narrative.*')
        .isMongoId()
        .withMessage('Each narrative must be a valid ID'),

    body('endings')
        .optional()
        .isArray()
        .withMessage('Endings must be an array of IDs'),
    body('endings.*')
        .isMongoId()
        .withMessage('Each ending must be a valid ID'),

    body('spiceMoods')
        .optional()
        .isArray()
        .withMessage('Spice moods must be an array of IDs'),
    body('spiceMoods.*')
        .isMongoId()
        .withMessage('Each spice mood must be a valid ID'),

    body('locations')
        .optional()
        .isArray()
        .withMessage('Locations must be an array of IDs'),
    body('locations.*')
        .isMongoId()
        .withMessage('Each location must be a valid ID'),

    body('status')
        .optional()
        .isIn(['draft', 'published', 'archived'])
        .withMessage('Status must be one of: draft, published, archived'),

    handleValidationErrors
];


const validateUpdateBook = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Book title must be between 2 and 200 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Book description must be between 10 and 5000 characters'),
    body('authors')
        .optional()
        .isArray({ min: 1 })
        .withMessage('At least one author is required'),
    body('authors.*')
        .isMongoId()
        .withMessage('Each author must be a valid ID'),

    body('tags')
        .optional()
        .isArray({ min: 1 })
        .withMessage('At least one tag is required'),
    body('tags.*')
        .isMongoId()
        .withMessage('Each tag must be a valid ID'),

    body('bookCover')
        .optional()
        .trim()
        .isURL()
        .withMessage('Book cover must be a valid URL'),

    body('genres')
        .optional()
        .isArray()
        .withMessage('Genres must be an array of IDs'),
    body('genres.*')
        .isMongoId()
        .withMessage('Each genre must be a valid ID'),

    body('plots')
        .optional()
        .isArray()
        .withMessage('Plots must be an array of IDs'),
    body('plots.*')
        .isMongoId()
        .withMessage('Each plot must be a valid ID'),

    body('narrative')
        .optional()
        .isArray()
        .withMessage('Narrative must be an array of IDs'),
    body('narrative.*')
        .isMongoId()
        .withMessage('Each narrative must be a valid ID'),

    body('endings')
        .optional()
        .isArray()
        .withMessage('Endings must be an array of IDs'),
    body('endings.*')
        .isMongoId()
        .withMessage('Each ending must be a valid ID'),

    body('spiceMoods')
        .optional()
        .isArray()
        .withMessage('Spice moods must be an array of IDs'),
    body('spiceMoods.*')
        .isMongoId()
        .withMessage('Each spice mood must be a valid ID'),

    body('locations')
        .optional()
        .isArray()
        .withMessage('Locations must be an array of IDs'),
    body('locations.*')
        .isMongoId()
        .withMessage('Each location must be a valid ID'),

    body('status')
        .optional()
        .isIn(['draft', 'published', 'archived'])
        .withMessage('Status must be one of: draft, published, archived'),

    handleValidationErrors
];


const validateNewChapter = [
    body('book').isMongoId().withMessage('Book must be a valid MongoDB ObjectId'),
    body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Chapter title must be between 2 and 200 characters'),
    body('content').trim().isLength({ min: 10 }).withMessage('Chapter content must be at least 10 characters'),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be one of: draft, published'),
    handleValidationErrors
];

const validateUpdateChapter = [
    body('book').optional().isMongoId().withMessage('Book must be a valid MongoDB ObjectId'),
    body('title').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Chapter title must be between 2 and 200 characters'),
    body('content').optional().trim().isLength({ min: 10 }).withMessage('Chapter content must be at least 10 characters'),
    body('order').optional().isInt({ min: 1 }).withMessage('Chapter order must be a positive integer'),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be one of: draft, published'),
    handleValidationErrors
];

module.exports = {
    validateNewBook,
    validateUpdateBook,
    validateNewChapter,
    validateUpdateChapter
};