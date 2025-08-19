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
    await BookChapterService.softDeleteChapter(req.params.id);
    return ApiResponse.success(res, 200, 'Chapter soft-deleted successfully');
});

const restoreChapter = asyncHandler(async (req, res) => {
    const restoredChapter = await BookChapterService.restoreChapter(req.params.id);
    return ApiResponse.success(res, 200, 'Chapter restored successfully', restoredChapter);
});

const permanentlyDeleteChapter = asyncHandler(async (req, res) => {
    await BookChapterService.permanentlyDeleteChapter(req.params.id);
    return ApiResponse.success(res, 200, 'Chapter permanently deleted successfully');
});

module.exports = {
    createChapter,
    getChapterById,
    updateChapter,
    deleteChapter,
    restoreChapter,
    permanentlyDeleteChapter
};