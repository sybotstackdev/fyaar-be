const EndingService = require('../services/endingService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create a new ending option (admin only)
 * POST /api/endings
 */
const createEnding = asyncHandler(async (req, res) => {
  const { optionLabel, description, isActive } = req.body;

  const ending = await EndingService.createEnding({
    optionLabel,
    description,
    isActive
  });

  return ApiResponse.created(res, 'Ending option created successfully', ending);
});

/**
 * Get all ending options with pagination (admin only)
 * GET /api/endings
 */
const getAllEndings = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, isActive } = req.query;

  const result = await EndingService.getAllEndings({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc',
    search: search || '',
    isActive: isActive || ''
  });

  return ApiResponse.success(res, 200, 'Ending options retrieved successfully', result);
});

/**
 * Get ending by ID (admin only)
 * GET /api/endings/:id
 */
const getEndingById = asyncHandler(async (req, res) => {
  const ending = await EndingService.getEndingById(req.params.id);

  return ApiResponse.success(res, 200, 'Ending option retrieved successfully', ending);
});

/**
 * Get ending by slug (public)
 * GET /api/endings/slug/:slug
 */
const getEndingBySlug = asyncHandler(async (req, res) => {
  const ending = await EndingService.getEndingBySlug(req.params.slug);

  return ApiResponse.success(res, 200, 'Ending option retrieved successfully', ending);
});

/**
 * Update ending by ID (admin only)
 * PUT /api/endings/:id
 */
const updateEnding = asyncHandler(async (req, res) => {
  const updatedEnding = await EndingService.updateEnding(req.params.id, req.body);

  return ApiResponse.success(res, 200, 'Ending option updated successfully', updatedEnding);
});

/**
 * Delete ending by ID (admin only)
 * DELETE /api/endings/:id
 */
const deleteEnding = asyncHandler(async (req, res) => {
  await EndingService.deleteEnding(req.params.id);

  return ApiResponse.success(res, 200, 'Ending option deleted successfully');
});

/**
 * Toggle ending active status (admin only)
 * PATCH /api/endings/:id/toggle
 */
const toggleEndingStatus = asyncHandler(async (req, res) => {
  const ending = await EndingService.getEndingById(req.params.id);
  
  const updatedEnding = await EndingService.updateEnding(req.params.id, {
    isActive: !ending.isActive
  });

  const status = updatedEnding.isActive ? 'activated' : 'deactivated';
  return ApiResponse.success(res, 200, `Ending option ${status} successfully`, updatedEnding);
});


module.exports = {
  createEnding,
  getAllEndings,
  getEndingById,
  getEndingBySlug,
  updateEnding,
  deleteEnding,
  toggleEndingStatus,
}; 