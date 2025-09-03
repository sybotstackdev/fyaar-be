const BookBatch = require('../models/bookBatchModel');
const Book = require('../models/bookModel');
const BookGeneratedContent = require('../models/bookGeneratedContentModel');
const { generateBookTitles, generateBookDescription, OpenAIParseError } = require('../services/ai/openAI');
const jobService = require('../services/jobService');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

require('../models/genreModel');
require('../models/plotModel');
require('../models/chapterModel');
require('../models/locationModel');
require('../models/authorModel');
require('../models/narrativeModel');
require('../models/genreVariantModel');

/**
 * @desc Processes a batch to generate book titles using OpenAI
 * @param {string} batchId - The ID of the book batch to process
 */
const processBookTitleGeneration = async (batchId) => {
    logger.info(`Starting title generation for batch: ${batchId}`);

    const batch = await BookBatch.findById(batchId);
    if (!batch) {
        logger.error(`Batch not found for processing: ${batchId}`);
        return;
    }

    try {
        await batch.updateOne({ status: 'processing' });

        const booksToProcess = await Book.find({ batchId, 'generationStatus.title.status': 'pending' })
            .populate({
                path: 'genres',
                select: 'description'
            })
            .populate({
                path: 'plots',
                select: 'title description',
                populate: {
                    path: 'chapters',
                    select: 'name description'
                }
            });

        for (const book of booksToProcess) {
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                await book.updateOne({ 'generationStatus.title.status': 'in_progress' }, { session });

                const genre = book.genres?.[0];
                const plot = book.plots?.[0];

                const genreLayer = genre?.description ?? '';

                let storyDescription = '';
                if (plot) {
                    const plotInfo = `Troop Title: ${plot.title}\nTroop Description: ${plot?.description ?? ''}`;
                    const chaptersInfo = plot.chapters && plot.chapters.length > 0
                        ? "\nChapters:\n" + plot.chapters.map(ch => `- ${ch.name}: ${ch?.description ?? ''}`).join('\n')
                        : "";

                    storyDescription = plotInfo + chaptersInfo;
                }

                const { parsedContent: titlesResponse, fullPrompt, rawContent } = await generateBookTitles(storyDescription, genreLayer);

                const firstCategory = Object.keys(titlesResponse)[0];
                if (!firstCategory || !Array.isArray(titlesResponse[firstCategory]) || titlesResponse[firstCategory].length === 0) {
                    throw new Error('OpenAI response did not contain any titles in the first category.');
                }
                const selectedTitle = titlesResponse[firstCategory][0];


                const allTitles = [];
                let isFirst = true;
                for (const category in titlesResponse) {
                    for (const title of titlesResponse[category]) {
                        const status = isFirst ? 'active' : 'inactive';
                        allTitles.push({ title, category, status });
                        isFirst = false;
                    }
                }

                await BookGeneratedContent.create([{
                    bookId: book._id,
                    batchId: batchId,
                    contentType: 'title',
                    promptUsed: fullPrompt,
                    titles: allTitles,
                    rawApiResponse: rawContent,
                    source: 'OpenAI-o3-mini'
                }], { session });

                book.title = selectedTitle;
                book.status = 'unpublished';
                book.generationStatus.title.status = 'completed';
                await book.save({ session });

                jobService.queueJob('generate-description', { bookId: book._id });

                logger.info(`Successfully generated and assigned title for book: ${book._id}. New title: "${selectedTitle}"`);
                await session.commitTransaction();
            } catch (error) {
                await session.abortTransaction();
                logger.error(`Failed to generate titles for book: ${book._id} in batch: ${batchId}`, error);

                if (error instanceof OpenAIParseError) {
                    await BookGeneratedContent.create({
                        bookId: book._id,
                        batchId: batchId,
                        contentType: 'title',
                        promptUsed: error.prompt,
                        titles: [],
                        rawApiResponse: error.rawResponse
                    });
                }

                await Book.findByIdAndUpdate(book._id, {
                    status: 'unpublished',
                    'generationStatus.title.status': 'failed',
                    'generationStatus.title.errorMessage': error.message || 'An unknown error occurred'
                });
            } finally {
                session.endSession();
            }
        }

        await batch.updateOne({ status: 'completed' });
        logger.info(`Batch processing completed for: ${batchId}`);

    } catch (error) {
        logger.error(`A critical error occurred during batch processing for batchId: ${batchId}.`, error);
        await batch.updateOne({
            status: 'failed',
            errorMessage: error.message || 'A critical error stopped the batch process.'
        });
        throw error;
    }
};

/**
 * @desc Processes a single book to generate a description using OpenAI
 * @param {string} bookId - The ID of the book to process
 */
const processBookDescriptionGeneration = async (bookId) => {
    logger.info(`Starting description generation for book: ${bookId}`);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const book = await Book.findById(bookId)
            .populate({
                path: 'genres',
                select: 'description',
                populate: {
                    path: 'variants',
                    select: 'title'
                }
            })
            .populate({
                path: 'plots',
                select: 'description',
                populate: { path: 'chapters', select: 'description' }
            });

        if (!book) {
            throw new Error(`Book with ID ${bookId} not found.`);
        }

        await book.updateOne({ 'generationStatus.description.status': 'in_progress' }, { session });

        const variants = book.genres?.[0]?.variants;
        let randomVariant = '';
        if (variants && variants.length > 0) {
            const randomIndex = Math.floor(Math.random() * variants.length);
            randomVariant = variants[randomIndex].title;
        }

        const promptData = {
            title: book.title,
            genre: book.genres?.[0]?.description ?? 'romance',
            variant: randomVariant,
            location: '',
            characters: '',
            trope_description: book.plots?.[0]?.description ?? '',
            chapter_summaries: book.plots?.[0]?.chapters?.map(c => c.description).join('; ') ?? ''
        };

        const { description, fullPrompt, rawContent } = await generateBookDescription(promptData);

        await BookGeneratedContent.create([{
            bookId: book._id,
            batchId: book.batchId,
            contentType: 'description',
            content: description,
            promptUsed: fullPrompt,
            rawApiResponse: rawContent,
            source: 'OpenAI-o3-mini'
        }], { session });

        book.description = description;
        book.generationStatus.description.status = 'completed';
        await book.save({ session });

        await session.commitTransaction();
        logger.info(`Successfully generated description for book: ${bookId}`);
    } catch (error) {
        await session.abortTransaction();
        logger.error(`Failed to generate description for book: ${bookId}`, error);
        await Book.findByIdAndUpdate(bookId, {
            'generationStatus.description.status': 'failed',
            'generationStatus.description.errorMessage': error.message || 'An unknown error occurred'
        });
        throw error;
    } finally {
        session.endSession();
    }
};

module.exports = { processBookTitleGeneration, processBookDescriptionGeneration };