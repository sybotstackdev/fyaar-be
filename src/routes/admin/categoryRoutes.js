const express = require('express');
const router = express.Router();
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    reorderCategories,
    addBooksToCategory,
    removeBooksFromCategory
} = require('../../controllers/categoryController');
const {
    validateCategory,
    validateCategoryUpdate,
    validateCategoryReorder,
    validateBookManagement
} = require('../../middleware/validators/categoryValidator');
const { authenticate, authorize } = require('../../middleware/auth');
const { validateObjectId } = require('../../middleware/validator');

/**
 * @route   PUT /api/categories/order
 * @desc    Reorder all categories
 * @access  Private (Admin)
 */
router.put(
    '/order',
    authenticate,
    authorize('admin'),
    validateCategoryReorder,
    reorderCategories
);

// --- Routes for Managing Books within a Category ---

/**
 * @route   POST /api/categories/:id/books
 * @desc    Add one or more books to a category
 * @access  Private (Admin)
 */
router.post(
    '/:id/books',
    authenticate,
    authorize('admin'),
    validateObjectId,
    validateBookManagement,
    addBooksToCategory
);

/**
 * @route   DELETE /api/categories/:id/books
 * @desc    Remove one or more books from a category
 * @access  Private (Admin)
 */
router.delete(
    '/:id/books',
    authenticate,
    authorize('admin'),
    validateObjectId,
    validateBookManagement,
    removeBooksFromCategory
);


// --- Routes for Managing Categories Themselves ---

/**
 * @route   POST /api/categories
 * @desc    Create a new category and associate books
 * @access  Private (Admin)
 */
router.post(
    '/',
    authenticate,
    authorize('admin'),
    validateCategory,
    createCategory
);

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Private (Admin)
 */
router.get(
    '/',
    authenticate,
    authorize('admin'),
    getAllCategories
);

/**
 * @route   GET /api/admin/categories/:id
 * @desc    Get a single category by ID
 * @access  Private (Admin)
 */
router.get(
    '/:id',
    authenticate,
    authorize('admin'),
    validateObjectId,
    getCategoryById
);

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update a category's name
 * @access  Private (Admin)
 */
router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    validateObjectId,
    validateCategoryUpdate,
    updateCategory
);

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete a category permanently
 * @access  Private (Admin)
 */
router.delete(
    '/:id',
    authenticate,
    authorize('admin'),
    validateObjectId,
    deleteCategory
);


module.exports = router;
