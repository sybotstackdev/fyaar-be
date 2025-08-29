const AuthorService = require('../services/authorService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create a new author
 * POST /api/authors
 */
const createAuthor = asyncHandler(async (req, res) => {
  const { authorName, writingStyle, designStyle, genre } = req.body;

  const result = await AuthorService.createAuthor({
    authorName,
    writingStyle,
    designStyle,
    genre
  });

  return ApiResponse.created(res, 'Author created successfully', result);
});

/**
 * Get all authors with pagination and filtering
 * GET /api/authors
 */
const getAllAuthors = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, isActive, genre } = req.query;

  const result = await AuthorService.getAllAuthors({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc',
    search: search || '',
    genre: genre || '',
    isActive: isActive || ''
  });

  return ApiResponse.success(res, 200, 'Authors retrieved successfully', result);
});

/**
 * Get author by ID
 * GET /api/authors/:id
 */
const getAuthorById = asyncHandler(async (req, res) => {
  const author = await AuthorService.getAuthorById(req.params.id);

  return ApiResponse.success(res, 200, 'Author retrieved successfully', author);
});

/**
 * Update author
 * PUT /api/authors/:id
 */
const updateAuthor = asyncHandler(async (req, res) => {
  const updatedAuthor = await AuthorService.updateAuthor(req.params.id, req.body);

  return ApiResponse.success(res, 200, 'Author updated successfully', updatedAuthor);
});

/**
 * Delete author
 * DELETE /api/authors/:id
 */
const deleteAuthor = asyncHandler(async (req, res) => {
  await AuthorService.deleteAuthor(req.params.id);

  return ApiResponse.success(res, 200, 'Author deleted successfully');
});

/**
 * Deactivate author (soft delete)
 * PATCH /api/authors/:id/deactivate
 */
const deactivateAuthor = asyncHandler(async (req, res) => {
  const author = await AuthorService.deactivateAuthor(req.params.id);

  return ApiResponse.success(res, 200, 'Author deactivated successfully', author);
});

/**
 * Reactivate author
 * PATCH /api/authors/:id/reactivate
 */
const reactivateAuthor = asyncHandler(async (req, res) => {
  const author = await AuthorService.reactivateAuthor(req.params.id);

  return ApiResponse.success(res, 200, 'Author reactivated successfully', author);
});

module.exports = {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
  deactivateAuthor,
  reactivateAuthor
}; 