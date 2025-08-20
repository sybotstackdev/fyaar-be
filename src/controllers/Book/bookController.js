const BookService = require('../../services/Book/bookService');
const BookChapterService = require('../../services/Book/bookChapterService');
const fileUploadService = require('../../services/fileUploadService');
const ApiResponse = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const createBook = asyncHandler(async (req, res) => {
    const book = await BookService.createBook(req.body);
    return ApiResponse.created(res, 'Book created successfully', book);
});

const getAllBooks = asyncHandler(async (req, res) => {
    const result = await BookService.getAllBooks(req.query, req.user);
    return ApiResponse.success(res, 200, 'Books retrieved successfully', result);
});

const getBookById = asyncHandler(async (req, res) => {
    const book = await BookService.getBookById(req.params.id);
    return ApiResponse.success(res, 200, 'Book retrieved successfully', book);
});

const updateBook = asyncHandler(async (req, res) => {
    const updatedBook = await BookService.updateBook(req.params.id, req.body);
    return ApiResponse.success(res, 200, 'Book updated successfully', updatedBook);
});

const deleteBook = asyncHandler(async (req, res) => {
    await BookService.softDeleteBook(req.params.id);
    return ApiResponse.success(res, 200, 'Book soft-deleted successfully');
});

const restoreBook = asyncHandler(async (req, res) => {
    const restoredBook = await BookService.restoreBook(req.params.id);
    return ApiResponse.success(res, 200, 'Book restored successfully', restoredBook);
});

const permanentlyDeleteBook = asyncHandler(async (req, res) => {
    await BookService.permanentlyDeleteBook(req.params.id);
    return ApiResponse.success(res, 200, 'Book permanently deleted successfully');
});

const getBookAnalytics = asyncHandler(async (req, res) => {
    const analytics = await BookService.getBookAnalytics(req.query);
    return ApiResponse.success(res, 200, 'Book analytics retrieved successfully', analytics);
});

const getChaptersByBook = asyncHandler(async (req, res) => {
    const result = await BookChapterService.getChaptersByBook(req.params.id, req.query, req.user);
    return ApiResponse.success(res, 200, 'Chapters for book retrieved successfully', result);
});

const reorderBookChapters = asyncHandler(async (req, res) => {
    const { orderedChapterIds } = req.body;
    if (!orderedChapterIds || !Array.isArray(orderedChapterIds)) {
        return ApiResponse.error(res, 400, 'orderedChapterIds must be an array.');
    }
    const result = await BookChapterService.reorderChapters(req.params.id, orderedChapterIds);
    return ApiResponse.success(res, 200, result.message, result);
});

const uploadCoverImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return ApiResponse.error(res, 400, 'No file uploaded.');
    }

    const fileUrl = await fileUploadService.uploadAndOptimizeImage(req.file);
    return ApiResponse.success(res, 201, 'Book cover uploaded successfully', { url: fileUrl });
});

module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    restoreBook,
    permanentlyDeleteBook,
    getBookAnalytics,
    getChaptersByBook,
    reorderBookChapters,
    uploadCoverImage
};