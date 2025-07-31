const GenreService = require('../services/genreService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create a new genre (admin only)
 * POST /api/genres
 */
const createGenre = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const genre = await GenreService.createGenre({
    title,
    description
  });

  return ApiResponse.created(res, 'Genre created successfully', genre);
});

/**
 * Get all genres with pagination (admin only)
 * GET /api/genres
 */
const getAllGenres = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, isActive } = req.query;

  const result = await GenreService.getAllGenres({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc',
    search: search || '',
    isActive: isActive || ''
  });

  return ApiResponse.success(res, 200, 'Genres retrieved successfully', result);
});

/**
 * Get active genres (public)
 * GET /api/genres/active
 */
const getActiveGenres = asyncHandler(async (req, res) => {
  const genres = await GenreService.getActiveGenres();

  return ApiResponse.success(res, 200, 'Active genres retrieved successfully', genres);
});

/**
 * Get genre by ID (admin only)
 * GET /api/genres/:id
 */
const getGenreById = asyncHandler(async (req, res) => {
  const genre = await GenreService.getGenreById(req.params.id);

  return ApiResponse.success(res, 200, 'Genre retrieved successfully', genre);
});

/**
 * Get genre by slug (public)
 * GET /api/genres/slug/:slug
 */
const getGenreBySlug = asyncHandler(async (req, res) => {
  const genre = await GenreService.getGenreBySlug(req.params.slug);

  return ApiResponse.success(res, 200, 'Genre retrieved successfully', genre);
});

/**
 * Update genre by ID (admin only)
 * PUT /api/genres/:id
 */
const updateGenre = asyncHandler(async (req, res) => {
  const updatedGenre = await GenreService.updateGenre(req.params.id, req.body);

  return ApiResponse.success(res, 200, 'Genre updated successfully', updatedGenre);
});

/**
 * Delete genre by ID (admin only)
 * DELETE /api/genres/:id
 */
const deleteGenre = asyncHandler(async (req, res) => {
  await GenreService.deleteGenre(req.params.id);

  return ApiResponse.success(res, 200, 'Genre deleted successfully');
});

/**
 * Toggle genre active status (admin only)
 * PATCH /api/genres/:id/toggle
 */
const toggleGenreStatus = asyncHandler(async (req, res) => {
  const genre = await GenreService.getGenreById(req.params.id);
  
  const updatedGenre = await GenreService.updateGenre(req.params.id, {
    isActive: !genre.isActive
  });

  const status = updatedGenre.isActive ? 'activated' : 'deactivated';
  return ApiResponse.success(res, 200, `Genre ${status} successfully`, updatedGenre);
});

module.exports = {
  createGenre,
  getAllGenres,
  getActiveGenres,
  getGenreById,
  getGenreBySlug,
  updateGenre,
  deleteGenre,
  toggleGenreStatus
}; 