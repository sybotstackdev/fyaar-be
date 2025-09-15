const BookBatchService = require('../../services/Book/bookBatchService');
const ApiResponse = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * @desc    Create a new book batch (admin only)
 * @route   POST /api/batches
 * @access  Admin
 */
const createBookBatch = asyncHandler(async (req, res) => {
    const newBatch = await BookBatchService.createBookBatch(req.body, req.user._id);
    return ApiResponse.success(res, 201, 'Book batch created successfully', newBatch);
});

/**
 * @desc    Update a book batch (admin only)
 * @route   PUT /api/batches/:id
 * @access  Admin
 */
const UpdateBookBatch = asyncHandler(async (req, res) => {
    const newBatch = await BookBatchService.updateBookBatch(req.params.id, req.user._id);
    return ApiResponse.success(res, 201, 'Book batch Regenaration Started successfully', newBatch);
});


/**
 * @desc    Get all book batches
 * @route   GET /api/batches
 * @access  Admin
 */
const getBookBatches = asyncHandler(async (req, res) => {
    const { page, limit, sort, order, search, status } = req.query;
    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        sort: sort || 'createdAt',
        order: order || 'desc',
        search: search || '',
        status: status || ''
    };
    const result = await BookBatchService.getAllBookBatches(options);
    return ApiResponse.success(res, 200, 'Book batches retrieved successfully', result);
});

const getBookBatchById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const bookBatch = await BookBatchService.getBookBatchById(id);
    return ApiResponse.success(res, 200, 'Book batch retrieved successfully', bookBatch);
});

const deleteBookBatch = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await BookBatchService.deleteBookBatch(id);
    return ApiResponse.success(res, 200, 'Book batch deleted successfully');
});

module.exports = {
    createBookBatch,
    getBookBatches,
    getBookBatchById,
    deleteBookBatch,
    UpdateBookBatch
};
