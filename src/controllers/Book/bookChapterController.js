const BookChapterService = require('../../services/Book/bookChapterService');
const ApiResponse = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const createChapter = asyncHandler(async (req, res) => {
    const chapter = await BookChapterService.createChapter(req.body);
    return ApiResponse.created(res, 'Chapter created successfully', chapter);
});

const getChapterById = asyncHandler(async (req, res) => {
    const chapter = await BookChapterService.getChapterById(req.params.id, req.user);
    return ApiResponse.success(res, 200, 'Chapter retrieved successfully', chapter);
});

const updateChapter = asyncHandler(async (req, res) => {
    const updatedChapter = await BookChapterService.updateChapter(req.params.id, req.body);
    return ApiResponse.success(res, 200, 'Chapter updated successfully', updatedChapter);
});

const deleteChapter = asyncHandler(async (req, res) => {
    await BookChapterService.deleteChapter(req.params.id);
    return ApiResponse.success(res, 200, 'Chapter deleted successfully');
});

const generateAndUpdateChapters = asyncHandler(async (req, res) => {
    const updated = await BookChapterService.updateBookChapters(req.params.id);
    return ApiResponse.success(res, 200, 'Book description regenerated and updated successfully', updated);
});

module.exports = {
    createChapter,
    getChapterById,
    updateChapter,
    deleteChapter,
    generateAndUpdateChapters
};