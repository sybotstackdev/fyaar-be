const BookBatch = require('../../models/bookBatchModel');
const Book = require('../../models/bookModel');
const BookGeneratedContent = require('../../models/bookGeneratedContentModel');
const jobService = require('../jobService');
const logger = require('../../utils/logger');
const ApiError = require('../../utils/ApiError');
const BookChapter = require('../../models/bookChapterModel');

/**
 * @desc    Create a new book batch
 * @param   {Object} batchData - Data for the batch
 * @param   {string} userId - The ID of the user creating the batch
 * @returns {Promise<Object>} The created book batch
 */
const createBookBatch = async (batchData, userId) => {
    const { name, books } = batchData;

    console.log(books)
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
        narrative: book.narratives,
        locations: book.locations,
        spiceLevels: book.spiceLevels,
        endings: book.endings,
        batchId: newBatch._id,
        userId,
        status: 'generating',
        'generationStatus.title.status': 'pending'
    }));

    for (const bookData of placeholderBooks) {
        await Book.create(bookData);
    }
    logger.info(`${books.length} placeholder books created for batch ID: ${newBatch._id}`);

    jobService.queueJob('generate-titles', { batchId: newBatch._id });
    logger.info(`Job queued with BullMQ for batch ID: ${newBatch._id}`);

    return newBatch;
};

/**
 * @desc    Restart title generation for all books in a batch (only incomplete ones)
 * @param   {string} batchId - The ID of the batch to update
 * @param   {string} userId - The ID of the user updating the batch
 * @returns {Promise<Object>} The updated book batch
 */
const updateBookBatch = async (batchId, userId) => {
    const batch = await BookBatch.findById(batchId);

    if (!batch) {
        throw new ApiError(404, 'Book batch not found.');
    }

    // ✅ Ensure only owner can update
    if (batch.userId.toString() !== userId.toString()) {
        throw new ApiError(403, 'You are not authorized to update this batch.');
    }

    // 🔹 Find only books that are NOT completed
    const booksToRetry = await Book.find({
        batchId,
        'generationStatus.title.status': { $ne: 'completed' }
    }).select('_id');

    if (booksToRetry.length === 0) {
        logger.info(`✅ All book titles already completed for batch ID: ${batch._id}`);
        return batch;
    }

    // 🔹 Queue job for regenerating titles only for those books
    jobService.queueReJob('re-generate-titles', { batchId, bookIds: booksToRetry.map(b => b._id) });

    logger.info(
        `🔄 Title regeneration triggered for ${booksToRetry.length} incomplete books in batch ID: ${batch._id}`
    );

    return batch;
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
 * Delete book batch by id
 * @param {ObjectId} bookBatchId
 * @returns {Promise<BookBatch>}
 */
const deleteBookBatch = async (bookBatchId) => {
    const books = await Book.find({ batchId: bookBatchId }).select('_id').lean();
    const bookIds = books.map(book => book._id);

    await Promise.all([
        BookChapter.deleteMany({ book: { $in: bookIds } }),
        Book.deleteMany({ batchId: bookBatchId }),
        BookGeneratedContent.deleteMany({ batchId: bookBatchId })
    ]);

    const bookBatch = await BookBatch.findByIdAndDelete(bookBatchId);
    logger.info(`Book batch deleted: ${bookBatch.name}`);
    return true;
};

module.exports = {
    createBookBatch,
    getAllBookBatches,
    getBookBatchById,
    deleteBookBatch,
    updateBookBatch
};
