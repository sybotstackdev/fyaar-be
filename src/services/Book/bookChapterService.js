const BookChapter = require('../../models/bookChapterModel');
const Book = require('../../models/bookModel');
const logger = require('../../utils/logger');

const createChapter = async (chapterData) => {
    try {
        const book = await Book.findById(chapterData.book);
        if (!book || book.deletedAt) {
            throw new Error('Book not found');
        }

        // --- Automatic Order Logic ---
        // Find the chapter with the highest order for this book
        const highestOrderChapter = await BookChapter.findOne({ book: chapterData.book })
            .sort({ order: -1 })
            .limit(1);

        // Set the order for the new chapter
        const newOrder = highestOrderChapter ? highestOrderChapter.order + 1 : 1;
        // --- End of Logic ---

        const chapter = new BookChapter({
            ...chapterData,
            order: newOrder // Overwrite any user-provided order
        });

        await chapter.save();
        logger.info(`New chapter created for book: ${book.title} with order ${newOrder}`);
        return chapter;
    } catch (error) {
        logger.error('Chapter creation error:', error.message);
        throw error;
    }
};

const getChaptersByBook = async (bookId, options = {}, user = null) => {
    try {
        const { page = 1, limit = 10, sort = 'order', order = 'asc', status = '', showDeleted = 'false' } = options;

        const query = { book: bookId };
        const isAdmin = user && user.role === 'admin';

        if (isAdmin && showDeleted === 'true') {
            query.deletedAt = { $ne: null };
        } else {
            query.deletedAt = null;
        }

        if (isAdmin) {
            if (status) {
                query.status = status;
            }
        } else {
            query.status = 'published';
        }

        const skip = (page - 1) * limit;
        const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

        const chapters = await BookChapter.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limit);

        const total = await BookChapter.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return {
            results: chapters,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        };
    } catch (error) {
        logger.error('Get chapters by book error:', error.message);
        throw error;
    }
};

const getChapterById = async (chapterId, user = null) => {
    try {
        const chapter = await BookChapter.findOne({ _id: chapterId }).populate('book', 'title');

        if (!chapter) {
            throw new Error('Chapter not found');
        }

        if (chapter.status === 'draft') {
            const isAdmin = user && user.role === 'admin';
            if (!isAdmin) {
                throw new Error('Chapter not found');
            }
        }

        return chapter;
    } catch (error) {
        logger.error('Get chapter by ID error:', error.message);
        throw error;
    }
};

const updateChapter = async (chapterId, updateData) => {
    try {
        const chapter = await BookChapter.findOneAndUpdate({ _id: chapterId, deletedAt: null }, updateData, { new: true, runValidators: true });
        if (!chapter) {
            throw new Error('Chapter not found');
        }
        logger.info(`Chapter updated: ${chapter.title}`);
        return chapter;
    } catch (error) {
        logger.error('Update chapter error:', error.message);
        throw error;
    }
};

const softDeleteChapter = async (chapterId) => {
    try {
        const chapter = await BookChapter.findOneAndUpdate({ _id: chapterId, deletedAt: null }, { deletedAt: new Date() }, { new: true });
        if (!chapter) {
            throw new Error('Chapter not found');
        }
        logger.info(`Chapter soft-deleted: ${chapter.title}`);
        return true;
    } catch (error) {
        logger.error('Soft delete chapter error:', error.message);
        throw error;
    }
};

const reorderChapters = async (bookId, orderedChapterIds) => {
    try {
        const updatePromises = orderedChapterIds.map((chapterId, index) => {
            return BookChapter.updateOne(
                { _id: chapterId, book: bookId }, // Ensure the chapter belongs to the correct book
                { $set: { order: index + 1 } }
            );
        });

        await Promise.all(updatePromises);
        logger.info(`Successfully reordered chapters for book ${bookId}`);
        return { success: true, message: 'Chapters reordered successfully.' };
    } catch (error) {
        logger.error(`Error reordering chapters for book ${bookId}:`, error.message);
        throw error;
    }
};

const restoreChapter = async (chapterId) => {
    try {
        const chapter = await BookChapter.findOneAndUpdate({ _id: chapterId, deletedAt: { $ne: null } }, { deletedAt: null }, { new: true });
        if (!chapter) {
            throw new Error('Chapter not found or is not deleted.');
        }
        logger.info(`Chapter restored: ${chapter.title}`);
        return chapter;
    } catch (error) {
        logger.error('Restore chapter error:', error.message);
        throw error;
    }
};

const permanentlyDeleteChapter = async (chapterId) => {
    try {
        const chapter = await BookChapter.findByIdAndDelete(chapterId);
        if (!chapter) {
            throw new Error('Chapter not found');
        }
        logger.info(`Chapter permanently deleted: ${chapter.title}`);
        return true;
    } catch (error) {
        logger.error('Permanent delete chapter error:', error.message);
        throw error;
    }
};

module.exports = {
    createChapter,
    getChaptersByBook,
    getChapterById,
    updateChapter,
    softDeleteChapter,
    reorderChapters,
    restoreChapter,
    permanentlyDeleteChapter
};