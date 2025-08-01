const NarrativeService = require('../services/narrativeService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create a new narrative option (admin only)
 * POST /api/narratives
 */
const createNarrative = asyncHandler(async (req, res) => {
  const { optionLabel, description } = req.body;

  const narrative = await NarrativeService.createNarrative({
    optionLabel,
    description
  });

  return ApiResponse.created(res, 'Narrative option created successfully', narrative);
});

/**
 * Get all narrative options with pagination (admin only)
 * GET /api/narratives
 */
const getAllNarratives = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, isActive } = req.query;

  const result = await NarrativeService.getAllNarratives({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc',
    search: search || '',
    isActive: isActive || ''
  });

  return ApiResponse.success(res, 200, 'Narrative options retrieved successfully', result);
});

/**
 * Get narrative by ID (admin only)
 * GET /api/narratives/:id
 */
const getNarrativeById = asyncHandler(async (req, res) => {
  const narrative = await NarrativeService.getNarrativeById(req.params.id);

  return ApiResponse.success(res, 200, 'Narrative option retrieved successfully', narrative);
});

/**
 * Get narrative by slug (public)
 * GET /api/narratives/slug/:slug
 */
const getNarrativeBySlug = asyncHandler(async (req, res) => {
  const narrative = await NarrativeService.getNarrativeBySlug(req.params.slug);

  return ApiResponse.success(res, 200, 'Narrative option retrieved successfully', narrative);
});

/**
 * Update narrative by ID (admin only)
 * PUT /api/narratives/:id
 */
const updateNarrative = asyncHandler(async (req, res) => {
  const updatedNarrative = await NarrativeService.updateNarrative(req.params.id, req.body);

  return ApiResponse.success(res, 200, 'Narrative option updated successfully', updatedNarrative);
});

/**
 * Delete narrative by ID (admin only)
 * DELETE /api/narratives/:id
 */
const deleteNarrative = asyncHandler(async (req, res) => {
  await NarrativeService.deleteNarrative(req.params.id);

  return ApiResponse.success(res, 200, 'Narrative option deleted successfully');
});

/**
 * Toggle narrative active status (admin only)
 * PATCH /api/narratives/:id/toggle
 */
const toggleNarrativeStatus = asyncHandler(async (req, res) => {
  const narrative = await NarrativeService.getNarrativeById(req.params.id);
  
  const updatedNarrative = await NarrativeService.updateNarrative(req.params.id, {
    isActive: !narrative.isActive
  });

  const status = updatedNarrative.isActive ? 'activated' : 'deactivated';
  return ApiResponse.success(res, 200, `Narrative option ${status} successfully`, updatedNarrative);
});


module.exports = {
  createNarrative,
  getAllNarratives,
  getNarrativeById,
  getNarrativeBySlug,
  updateNarrative,
  deleteNarrative,
  toggleNarrativeStatus,
}; 