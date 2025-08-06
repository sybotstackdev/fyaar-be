const ChapterService = require('../services/chapterService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create a new chapter
 * POST /api/chapters
 */
const createChapter = asyncHandler(async (req, res) => {
  const { name, description, plot, order } = req.body;

  const result = await ChapterService.createChapter({
    name,
    description,
    plot,
    order
  });

  return ApiResponse.created(res, 'Chapter created successfully', result);
});

/**
 * Get all chapters with pagination and filtering
 * GET /api/chapters
 */
const getAllChapters = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, plot, isActive } = req.query;

  const result = await ChapterService.getAllChapters({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'order',
    order: order || 'asc',
    search: search || '',
    plot: plot || '',
    isActive: isActive || ''
  });

  return ApiResponse.success(res, 200, 'Chapters retrieved successfully', result);
});

/**
 * Get chapter by ID
 * GET /api/chapters/:id
 */
const getChapterById = asyncHandler(async (req, res) => {
  const chapter = await ChapterService.getChapterById(req.params.id);

  return ApiResponse.success(res, 200, 'Chapter retrieved successfully', chapter);
});

/**
 * Get chapter by slug
 * GET /api/chapters/slug/:slug
 */
const getChapterBySlug = asyncHandler(async (req, res) => {
  const chapter = await ChapterService.getChapterBySlug(req.params.slug);

  return ApiResponse.success(res, 200, 'Chapter retrieved successfully', chapter);
});

/**
 * Update chapter
 * PUT /api/chapters/:id
 */
const updateChapter = asyncHandler(async (req, res) => {
  const updatedChapter = await ChapterService.updateChapter(req.params.id, req.body);

  return ApiResponse.success(res, 200, 'Chapter updated successfully', updatedChapter);
});

/**
 * Delete chapter
 * DELETE /api/chapters/:id
 */
const deleteChapter = asyncHandler(async (req, res) => {
  await ChapterService.deleteChapter(req.params.id);

  return ApiResponse.success(res, 200, 'Chapter deleted successfully');
});

/**
 * Deactivate chapter (soft delete)
 * PATCH /api/chapters/:id/deactivate
 */
const deactivateChapter = asyncHandler(async (req, res) => {
  const chapter = await ChapterService.deactivateChapter(req.params.id);

  return ApiResponse.success(res, 200, 'Chapter deactivated successfully', chapter);
});

/**
 * Reactivate chapter
 * PATCH /api/chapters/:id/reactivate
 */
const reactivateChapter = asyncHandler(async (req, res) => {
  const chapter = await ChapterService.reactivateChapter(req.params.id);

  return ApiResponse.success(res, 200, 'Chapter reactivated successfully', chapter);
});

/**
 * Get chapters by plot
 * GET /api/chapters/plot/:plotId
 */
const getChaptersByPlot = asyncHandler(async (req, res) => {
  const chapters = await ChapterService.getChaptersByPlot(req.params.id);

  return ApiResponse.success(res, 200, 'Chapters retrieved successfully', chapters);
});

/**
 * Reorder chapters for a plot
 * PUT /api/chapters/plot/:plotId/reorder
 */
const reorderChapters = asyncHandler(async (req, res) => {
  const { chapterIds } = req.body;
  
  const chapters = await ChapterService.reorderChapters(req.params.plotId, chapterIds);

  return ApiResponse.success(res, 200, 'Chapters reordered successfully', chapters);
});

module.exports = {
  createChapter,
  getAllChapters,
  getChapterById,
  getChapterBySlug,
  updateChapter,
  deleteChapter,
  deactivateChapter,
  reactivateChapter,
  getChaptersByPlot,
  reorderChapters
}; 