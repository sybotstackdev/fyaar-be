const mongoose = require('mongoose');
const Book = require('../../models/bookModel');
const BookChapter = require('../../models/bookChapterModel');
const logger = require('../../utils/logger');
const { uploadToS3, deleteFromS3 } = require('../fileUploadService');
const ApiError = require('../../utils/ApiError');
const { generateBookTitles, generateBookDescription, generateBookChapters, OpenAIParseError } = require('../ai/openAI');
const { generateImage } = require('../ai/imageGeneration');
const BookGeneratedContent = require("../../models/bookGeneratedContentModel.js");

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
            .populate('spiceLevels')
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
        const book = await Book.findByIdAndUpdate(bookId, updateData, { new: true, runValidators: true });
        if (!book) throw new ApiError(404, 'Book not found');

        await book.populate([
            { path: 'authors' },
            { path: 'tags' },
            { path: 'spiceLevels' },
            { path: 'locations' },
            { path: 'plots' },
            { path: 'narrative' },
            { path: 'endings' },
            { path: 'genres' }
        ]);

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

/**
 * Generate a new title for an existing book using AI and update it.
 * @param {string} bookId
 * @returns {Promise<object>} Updated book
 */
async function generateAndUpdateTitle(bookId) {
    try {
        const book = await Book.findById(bookId).populate('genres');
        if (!book) throw new ApiError(404, 'Book not found');

        const storyDescription = book.description || '';
        const genreLayer = Array.isArray(book.genres)
            ? book.genres.map(g => g?.title).filter(Boolean).join(', ')
            : '';

        const { parsedContent, rawContent } = await generateBookTitles(storyDescription, genreLayer);

        const pickTitle = (data) => {
            if (!data || typeof data !== 'object') return null;
            // Common shapes: { titles: ["..", ".."] } or nested groups
            if (Array.isArray(data.titles) && data.titles.length) {
                const first = data.titles.find(t => typeof t === 'string' && t.trim());
                if (first) return first.trim();
            }
            // Search any string in object depth-1
            for (const key of Object.keys(data)) {
                const val = data[key];
                if (typeof val === 'string' && val.trim()) return val.trim();
                if (Array.isArray(val)) {
                    const str = val.find(v => typeof v === 'string' && v.trim());
                    if (str) return str.trim();
                }
                if (val && typeof val === 'object') {
                    const maybe = pickTitle(val);
                    if (maybe) return maybe;
                }
            }
            return null;
        };

        let newTitle = pickTitle(parsedContent);

        const authorName = book.authors?.[0]?.authorName ?? '';
        const designStyle = book.authors?.[0]?.designStyle ?? '';
        const genreDesc = book.genres?.[0]?.description ?? '';

        const coverPrompt = `Design a book cover with the title "${newTitle}" at the top and the author "${authorName}" at the bottom. Depict ${book.description}. Apply ${designStyle} (this includes both artwork style and typography direction). Apply ${genreDesc}.`
            .replace(/\s+/g, ' ').trim();

        const { ideogramUrl, s3Url } = await generateImage(coverPrompt);
        if (!newTitle) {
            // Fallback: first non-empty line from raw content
            newTitle = String(rawContent || '').split(/\r?\n/).map(s => s.trim()).find(Boolean) || null;
        }

        if (!newTitle) {
            throw new ApiError(502, 'AI did not return a usable title');
        }

        book.title = newTitle;
        book.bookCover = s3Url;
        const updated = await book.save();
        logger.info(`Book title updated via AI for ${bookId}: ${newTitle}`);
        return updated;
    } catch (error) {
        logger.error('Generate and update title error:', error.message);
        throw error;
    }
}

/**
 * Generate a new title for an existing book using AI and update it.
 * @param {string} bookId
 * @returns {Promise<object>} Updated book
 */
async function updateBookDescription(bookId) {
    logger.info(`Starting description update for book: ${bookId}`);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const book = await Book.findById(bookId)
            .populate({
                path: 'genres',
                select: 'description',
                populate: { path: 'variants', select: 'name' }
            })
            .populate({
                path: 'plots',
                select: 'description',
                populate: { path: 'chapters', select: 'description' }
            });

        if (!book) {
            throw new ApiError(404, `Book with ID ${bookId} not found`);
        }

        // Mark description generation as in progress
        await book.updateOne(
            { 'generationStatus.description.status': 'in_progress' },
            { session }
        );

        // Select random variant
        const genre = book.genres?.[0];
        const variants = genre?.variants;
        let randomVariantName = '';
        let randomVariantId = null;

        if (variants && variants.length > 0) {
            const randomIndex = Math.floor(Math.random() * variants.length);
            const selectedVariant = variants[randomIndex];
            if (selectedVariant?.name) {
                randomVariantName = selectedVariant.name;
                randomVariantId = selectedVariant._id;
            }
        }

        // Build prompt data
        const promptData = {
            title: book.title,
            genre: genre?.description ?? '',
            variant: randomVariantName,
            location: '',
            characters: '',
            trope_description: book.plots?.[0]?.description ?? '',
            chapter_summaries: book.plots?.[0]?.chapters?.map(c => c.description).join('; ') ?? ''
        };

        // Call description generator
        const { description, fullPrompt, rawContent } = await generateBookDescription(promptData);

        // Update book record
        book.description = description;
        book.generationStatus.description.status = 'completed';
        await book.save({ session });

        await session.commitTransaction();
        logger.info(`Successfully updated description for book: ${bookId}`);
        return book;
    } catch (error) {
        await session.abortTransaction();
        logger.error(`Failed to update description for book: ${bookId}`, error);
        await Book.findByIdAndUpdate(bookId, {
            'generationStatus.description.status': 'failed',
            'generationStatus.description.errorMessage': error.message || 'An unknown error occurred'
        });
        throw error;
    } finally {
        session.endSession();
    }
}




module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    getBookAnalytics,
    deleteBook,
    updateBookCover,
    generateAndUpdateTitle,
    updateBookDescription
};

