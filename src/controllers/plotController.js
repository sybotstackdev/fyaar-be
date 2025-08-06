const PlotService = require('../services/plotService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create a new plot
 * POST /api/plots
 */
const createPlot = asyncHandler(async (req, res) => {
  const { title, description, genre } = req.body;

  const result = await PlotService.createPlot({
    title,
    description,
    genre
  });

  return ApiResponse.created(res, 'Plot created successfully', result);
});

/**
 * Get all plots with pagination and filtering
 * GET /api/plots
 */
const getAllPlots = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, genre, isActive } = req.query;

  const result = await PlotService.getAllPlots({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc',
    search: search || '',
    genre: genre || '',
    isActive: isActive || ''
  });

  return ApiResponse.success(res, 200, 'Plots retrieved successfully', result);
});

/**
 * Get plot by ID
 * GET /api/plots/:id
 */
const getPlotById = asyncHandler(async (req, res) => {
  const plot = await PlotService.getPlotById(req.params.id);

  return ApiResponse.success(res, 200, 'Plot retrieved successfully', plot);
});

/**
 * Get plot by slug
 * GET /api/plots/slug/:slug
 */
const getPlotBySlug = asyncHandler(async (req, res) => {
  const plot = await PlotService.getPlotBySlug(req.params.slug);

  return ApiResponse.success(res, 200, 'Plot retrieved successfully', plot);
});

/**
 * Update plot
 * PUT /api/plots/:id
 */
const updatePlot = asyncHandler(async (req, res) => {
  const updatedPlot = await PlotService.updatePlot(req.params.id, req.body);

  return ApiResponse.success(res, 200, 'Plot updated successfully', updatedPlot);
});

/**
 * Delete plot
 * DELETE /api/plots/:id
 */
const deletePlot = asyncHandler(async (req, res) => {
  await PlotService.deletePlot(req.params.id);

  return ApiResponse.success(res, 200, 'Plot deleted successfully');
});

/**
 * Deactivate plot (soft delete)
 * PATCH /api/plots/:id/deactivate
 */
const deactivatePlot = asyncHandler(async (req, res) => {
  const plot = await PlotService.deactivatePlot(req.params.id);

  return ApiResponse.success(res, 200, 'Plot deactivated successfully', plot);
});

/**
 * Reactivate plot
 * PATCH /api/plots/:id/reactivate
 */
const reactivatePlot = asyncHandler(async (req, res) => {
  const plot = await PlotService.reactivatePlot(req.params.id);

  return ApiResponse.success(res, 200, 'Plot reactivated successfully', plot);
});

/**
 * Get plots by genre
 * GET /api/plots/genre/:genreId
 */
const getPlotsByGenre = asyncHandler(async (req, res) => {
  const plots = await PlotService.getPlotsByGenre(req.params.genreId);

  return ApiResponse.success(res, 200, 'Plots retrieved successfully', plots);
});

/**
 * Get plot with chapter count
 * GET /api/plots/:id/with-chapters
 */
const getPlotWithChapterCount = asyncHandler(async (req, res) => {
  const plot = await PlotService.getPlotWithChapterCount(req.params.id);

  return ApiResponse.success(res, 200, 'Plot retrieved successfully', plot);
});

module.exports = {
  createPlot,
  getAllPlots,
  getPlotById,
  getPlotBySlug,
  updatePlot,
  deletePlot,
  deactivatePlot,
  reactivatePlot,
  getPlotsByGenre,
  getPlotWithChapterCount
}; 