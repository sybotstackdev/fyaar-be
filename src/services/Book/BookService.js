const mongoose = require('mongoose');
const Book = require('../../models/bookModel');
const BookChapter = require('../../models/bookChapterModel');
const logger = require('../../utils/logger');
const { uploadToS3, deleteFromS3 } = require('../fileUploadService');
const ApiError = require('../../utils/ApiError');

const createBook = async (bookData, userId) => {
    const { chapters, ...bookDetails } = bookData;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const book = new Book({ ...bookDetails, userId });
        await book.save({ session });

        if (chapters && Array.isArray(chapters) && chapters.length > 0) {
            const chaptersToCreate = chapters.map((chapter, index) => ({
                ...chapter,
                book: book._id,
                order: index + 1
            }));
            await BookChapter.insertMany(chaptersToCreate, { session });
        }

        await session.commitTransaction();
        logger.info(`New book created successfully: ${book.title}`);
        return book;

    } catch (error) {
        await session.abortTransaction();
        logger.error('Book creation failed, transaction aborted:', error.message);
        throw error;
    } finally {
        session.endSession();
    }
};

const getAllBooks = async (options = {}) => {
    try {

        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '', status = '' } = options;


        const query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (status) {
            query.status = status;
        }


        const skip = (page - 1) * limit;
        const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

        const books = await Book.find(query).sort(sortObj).skip(skip).limit(limit)
            .populate('authors', 'authorName')
            .populate('tags', 'name')
            .populate('genres', 'title');
        // .populate('spiceMoods', 'title')
        // .populate('locations', 'title')
        // .populate('plots', 'title')
        // .populate('narrative', 'title')
        // .populate('endings', 'title');

        const total = await Book.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return {
            results: books,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        };
    } catch (error) {
        logger.error('Get all books error:', error.message);
        throw error;
    }
};

const getBookById = async (bookId) => {
    try {
        const book = await Book.findOne({ _id: bookId })
            .populate('authors')
            .populate('tags')
            .populate('spiceMoods')
            .populate('locations')
            .populate('plots')
            .populate('narrative')
            .populate('endings')
            .populate('genres');
        if (!book) throw new ApiError(404, 'Book not found');
        return book;
    } catch (error) {
        logger.error('Get book by ID error:', error.message);
        throw error;
    }
};

const updateBook = async (bookId, updateData) => {
    try {
        const book = await Book.findOneAndUpdate({ _id: bookId }, updateData, { new: true, runValidators: true });
        if (!book) throw new ApiError(404, 'Book not found');
        logger.info(`Book updated: ${book.title}`);
        return book;
    } catch (error) {
        logger.error('Update book error:', error.message);
        throw error;
    }
};

const getBookAnalytics = async (options = {}) => {
    try {
        const { top = 10, sortBy = 'count', order = 'desc' } = options;

        const topGenres = await Book.aggregate([
            { $match: { status: 'published' } },
            { $unwind: '$genres' },
            { $group: { _id: '$genres', count: { $sum: 1 } } },
            { $sort: { [sortBy]: order === 'desc' ? -1 : 1 } },
            { $limit: parseInt(top) },
            { $lookup: { from: 'genres', localField: '_id', foreignField: '_id', as: 'genre' } },
            { $unwind: '$genre' },
            { $project: { name: '$genre.title', count: 1, _id: 0 } }
        ]);

        return { topGenres };
    } catch (error) {
        logger.error('Book analytics error:', error.message);
        throw error;
    }
};

const deleteBook = async (bookId) => {
    try {
        const chapterDeletionResult = await BookChapter.deleteMany({ book: bookId });
        logger.info(`Deleted ${chapterDeletionResult.deletedCount} chapters for book ${bookId}.`);

        const book = await Book.findByIdAndDelete(bookId);
        if (!book) {
            throw new ApiError(404, 'Book not found');
        }
        logger.info(`Book deleted: ${book.title}`);
        return true;
    } catch (error) {
        logger.error('Delete book error:', error.message);
        throw error;
    }
};

const updateBookCover = async (bookId, file) => {
    try {
        if (!file) {
            throw new ApiError(400, 'No file provided for upload.');
        }

        const book = await Book.findById(bookId);
        if (!book) {
            throw new ApiError(404, 'Book not found');
        }
        const oldCoverPhotoUrl = book.bookCover;
        const newCoverPhotoUrl = await uploadToS3(file, 'book_covers');

        book.bookCover = newCoverPhotoUrl;
        await book.save();

        if (oldCoverPhotoUrl) {
            await deleteFromS3(oldCoverPhotoUrl);
        }

        logger.info(`Book cover updated for book: ${book.title}`);
        return newCoverPhotoUrl;
    } catch (error) {
        logger.error('Update book cover error:', error.message);
        throw error;
    }
};

module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    getBookAnalytics,
    deleteBook,
    updateBookCover
};