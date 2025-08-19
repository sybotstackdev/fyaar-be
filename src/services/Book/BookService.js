const Book = require('../../models/bookModel');
const logger = require('../../utils/logger');

const createBook = async (bookData) => {
    try {
        const book = new Book(bookData);
        await book.save();
        logger.info(`New book created: ${book.title}`);
        return book;
    } catch (error) {
        logger.error('Book creation error:', error.message);
        throw error;
    }
};

const getAllBooks = async (options = {}, user = null) => {
    try {

        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '', status = '', showDeleted = 'false' } = options;

        const query = {};
        const isAdmin = user && user.role === 'admin';

        if (isAdmin && showDeleted === 'true') {
            query.deletedAt = { $ne: null };
        } else {
            query.deletedAt = null;
        }

        if (search) {
            query.$text = { $search: search };
        }

        if (isAdmin) {
            if (status) {
                query.status = status;
            }
        } else {
            query.status = 'published';
        }


        const skip = (page - 1) * limit;
        const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

        const books = await Book.find(query).sort(sortObj).skip(skip).limit(limit)
            .populate('authors', 'authorName')
            .populate('tags', 'name')
            .populate('genres', 'title')
            .populate('spiceMoods', 'title')
            .populate('locations', 'title')
            .populate('plots', 'title')
            .populate('narrative', 'title')
            .populate('endings', 'title');

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
        const book = await Book.findOne({ _id: bookId, deletedAt: null })
            .populate('authors')
            .populate('tags')
            .populate('spiceMoods')
            .populate('locations')
            .populate('plots')
            .populate('narrative')
            .populate('endings')
            .populate('genres');
        if (!book) throw new Error('Book not found');
        return book;
    } catch (error) {
        logger.error('Get book by ID error:', error.message);
        throw error;
    }
};

const updateBook = async (bookId, updateData) => {
    try {
        const book = await Book.findOneAndUpdate({ _id: bookId, deletedAt: null }, updateData, { new: true, runValidators: true });
        if (!book) throw new Error('Book not found');
        logger.info(`Book updated: ${book.title}`);
        return book;
    } catch (error) {
        logger.error('Update book error:', error.message);
        throw error;
    }
};

const softDeleteBook = async (bookId) => {
    try {
        const book = await Book.findOneAndUpdate({ _id: bookId, deletedAt: null }, { deletedAt: new Date() }, { new: true });
        if (!book) throw new Error('Book not found');
        logger.info(`Book soft-deleted: ${book.title}`);
        return true;
    } catch (error) {
        logger.error('Soft delete book error:', error.message);
        throw error;
    }
};

const getBookAnalytics = async (options = {}) => {
    try {
        const { top = 10, sortBy = 'count', order = 'desc' } = options;

        const topGenres = await Book.aggregate([
            { $match: { deletedAt: null, status: 'published' } },
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

const restoreBook = async (bookId) => {
    try {
        const book = await Book.findOneAndUpdate({ _id: bookId, deletedAt: { $ne: null } }, { deletedAt: null }, { new: true });
        if (!book) {
            throw new Error('Book not found or is not deleted.');
        }
        logger.info(`Book restored: ${book.title}`);
        return book;
    } catch (error) {
        logger.error('Restore book error:', error.message);
        throw error;
    }
};

const permanentlyDeleteBook = async (bookId) => {
    try {
        // First, delete all chapters associated with the book
        const chapterDeletionResult = await BookChapter.deleteMany({ book: bookId });
        logger.info(`Deleted ${chapterDeletionResult.deletedCount} chapters for book ${bookId}.`);

        // Then, permanently delete the book itself
        const book = await Book.findByIdAndDelete(bookId);
        if (!book) {
            throw new Error('Book not found');
        }
        logger.info(`Book permanently deleted: ${book.title}`);
        return true;
    } catch (error) {
        logger.error('Permanent delete book error:', error.message);
        throw error;
    }
};

module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    softDeleteBook,
    getBookAnalytics,
    restoreBook,
    permanentlyDeleteBook
};