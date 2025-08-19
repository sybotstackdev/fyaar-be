const TagService = require('../services/tagService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create a new tag (admin only)
 * POST /api/tags
 */
const createTag = asyncHandler(async (req, res) => {
  const { name, isActive } = req.body;

  const tag = await TagService.createTag({
    name,
    isActive
  });

  return ApiResponse.created(res, 'Tag created successfully', tag);
});

/**
 * Get all tags with pagination (admin only)
 * GET /api/tags
 */
const getAllTags = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, isActive } = req.query;

  const result = await TagService.getAllTags({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc',
    search: search || '',
    isActive: isActive || ''
  });

  return ApiResponse.success(res, 200, 'Tags retrieved successfully', result);
});

/**
 * Get tag by ID (admin only)
 * GET /api/tags/:id
 */
const getTagById = asyncHandler(async (req, res) => {
  const tag = await TagService.getTagById(req.params.id);

  return ApiResponse.success(res, 200, 'Tag retrieved successfully', tag);
});

/**
 * Get tag by slug (public)
 * GET /api/tags/slug/:slug
 */
const getTagBySlug = asyncHandler(async (req, res) => {
  const tag = await TagService.getTagBySlug(req.params.slug);

  return ApiResponse.success(res, 200, 'Tag retrieved successfully', tag);
});

/**
 * Update tag by ID (admin only)
 * PUT /api/tags/:id
 */
const updateTag = asyncHandler(async (req, res) => {
  const updatedTag = await TagService.updateTag(req.params.id, req.body);

  return ApiResponse.success(res, 200, 'Tag updated successfully', updatedTag);
});

/**
 * Delete tag by ID (admin only)
 * DELETE /api/tags/:id
 */
const deleteTag = asyncHandler(async (req, res) => {
  await TagService.deleteTag(req.params.id);

  return ApiResponse.success(res, 200, 'Tag deleted successfully');
});

/**
 * Toggle tag active status (admin only)
 * PATCH /api/tags/:id/toggle
 */
const toggleTagStatus = asyncHandler(async (req, res) => {
  const tag = await TagService.getTagById(req.params.id);
  
  const updatedTag = await TagService.updateTag(req.params.id, {
    isActive: !tag.isActive
  });

  const status = updatedTag.isActive ? 'activated' : 'deactivated';
  return ApiResponse.success(res, 200, `Tag ${status} successfully`, updatedTag);
});


module.exports = {
  createTag,
  getAllTags,
  getTagById,
  getTagBySlug,
  updateTag,
  deleteTag,
  toggleTagStatus,
}; 