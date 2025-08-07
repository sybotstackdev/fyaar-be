const VisualPromptService = require('../services/visualPromptService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create a new visual prompt
 * POST /api/visual-prompts
 */
const createVisualPrompt = asyncHandler(async (req, res) => {
  const { name, description, plot, order } = req.body;

  const result = await VisualPromptService.createVisualPrompt({
    name,
    description,
    plot,
    order
  });

  return ApiResponse.created(res, 'Visual prompt created successfully', result);
});

/**
 * Get all visual prompts with pagination and filtering
 * GET /api/visual-prompts
 */
const getAllVisualPrompts = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, plot, isActive } = req.query;

  const result = await VisualPromptService.getAllVisualPrompts({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'order',
    order: order || 'asc',
    search: search || '',
    plot: plot || '',
    isActive: isActive || ''
  });

  return ApiResponse.success(res, 200, 'Visual prompts retrieved successfully', result);
});

/**
 * Get visual prompt by ID
 * GET /api/visual-prompts/:id
 */
const getVisualPromptById = asyncHandler(async (req, res) => {
  const visualPrompt = await VisualPromptService.getVisualPromptById(req.params.id);

  return ApiResponse.success(res, 200, 'Visual prompt retrieved successfully', visualPrompt);
});

/**
 * Get visual prompt by slug
 * GET /api/visual-prompts/slug/:slug
 */
const getVisualPromptBySlug = asyncHandler(async (req, res) => {
  const visualPrompt = await VisualPromptService.getVisualPromptBySlug(req.params.slug);

  return ApiResponse.success(res, 200, 'Visual prompt retrieved successfully', visualPrompt);
});

/**
 * Update visual prompt
 * PUT /api/visual-prompts/:id
 */
const updateVisualPrompt = asyncHandler(async (req, res) => {
  const updatedVisualPrompt = await VisualPromptService.updateVisualPrompt(req.params.id, req.body);

  return ApiResponse.success(res, 200, 'Visual prompt updated successfully', updatedVisualPrompt);
});

/**
 * Delete visual prompt
 * DELETE /api/visual-prompts/:id
 */
const deleteVisualPrompt = asyncHandler(async (req, res) => {
  await VisualPromptService.deleteVisualPrompt(req.params.id);

  return ApiResponse.success(res, 200, 'Visual prompt deleted successfully');
});

/**
 * Deactivate visual prompt (soft delete)
 * PATCH /api/visual-prompts/:id/deactivate
 */
const deactivateVisualPrompt = asyncHandler(async (req, res) => {
  const visualPrompt = await VisualPromptService.deactivateVisualPrompt(req.params.id);

  return ApiResponse.success(res, 200, 'Visual prompt deactivated successfully', visualPrompt);
});

/**
 * Reactivate visual prompt
 * PATCH /api/visual-prompts/:id/reactivate
 */
const reactivateVisualPrompt = asyncHandler(async (req, res) => {
  const visualPrompt = await VisualPromptService.reactivateVisualPrompt(req.params.id);

  return ApiResponse.success(res, 200, 'Visual prompt reactivated successfully', visualPrompt);
});

/**
 * Get visual prompts by plot
 * GET /api/visual-prompts/plot/:plotId
 */
const getVisualPromptsByPlot = asyncHandler(async (req, res) => {
  const visualPrompts = await VisualPromptService.getVisualPromptsByPlot(req.params.id);

  return ApiResponse.success(res, 200, 'Visual prompts retrieved successfully', visualPrompts);
});

/**
 * Reorder visual prompts for a plot
 * PUT /api/visual-prompts/plot/:plotId/reorder
 */
const reorderVisualPrompts = asyncHandler(async (req, res) => {
  const { visualPromptIds } = req.body;
  
  const visualPrompts = await VisualPromptService.reorderVisualPrompts(req.params.plotId, visualPromptIds);

  return ApiResponse.success(res, 200, 'Visual prompts reordered successfully', visualPrompts);
});

module.exports = {
  createVisualPrompt,
  getAllVisualPrompts,
  getVisualPromptById,
  getVisualPromptBySlug,
  updateVisualPrompt,
  deleteVisualPrompt,
  deactivateVisualPrompt,
  reactivateVisualPrompt,
  getVisualPromptsByPlot,
  reorderVisualPrompts
};
