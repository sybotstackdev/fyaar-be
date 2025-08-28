const SpiceLevelService = require('../services/spiceLevelService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create a new spice level setting (admin only)
 * POST /api/spice-levels
 */
const createSpiceLevel = asyncHandler(async (req, res) => {
  const { comboName, spiceBlend, intensity, description } = req.body;

  const spiceLevel = await SpiceLevelService.createSpiceLevel({
    comboName,
    spiceBlend,
    intensity,
    description
  });

  return ApiResponse.created(res, 'Spice level setting created successfully', spiceLevel);
});

/**
 * Get all spice level settings with pagination (admin only)
 * GET /api/spice-levels
 */
const getAllSpiceLevels = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, isActive, intensity } = req.query;

  const result = await SpiceLevelService.getAllSpiceLevels({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc',
    search: search || '',
    isActive: isActive || '',
    intensity: intensity || ''
  });

  return ApiResponse.success(res, 200, 'Spice level settings retrieved successfully', result);
});

/**
 * Get spice level by ID (admin only)
 * GET /api/spice-levels/:id
 */
const getSpiceLevelById = asyncHandler(async (req, res) => {
  const spiceLevel = await SpiceLevelService.getSpiceLevelById(req.params.id);

  return ApiResponse.success(res, 200, 'Spice level setting retrieved successfully', spiceLevel);
});

/**
 * Get spice level by slug (public)
 * GET /api/spice-levels/slug/:slug
 */
const getSpiceLevelBySlug = asyncHandler(async (req, res) => {
  const spiceLevel = await SpiceLevelService.getSpiceLevelBySlug(req.params.slug);

  return ApiResponse.success(res, 200, 'Spice level setting retrieved successfully', spiceLevel);
});

/**
 * Update spice level by ID (admin only)
 * PUT /api/spice-levels/:id
 */
const updateSpiceLevel = asyncHandler(async (req, res) => {
  const updatedSpiceLevel = await SpiceLevelService.updateSpiceLevel(req.params.id, req.body);

  return ApiResponse.success(res, 200, 'Spice level setting updated successfully', updatedSpiceLevel);
});

/**
 * Delete spice level by ID (admin only)
 * DELETE /api/spice-levels/:id
 */
const deleteSpiceLevel = asyncHandler(async (req, res) => {
  await SpiceLevelService.deleteSpiceLevel(req.params.id);

  return ApiResponse.success(res, 200, 'Spice level setting deleted successfully');
});

/**
 * Toggle spice level active status (admin only)
 * PATCH /api/spice-levels/:id/toggle
 */
const toggleSpiceLevelStatus = asyncHandler(async (req, res) => {
  const spiceLevel = await SpiceLevelService.getSpiceLevelById(req.params.id);
  
  const updatedSpiceLevel = await SpiceLevelService.updateSpiceLevel(req.params.id, {
    isActive: !spiceLevel.isActive
  });

  const status = updatedSpiceLevel.isActive ? 'activated' : 'deactivated';
  return ApiResponse.success(res, 200, `Spice level setting ${status} successfully`, updatedSpiceLevel);
});

module.exports = {
  createSpiceLevel,
  getAllSpiceLevels,
  getSpiceLevelById,
  getSpiceLevelBySlug,
  updateSpiceLevel,
  deleteSpiceLevel,
  toggleSpiceLevelStatus
}; 