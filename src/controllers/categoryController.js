const CategoryService = require('../services/categoryService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Create a new category along with its associated books.
 * @route POST /api/categories
 * @access Private (Admin)
 */
const createCategory = asyncHandler(async (req, res) => {
    const { books, ...categoryData } = req.body;

    const newCategory = await CategoryService.createCategory(categoryData, books, req.user._id);

    return ApiResponse.created(res, 'Category created successfully', newCategory);
});

/**
 * Get all categories with pagination.
 * @route GET /api/categories
 * @access Admin
 */
const getAllCategories = asyncHandler(async (req, res) => {
    const { page, limit, sort, order, search } = req.query;
    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        sort: sort,
        order: order,
        search: search
    };
    const result = await CategoryService.getAllCategories(options);
    return ApiResponse.success(res, 200, 'Categories retrieved successfully', result);
});

/**
 * Get a single category by ID.
 * @route GET /api/admin/categories/:id
 * @access Admin
 */
const getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await CategoryService.getCategoryById(id);
    return ApiResponse.success(res, 200, 'Category retrieved successfully', category);
});

/**
 * Update a category by ID.
 * @route PUT /api/admin/categories/:id
 * @access Admin
 */
const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updatedCategory = await CategoryService.updateCategory(id, req.body);
    return ApiResponse.success(res, 200, 'Category updated successfully', updatedCategory);
});

/**
 * Delete a category by ID.
 * @route DELETE /api/admin/categories/:id
 * @access Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await CategoryService.deleteCategory(id);
    return ApiResponse.success(res, 200, 'Category deleted successfully', null);
});

/**
 * Reorder all categories.
 * @route PUT /api/categories/order
 * @access Admin
 */
const reorderCategories = asyncHandler(async (req, res) => {
    const { orderedIds } = req.body;
    const categories = await CategoryService.reorderCategories(orderedIds);
    return ApiResponse.success(res, 200, 'Categories reordered successfully', categories);
});

/**
 * Add books to a category.
 * @route POST /api/admin/categories/:id/books
 * @access Admin
 */
const addBooksToCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { bookIds } = req.body;
    const updatedCategory = await CategoryService.addBooksToCategory(id, bookIds);
    return ApiResponse.success(res, 200, 'Books added to category successfully', updatedCategory);
});

/**
 * Remove books from a category.
 * @route DELETE /api/admin/categories/:id/books
 * @access Admin
 */
const removeBooksFromCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { bookIds } = req.body;
    const updatedCategory = await CategoryService.removeBooksFromCategory(id, bookIds);
    return ApiResponse.success(res, 200, 'Books removed from category successfully', updatedCategory);
});


module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    reorderCategories,
    addBooksToCategory,
    removeBooksFromCategory
};
