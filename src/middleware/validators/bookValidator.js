const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../validator');

const wordCount = (str) => {
    if (!str) return 0;
    return str.trim().split(/\s+/).length;
};

const validateNewBook = [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required.')
        .custom(value => {
            const count = wordCount(value);
            if (count < 2) {
                throw new Error('Description must be at least 5 words.');
            }
            if (count > 500) {
                throw new Error('Description cannot exceed 500 words.');
            }
            return true;
        }),
    body('authors').isArray({ min: 1 }).withMessage('At least one author is required.'),
    body('tags').isArray({ min: 1 }).withMessage('At least one tag is required.'),
    body('bookCover').trim().notEmpty().withMessage('Book cover is required.'),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status.'),
    body('chapters').optional().isArray().withMessage('Chapters must be an array.'),
    body('chapters.*.title').optional().trim().notEmpty().withMessage('Chapter title is required.'),
    body('chapters.*.content').optional().trim().notEmpty().withMessage('Chapter content is required.')
        .custom(value => {
            const count = wordCount(value);
            if (count < 5) {
                throw new Error('Chapter content must be at least 5 words.');
            }
            if (count > 5000) {
                throw new Error('Chapter content cannot exceed 5000 words.');
            }
            return true;
        }),
    handleValidationErrors
];

const validateUpdateBook = [
    body('title').optional().trim().notEmpty().withMessage('Title is required.'),
    body('description').optional()
        .trim()
        .notEmpty().withMessage('Description is required.')
        .custom(value => {
            const count = wordCount(value);
            if (count < 2) {
                throw new Error('Description must be at least 2 words.');
            }
            if (count > 1000) {
                throw new Error('Description cannot exceed 1000 words.');
            }
            return true;
        }),
    body('authors').optional().isArray({ min: 1 }).withMessage('At least one author is required.'),
    body('tags').optional().isArray({ min: 1 }).withMessage('At least one tag is required.'),
    body('genre').optional().trim().notEmpty().withMessage('Genre is required.'),
    body('plot').optional().trim().notEmpty().withMessage('Plot is required.'),
    body('spiceMood').optional().trim().notEmpty().withMessage('Spice & Mood is required.'),
    body('ending').optional().trim().notEmpty().withMessage('Ending is required.'),
    body('bookCover').optional().trim().notEmpty().withMessage('Book cover is required.'),
    body('status').optional().isIn(['draft', 'published', 'unpublished']).withMessage('Invalid status.'),
    handleValidationErrors
];

const validateNewChapter = [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('content')
        .trim()
        .notEmpty().withMessage('Content is required.')
        .custom(value => {
            const count = wordCount(value);
            if (count < 5) {
                throw new Error('Content must be at least 5 words.');
            }
            if (count > 5000) {
                throw new Error('Content cannot exceed 5000 words.');
            }
            return true;
        }),
    body('book').isMongoId().withMessage('Valid book ID is required.'),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status.'),
    handleValidationErrors
];

const validateUpdateChapter = [
    param('id').isMongoId().withMessage('Invalid chapter ID.'),
    body('title').optional().trim().notEmpty().withMessage('Title is required.'),
    body('content').optional()
        .trim()
        .notEmpty().withMessage('Content is required.')
        .custom(value => {
            const count = wordCount(value);
            if (count < 5) {
                throw new Error('Content must be at least 5 words.');
            }
            if (count > 5000) {
                throw new Error('Content cannot exceed 5000 words.');
            }
            return true;
        }),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status.'),
    handleValidationErrors
];

module.exports = {
    validateNewBook,
    validateUpdateBook,
    validateNewChapter,
    validateUpdateChapter
};