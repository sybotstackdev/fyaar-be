const BookBatch = require('../../models/bookBatchModel');
const Book = require('../../models/bookModel');
const jobService = require('../jobService');
const logger = require('../../utils/logger');
const ApiError = require('../../utils/ApiError');

/**
 * @desc    Create a new book batch
 * @param   {Object} batchData - Data for the batch
 * @param   {string} userId - The ID of the user creating the batch
 * @returns {Promise<Object>} The created book batch
 */
const createBookBatch = async (batchData, userId) => {
    const { name, books } = batchData;

    if (!books || !Array.isArray(books) || books.length === 0) {
        throw new ApiError(400, 'Batch must contain at least one book.');
    }

    const newBatch = await BookBatch.create({
        name,
        bookCount: books.length,
        userId,
        status: 'pending'
    });

    logger.info(`Book batch created with ID: ${newBatch._id}`);

    const placeholderBooks = books.map(book => ({
        title: 'Title Generation Pending...',
        authors: book.authors,
        genres: book.genres,
        plots: book.plots,
        batchId: newBatch._id,
        userId,
        status: 'generating',
        'generationStatus.title.status': 'pending'
    }));

    for (const bookData of placeholderBooks) {
        await Book.create(bookData);
    }
    logger.info(`${books.length} placeholder books created for batch ID: ${newBatch._id}`);

    // jobService.queueJob('generate-titles', { batchId: newBatch._id });
    logger.info(`Job queued with BullMQ for batch ID: ${newBatch._id}`);

    return newBatch;
};

/**
 * @desc    Get all book batches
 * @param   {Object} options - Options for the query
 * @param   {number} options.page - Page number
 * @param   {number} options.limit - Limit of book batches per page
 * @param   {string} options.sort - Field to sort by
 * @param   {string} options.order - Order of the sort
 * @param   {string} options.search - Search term
 * @param   {string} options.status - Status of the book batches
 * @returns {Promise<Object>} The book batches
 */
const getAllBookBatches = async (options) => {
    try {

        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '', status = '' } = options;


        const query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (status) {
            query.status = status;
        }


        const skip = (page - 1) * limit;
        const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

        const bookBatches = await BookBatch.find(query).sort(sortObj).skip(skip).limit(limit);

        const total = await BookBatch.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return {
            results: bookBatches,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        };
    } catch (error) {
        logger.error('Get all book batches error:', error.message);
        throw error;
    }
};

/**
 * @desc    Get a book batch by ID
 * @param   {string} bookBatchId - The ID of the book batch
 * @returns {Promise<Object>} The book batch
 */
const getBookBatchById = async (bookBatchId) => {
    try {
        const bookBatch = await BookBatch.findOne({ _id: bookBatchId })
            .populate('books', 'title status generationStatus');
        if (!bookBatch) throw new ApiError(404, 'Book batch not found');
        return bookBatch;
    } catch (error) {
        logger.error('Get book batch by ID error:', error.message);
        throw error;
    }
};

/**
 * @desc    Delete a book batch
 * @param   {string} bookBatchId - The ID of the book batch
 * @returns {Promise<boolean>} Success status
 */
const deleteBookBatch = async (bookBatchId) => {
    try {
        const bookBatch = await BookBatch.findById(bookBatchId);
        if (!bookBatch) {
            throw new ApiError(404, 'Book batch not found');
        }

        const bookDeletionResult = await Book.deleteMany({ batchId: bookBatchId });
        logger.info(`Deleted ${bookDeletionResult.deletedCount} books for batch ${bookBatchId}.`);

        await bookBatch.deleteOne();
        
        logger.info(`Book batch deleted: ${bookBatch.name}`);
        return true;
    } catch (error) {
        logger.error('Delete book batch error:', error.message);
        throw error;
    }
};

module.exports = {
    createBookBatch,
    getAllBookBatches,
    getBookBatchById,
    deleteBookBatch
};
