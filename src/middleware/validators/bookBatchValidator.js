const { body } = require('express-validator');
const { handleValidationErrors } = require('../validator');

const createBookBatchSchema = [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('books').isArray({ min: 1 }).withMessage('Books must be an array with at least one item.'),
    body('books.*.authors').isArray({ min: 1 }).withMessage('Each book must have at least one author.'),
    body('books.*.genres').isArray({ min: 1 }).withMessage('Each book must have at least one genre.'),
    body('books.*.plots').isArray({ min: 1 }).withMessage('Each book must have at least one plot.'),
    body('books.*.narratives').isArray({ min: 1 }).withMessage('Narratives must be an array.'),
    body('books.*.locations').isArray({ min: 1 }).withMessage('Locations must be an array.'),
    body('books.*.spiceLevels').isArray({ min: 1 }).withMessage('Spice levels must be an array.'),
    body('books.*.endings').isArray({ min: 1 }).withMessage('Endings must be an array.'),
    handleValidationErrors
];

module.exports = {
    createBookBatchSchema
};
