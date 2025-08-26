const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../validator');
const mongoose = require('mongoose');

const validateCategory = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Category name must be between 2 and 100 characters.'),

    body('tags')
        .isArray({ min: 1 }).withMessage('Tags must be an array with at least one element.'),

    body('tags.*')
        .isMongoId()
        .withMessage('Each ID in tags must be a valid MongoDB ObjectId.'),

    body('genres')
        .isArray({ min: 1 }).withMessage('Genres must be an array with at least one element.'),

    body('genres.*')
        .isMongoId()
        .withMessage('Each ID in genres must be a valid MongoDB ObjectId.'),

    body('books')
        .isArray({ min: 1 }).withMessage('Books must be an array with at least one element.'),

    body('books.*')
        .isMongoId()
        .withMessage('Each ID in books must be a valid MongoDB ObjectId.'),

    handleValidationErrors
];

const validateParamId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid category ID in URL parameter.'),
    
    handleValidationErrors
];

const validateCategoryUpdate = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Category name must be between 2 and 100 characters.'),

    handleValidationErrors
];

const validateCategoryReorder = [
    body('orderedIds')
        .isArray({ min: 1 })
        .withMessage('orderedIds must be an array with at least one element.'),
    body('orderedIds.*')
        .isMongoId()
        .withMessage('Each ID in orderedIds must be a valid MongoDB ObjectId.'),

    handleValidationErrors
];

const validateBookManagement = [
    body('bookIds')
        .isArray({ min: 1 })
        .withMessage('bookIds must be an array with at least one element.'),
    body('bookIds.*')
        .isMongoId()
        .withMessage('Each ID in bookIds must be a valid MongoDB ObjectId.'),

    handleValidationErrors
];

module.exports = {
    validateCategory,
    validateCategoryUpdate,
    validateParamId,
    validateCategoryReorder,
    validateBookManagement
};
