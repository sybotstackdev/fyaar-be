const BookChapter = require('../../models/bookChapterModel');
const Book = require('../../models/bookModel');
const logger = require('../../utils/logger');
const { generateBookChapters } = require('../ai/openAI');
const BookGeneratedContent  = require("../../models/bookGeneratedContentModel.js");
const { default: mongoose } = require('mongoose');

const createChapter = async (chapterData) => {
    try {
        const book = await Book.findById(chapterData.book);
        if (!book) {
            throw new Error('Book not found');
        }

        const highestOrderChapter = await BookChapter.findOne({ book: chapterData.book })
            .sort({ order: -1 })
            .limit(1);

        const newOrder = highestOrderChapter ? highestOrderChapter.order + 1 : 1;

        const chapter = new BookChapter({
            ...chapterData,
            order: newOrder
        });

        await chapter.save();
        logger.info(`New chapter created for book: ${book.title} with order ${newOrder}`);
        return chapter;
    } catch (error) {
        logger.error('Chapter creation error:', error.message);
        throw error;
    }
};

const getChaptersByBook = async (bookId, options = {}) => {
    try {
        const { page = 1, limit = 10, sort = 'order', order = 'asc', status = '' } = options;

        const query = { book: bookId };

        if (status) {
            query.status = status;
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

const getChapterById = async (chapterId) => {
    try {
        const chapter = await BookChapter.findOne({ _id: chapterId }).populate('book', 'title');

        if (!chapter) {
            throw new Error('Chapter not found');
        }

        return chapter;
    } catch (error) {
        logger.error('Get chapter by ID error:', error.message);
        throw error;
    }
};

const updateChapter = async (chapterId, updateData) => {
    try {
        const chapter = await BookChapter.findOneAndUpdate({ _id: chapterId }, updateData, { new: true, runValidators: true });
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

const reorderChapters = async (bookId, orderedChapterIds) => {
    try {
        const updatePromises = orderedChapterIds.map((chapterId, index) => {
            return BookChapter.updateOne(
                { _id: chapterId, book: bookId },
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

const deleteChapter = async (chapterId) => {
    try {
        const chapter = await BookChapter.findByIdAndDelete(chapterId);
        if (!chapter) {
            throw new Error('Chapter not found');
        }
        logger.info(`Chapter deleted: ${chapter.title}`);
        return true;
    } catch (error) {
        logger.error('Delete chapter error:', error.message);
        throw error;
    }
};

const updateBookChapters = async (bookId) => {
    logger.info(`Starting chapter update for book: ${bookId}`);
    const session = await mongoose.startSession();
    session.startTransaction();

    const book = await Book.findById(bookId)
        .populate({
            path: 'plots',
            select: 'title description',
            populate: { path: 'chapters', select: 'name description order' }
        })
        .populate('narrative', 'description')
        .populate('spiceLevels', 'comboName description')
        .populate('endings', 'optionLabel');

    if (!book) throw new Error(`Book not found: ${bookId}`);
    const batchId = book.batchId;
    let bookWasFound = true;

    try {
        await book.updateOne(
            { 'generationStatus.chapters.status': 'in_progress' },
            { session }
        );

        const plot = book.plots?.[0];
        if (!plot) throw new Error(`Plot not found for book: ${bookId}`);

        const chapterBeats = plot.chapters
            .sort((a, b) => a.order - b.order)
            .map(c => `${c.name}: ${c.description}`)
            .join('\n');

        const spiceLevel = book.spiceLevels?.[0];

        const promptData = {
            title: book.title,
            trope_name: plot.title,
            trope_description: plot.description,
            chapter_beats: chapterBeats,
            narrative: book.narrative?.[0]?.description ?? '',
            spice_level: spiceLevel ? `${spiceLevel.comboName} (${spiceLevel.description})` : '',
            ending_type: book.endings?.[0]?.optionLabel ?? '',
            location: '',
            characters: ''
        };

        const { chaptersJSON, fullPrompt, rawContent } = await generateBookChapters(promptData);

        // Save AI response in generated content
        await BookGeneratedContent.create({
            bookId: book._id,
            batchId: book.batchId,
            contentType: 'chapter',
            promptUsed: fullPrompt,
            rawApiResponse: rawContent,
            source: 'OpenAI-o3-mini'
        });

        // Remove old chapters for this book
        await BookChapter.deleteMany({ book: book._id }, { session });

        // Insert new chapters
        const newChapters = chaptersJSON.chapters.map((c, i) => ({
            book: book._id,
            title: c?.title,
            content: c?.prose,
            order: i + 1,
            status: 'published'
        }));

        await BookChapter.insertMany(newChapters, { session });

        book.generationStatus.chapters.status = 'completed';
        await book.save({ session });

        await session.commitTransaction();
        logger.info(`Successfully updated ${newChapters.length} chapters for book: ${bookId}`);
        return newChapters;
    } catch (error) {
        await session.abortTransaction();
        logger.error(`Failed to update chapters for book: ${bookId}`, error);
        await Book.findByIdAndUpdate(bookId, {
            'generationStatus.chapters.status': 'failed',
            'generationStatus.chapters.errorMessage': error.message || 'An unknown error occurred'
        });

        if (error instanceof OpenAIParseError) {
            try {
                await BookGeneratedContent.create({
                    bookId: bookId,
                    batchId: batchId,
                    contentType: 'chapter',
                    promptUsed: error.prompt,
                    rawApiResponse: error.rawResponse,
                    source: 'OpenAI-o3-mini'
                });
            } catch (e) {
                logger.warn('Could not save parse-error payload:', e.message);
            }
        }
        throw error;
    } finally {
        session.endSession();
    }
};

module.exports = {
    createChapter,
    getChaptersByBook,
    getChapterById,
    updateChapter,
    reorderChapters,
    deleteChapter,
    updateBookChapters
};