const SpiceMoodService = require('../services/spiceMoodService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create a new spice mood setting (admin only)
 * POST /api/spice-moods
 */
const createSpiceMood = asyncHandler(async (req, res) => {
  const { comboName, moodSpiceBlend, intensity, description } = req.body;

  const spiceMood = await SpiceMoodService.createSpiceMood({
    comboName,
    moodSpiceBlend,
    intensity,
    description
  });

  return ApiResponse.created(res, 'Spice mood setting created successfully', spiceMood);
});

/**
 * Get all spice mood settings with pagination (admin only)
 * GET /api/spice-moods
 */
const getAllSpiceMoods = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, isActive, intensity } = req.query;

  const result = await SpiceMoodService.getAllSpiceMoods({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc',
    search: search || '',
    isActive: isActive || '',
    intensity: intensity || ''
  });

  return ApiResponse.success(res, 200, 'Spice mood settings retrieved successfully', result);
});

/**
 * Get spice mood by ID (admin only)
 * GET /api/spice-moods/:id
 */
const getSpiceMoodById = asyncHandler(async (req, res) => {
  const spiceMood = await SpiceMoodService.getSpiceMoodById(req.params.id);

  return ApiResponse.success(res, 200, 'Spice mood setting retrieved successfully', spiceMood);
});

/**
 * Get spice mood by slug (public)
 * GET /api/spice-moods/slug/:slug
 */
const getSpiceMoodBySlug = asyncHandler(async (req, res) => {
  const spiceMood = await SpiceMoodService.getSpiceMoodBySlug(req.params.slug);

  return ApiResponse.success(res, 200, 'Spice mood setting retrieved successfully', spiceMood);
});

/**
 * Update spice mood by ID (admin only)
 * PUT /api/spice-moods/:id
 */
const updateSpiceMood = asyncHandler(async (req, res) => {
  const updatedSpiceMood = await SpiceMoodService.updateSpiceMood(req.params.id, req.body);

  return ApiResponse.success(res, 200, 'Spice mood setting updated successfully', updatedSpiceMood);
});

/**
 * Delete spice mood by ID (admin only)
 * DELETE /api/spice-moods/:id
 */
const deleteSpiceMood = asyncHandler(async (req, res) => {
  await SpiceMoodService.deleteSpiceMood(req.params.id);

  return ApiResponse.success(res, 200, 'Spice mood setting deleted successfully');
});

/**
 * Toggle spice mood active status (admin only)
 * PATCH /api/spice-moods/:id/toggle
 */
const toggleSpiceMoodStatus = asyncHandler(async (req, res) => {
  const spiceMood = await SpiceMoodService.getSpiceMoodById(req.params.id);
  
  const updatedSpiceMood = await SpiceMoodService.updateSpiceMood(req.params.id, {
    isActive: !spiceMood.isActive
  });

  const status = updatedSpiceMood.isActive ? 'activated' : 'deactivated';
  return ApiResponse.success(res, 200, `Spice mood setting ${status} successfully`, updatedSpiceMood);
});

module.exports = {
  createSpiceMood,
  getAllSpiceMoods,
  getSpiceMoodById,
  getSpiceMoodBySlug,
  updateSpiceMood,
  deleteSpiceMood,
  toggleSpiceMoodStatus
}; 