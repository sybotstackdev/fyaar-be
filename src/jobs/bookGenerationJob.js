const BookBatch = require('../models/bookBatchModel');
const Book = require('../models/bookModel');
const BookGeneratedContent = require('../models/bookGeneratedContentModel');
const BookChapter = require('../models/bookChapterModel');
const TagsModal = require('../models/tagModel.js')
const { generateBookTitles, generateBookDescription, generateBookChapters, OpenAIParseError, generateBookCoverPrompt, generateBookTags } = require('../services/ai/openAI');
const jobService = require('../services/jobService');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const { generateImage } = require('../services/ai/imageGeneration');

require('../models/genreModel');
require('../models/plotModel');
require('../models/chapterModel');
require('../models/locationModel');
require('../models/authorModel');
require('../models/narrativeModel');
require('../models/genreVariantModel');
require('../models/spiceLevelModel');
require('../models/endingModel');

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

                await session.commitTransaction();
                // --- Dispatch description job ---

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
                jobService.queueJob('generate-description', { bookId: book._id });
                logger.info(`Successfully generated and assigned title for book: ${book._id}. Queued description job.`);
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
    } finally {

    }
};

const regenerateBookTitles = async (batchId) => {
    logger.info(`Starting title re-generation for batch: ${batchId}`);

    const batch = await BookBatch.findById(batchId);
    if (!batch) {
        logger.error(`Batch not found for re-generation: ${batchId}`);
        return;
    }

    try {
        await batch.updateOne({ status: 'processing' });

        const booksToRegenerate = await Book.find({
            batchId,
            'generationStatus.title.status': { $ne: 'completed' } // 👈 not completed
        })
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

        for (const book of booksToRegenerate) {
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
                    const chaptersInfo = plot.chapters?.length
                        ? "\nChapters:\n" + plot.chapters.map(ch => `- ${ch.name}: ${ch?.description ?? ''}`).join('\n')
                        : "";
                    storyDescription = plotInfo + chaptersInfo;
                }

                const { parsedContent: titlesResponse, fullPrompt, rawContent } =
                    await generateBookTitles(storyDescription, genreLayer);

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

                // Clean up any old generated content for titles
                await BookGeneratedContent.deleteMany({ bookId: book._id, contentType: 'title' }, { session });

                await BookGeneratedContent.create([{
                    bookId: book._id,
                    batchId,
                    contentType: 'title',
                    promptUsed: fullPrompt,
                    titles: allTitles,
                    rawApiResponse: rawContent,
                    source: 'OpenAI-o3-mini'
                }], { session });

                book.title = selectedTitle;
                book.status = 'unpublished';
                book.generationStatus.title.status = 'completed';
                book.generationStatus.title.errorMessage = null;
                await book.save({ session });

                await session.commitTransaction();
                // Dispatch description job
                logger.info(`Re-generated and assigned title for book: ${book._id}. Queued description job.`);

            } catch (error) {
                await session.abortTransaction();
                logger.error(`Failed to re-generate titles for book: ${book._id} in batch: ${batchId}`, error);

                if (error instanceof OpenAIParseError) {
                    await BookGeneratedContent.create({
                        bookId: book._id,
                        batchId,
                        contentType: 'title',
                        promptUsed: error.prompt,
                        titles: [],
                        rawApiResponse: error.rawResponse
                    });
                }

                await Book.findByIdAndUpdate(book._id, {
                    status: 'unpublished',
                    'generationStatus.title.status': 'failed',
                    'generationStatus.title.errorMessage': error.message || 'An unknown error occurred during re-generation'
                });
            } finally {
                session.endSession();
            }
        }

        await batch.updateOne({ status: 'completed' });
        logger.info(`Title re-generation completed for batch: ${batchId}`);

    } catch (error) {
        logger.error(`Critical error during re-generation for batchId: ${batchId}`, error);
        await batch.updateOne({
            status: 'failed',
            errorMessage: error.message || 'Critical error stopped re-generation process.'
        });
        throw error;
    } finally {
        jobService.queueReJob('re-generate-description', { batchId: batchId });
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

    let bookWasFound = false; // Flag to ensure we don't queue jobs for non-existent books

    try {
        const book = await Book.findById(bookId)
            .populate({
                path: 'genres',
                select: 'description',
                populate: {
                    path: 'variants',
                    select: 'name'
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
        bookWasFound = true; // Set the flag now that we've found the book

        await book.updateOne({ 'generationStatus.description.status': 'in_progress' }, { session });

        const genre = book.genres?.[0];
        const variants = genre?.variants;


        let randomVariantName = '';
        let randomVariantId = null;

        if (variants && variants.length > 0) {
            const randomIndex = Math.floor(Math.random() * variants.length);
            const selectedVariant = variants[randomIndex];

            if (selectedVariant && selectedVariant.name) {
                randomVariantName = selectedVariant.name;
                randomVariantId = selectedVariant._id;
            }
        }

        const promptData = {
            title: book.title,
            genre: genre?.description ?? '',
            variant: randomVariantName,
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
            variantUsed: randomVariantId,
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
        if (bookWasFound) {
            jobService.queueJob('generate-chapters', { bookId: bookId });
            logger.info(`Queued chapter generation for book: ${bookId}`);
        }
        session.endSession();
    }
};

const regenerateBookDescriptions = async (batchId) => {
    logger.info(`🔄 Starting re-generation of descriptions for batch: ${batchId}`);

    const batch = await BookBatch.findById(batchId);
    if (!batch) {
        logger.error(`Batch not found for re-generation: ${batchId}`);
        return;
    }

    try {
        // Find only books where description is NOT completed
        const booksToRetry = await Book.find({
            batchId,
            'generationStatus.description.status': { $ne: 'completed' }
        })
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

        if (booksToRetry.length === 0) {
            logger.info(`✅ No books found with pending/failed description generation for batch: ${batchId}`);
            return;
        }

        for (const book of booksToRetry) {
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                logger.info(`Retrying description generation for book: ${book._id}`);

                await book.updateOne(
                    { 'generationStatus.description.status': 'in_progress' },
                    { session }
                );

                const genre = book.genres?.[0];
                const variants = genre?.variants;

                let randomVariantName = '';
                let randomVariantId = null;

                if (variants && variants.length > 0) {
                    const randomIndex = Math.floor(Math.random() * variants.length);
                    const selectedVariant = variants[randomIndex];

                    if (selectedVariant && selectedVariant.name) {
                        randomVariantName = selectedVariant.name;
                        randomVariantId = selectedVariant._id;
                    }
                }

                const promptData = {
                    title: book.title,
                    genre: genre?.description ?? '',
                    variant: randomVariantName,
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
                    variantUsed: randomVariantId,
                    source: 'OpenAI-o3-mini'
                }], { session });

                book.description = description;
                book.generationStatus.description.status = 'completed';
                await book.save({ session });

                await session.commitTransaction();
                logger.info(`✅ Successfully regenerated description for book: ${book._id}`);

            } catch (err) {
                await session.abortTransaction();
                logger.error(`❌ Re-generation failed for book ${book._id} in batch ${batchId}`, err);

                await Book.findByIdAndUpdate(book._id, {
                    'generationStatus.description.status': 'failed',
                    'generationStatus.description.errorMessage': err.message || 'An unknown error occurred'
                });
            } finally {
                session.endSession();
            }
        }

        logger.info(`🎉 Description re-generation completed for batch: ${batchId}`);
    } catch (error) {
        logger.error(`Critical error while retrying description generation for batch ${batchId}`, error);
        throw error;
    } finally {
        // ✅ Queue the next job after successful description regeneration
        jobService.queueReJob('re-generate-chapters', { batchId: batchId });
        logger.info(`Queued chapter generation for batch: ${batchId}`);
    }
};




/**
 * @desc Processes a single book to generate all its chapters using OpenAI
 * @param {string} bookId - The ID of the book to process
 */
const processBookChapterGeneration = async (bookId) => {
    logger.info(`Starting chapter generation for book: ${bookId}`);
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

        await book.updateOne({ 'generationStatus.chapters.status': 'in_progress' }, { session });

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

        await BookGeneratedContent.create({
            bookId: book._id,
            batchId: book.batchId,
            contentType: 'chapter',
            promptUsed: fullPrompt,
            rawApiResponse: rawContent,
            source: 'OpenAI-o3-mini'
        });

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
        logger.info(`Successfully generated ${newChapters.length} chapters for book: ${bookId}`);
    } catch (error) {
        await session.abortTransaction();
        logger.error(`Failed to generate chapters for book: ${bookId}`, error);
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
        if (bookWasFound) {
            jobService.queueJob('generate-cover', { bookId: bookId });
            logger.info(`Queued cover generation for book: ${bookId}`);
        }
        session.endSession();
    }

};


const regenerateBookChapters = async (batchId) => {
    logger.info(`🔄 Starting re-generation of chapters for batch: ${batchId}`);

    const batch = await BookBatch.findById(batchId);
    if (!batch) {
        logger.error(`❌ Batch not found for re-generation: ${batchId}`);
        return;
    }

    try {
        const booksToRetry = await Book.find({
            batchId,
            'generationStatus.chapters.status': { $ne: 'completed' }
        })
            .populate({
                path: 'plots',
                select: 'title description',
                populate: { path: 'chapters', select: 'name description order' }
            })
            .populate('narrative', 'description')
            .populate('spiceLevels', 'comboName description')
            .populate('endings', 'optionLabel');

        if (booksToRetry.length === 0) {
            logger.info(`✅ No retryable books found in batch: ${batchId}`);
            return;
        }

        for (const book of booksToRetry) {
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                logger.info(`🔄 Retrying chapter generation for book: ${book._id}`);

                await book.updateOne(
                    { 'generationStatus.chapters.status': 'in_progress' },
                    { session }
                );

                const plot = book.plots?.[0];
                if (!plot) throw new Error(`Plot not found for book: ${book._id}`);

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

                // 🔮 Generate chapters from LLM
                const { chaptersJSON, fullPrompt, rawContent } = await generateBookChapters(promptData);

                // Save raw payload
                await BookGeneratedContent.create({
                    bookId: book._id,
                    batchId: book.batchId,
                    contentType: 'chapter',
                    promptUsed: fullPrompt,
                    rawApiResponse: rawContent,
                    source: 'OpenAI-o3-mini'
                });

                // 🧹 Delete old chapters just before inserting new ones
                await BookChapter.deleteMany({ book: book._id }, { session });

                // Insert regenerated chapters
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
                logger.info(`✅ Successfully re-generated ${newChapters.length} chapters for book: ${book._id}`);


            } catch (err) {
                await session.abortTransaction();
                logger.error(`❌ Re-generation failed for book ${book._id}`, err);

                await Book.findByIdAndUpdate(book._id, {
                    'generationStatus.chapters.status': 'failed',
                    'generationStatus.chapters.errorMessage': err.message || 'An unknown error occurred'
                });

                if (err instanceof OpenAIParseError) {
                    try {
                        await BookGeneratedContent.create({
                            bookId: book._id,
                            batchId: book.batchId,
                            contentType: 'chapter',
                            promptUsed: err.prompt,
                            rawApiResponse: err.rawResponse,
                            source: 'OpenAI-o3-mini'
                        });
                    } catch (e) {
                        logger.warn('⚠️ Could not save parse-error payload:', e.message);
                    }
                }
            } finally {
                session.endSession();
            }
        }

        logger.info(`🎉 Chapter re-generation completed for batch: ${batchId}`);
    } catch (error) {
        logger.error(`🔥 Critical error during re-generation for batch ${batchId}`, error);
        throw error;
    } finally {
        // Queue re-cover job
        jobService.queueReJob('re-generate-cover', { batchId: batchId });
        logger.info(`📦 Queued re-cover generation for batch: ${batchId}`);
    }
};



/**
 * @desc Processes a single book to generate a cover using OpenAI
 * @param {*} bookId 
 */
const processBookCoverGeneration = async (bookId) => {
    logger.info(`Starting book cover generation for: ${bookId}`);
    const session = await mongoose.startSession();
    session.startTransaction();

    let bookWasFound = false;

    try {
        const book = await Book.findById(bookId)
            .populate({
                path: 'plots',
                select: 'description',
                populate: { path: 'chapters', select: 'description' }
            })
            .populate('genres', 'description')
            .populate('authors', 'authorName writingStyle designStyle')
            .populate('spiceLevels', 'comboName description')
            .populate('endings', 'optionLabel');

        if (!book) {
            throw new Error(`Book with ID ${bookId} not found.`);
        }
        bookWasFound = true;

        await book.updateOne({ 'generationStatus.cover.status': 'in_progress_prompt' }, { session });

        const promptData = {
            trope_description: book.plots?.[0]?.description ?? '',
            chapter_summaries: book.plots?.[0]?.chapters?.map(c => c.description).join('; ') ?? '',
            ending_type: book.endings?.[0]?.optionLabel ?? '',
            spice_level: book.spiceLevels?.[0]?.description ?? ''
        };

        const { description, fullPrompt, rawContent } = await generateBookCoverPrompt(promptData);
        logger.info(`Prompt description: ${JSON.stringify(description)}`);

        const authorName = book.authors?.[0]?.authorName ?? '';
        const designStyle = book.authors?.[0]?.designStyle ?? '';
        const genreDesc = book.genres?.[0]?.description ?? '';

        const coverPrompt = `Design a book cover with the title "${book.title}" at the top and the author "${authorName}" at the bottom. Depict ${description}. Apply ${designStyle} (this includes both artwork style and typography direction). Apply ${genreDesc}.`
            .replace(/\s+/g, ' ').trim();

        await book.updateOne({ 'generationStatus.cover.status': 'in_progress' }, { session });
        const { ideogramUrl, s3Url } = await generateImage(coverPrompt);

        await BookGeneratedContent.create([{
            bookId: book._id,
            batchId: book.batchId,
            contentType: 'cover_image_url',
            content: s3Url,
            promptUsed: coverPrompt,
            rawApiResponse: JSON.stringify({ ideogramUrl, s3Url }),
            source: 'Ideogram'
        }], { session });

        book.bookCover = s3Url;
        book.generationStatus.cover.status = 'completed';
        await book.save({ session });

        await session.commitTransaction();
        logger.info(`Successfully generated cover for book: ${bookId} | S3: ${s3Url}`);
    } catch (error) {
        await session.abortTransaction();
        logger.error(`Failed to generate cover for book: ${bookId}`, error);

        if (bookWasFound) {
            await Book.findByIdAndUpdate(bookId, {
                'generationStatus.cover.status': 'failed',
                'generationStatus.cover.errorMessage': error.message || 'An unknown error occurred'
            });
        }
        throw error;
    } finally {
        jobService.queueJob('generate-tags', { bookId: bookId });
        logger.info(`📦 Queued tags generation for Book: ${bookId}`);
        session.endSession();
    }
};


const regenerateBookCovers = async (batchId) => {
    logger.info(`🔄 Starting re-generation of book covers for batch: ${batchId}`);

    const batch = await BookBatch.findById(batchId);
    if (!batch) {
        logger.error(`Batch not found for re-generation: ${batchId}`);
        return;
    }

    try {
        // Find books where cover generation has not completed
        const booksToRetry = await Book.find({
            batchId,
            'generationStatus.cover.status': { $ne: 'completed' }
        })
            .populate({
                path: 'plots',
                select: 'description',
                populate: { path: 'chapters', select: 'description' }
            })
            .populate('genres', 'description')
            .populate('authors', 'authorName writingStyle designStyle')
            .populate('spiceLevels', 'comboName description')
            .populate('endings', 'optionLabel');

        if (booksToRetry.length === 0) {
            logger.info(`✅ No books found with pending/failed cover generation in batch: ${batchId}`);
            return;
        }

        for (const book of booksToRetry) {
            const session = await mongoose.startSession();
            session.startTransaction();

            let bookWasFound = true;

            try {
                logger.info(`Retrying cover generation for book: ${book._id}`);

                await book.updateOne(
                    { 'generationStatus.cover.status': 'in_progress_prompt' },
                    { session }
                );

                const promptData = {
                    trope_description: book.plots?.[0]?.description ?? '',
                    chapter_summaries: book.plots?.[0]?.chapters?.map(c => c.description).join('; ') ?? '',
                    ending_type: book.endings?.[0]?.optionLabel ?? '',
                    spice_level: book.spiceLevels?.[0]?.description ?? ''
                };

                const { description, fullPrompt, rawContent } = await generateBookCoverPrompt(promptData);
                logger.info(`Prompt description: ${JSON.stringify(description)}`);

                const authorName = book.authors?.[0]?.authorName ?? '';
                const designStyle = book.authors?.[0]?.designStyle ?? '';
                const genreDesc = book.genres?.[0]?.description ?? '';

                const coverPrompt = `Design a book cover with the title "${book.title}" at the top and the author "${authorName}" at the bottom. Depict ${description}. Apply ${designStyle} (this includes both artwork style and typography direction). Apply ${genreDesc}.`
                    .replace(/\s+/g, ' ')
                    .trim();

                await book.updateOne(
                    { 'generationStatus.cover.status': 'in_progress' },
                    { session }
                );

                const { ideogramUrl, s3Url } = await generateImage(coverPrompt);

                await BookGeneratedContent.create([{
                    bookId: book._id,
                    batchId: book.batchId,
                    contentType: 'cover_image_url',
                    content: s3Url,
                    promptUsed: coverPrompt,
                    rawApiResponse: JSON.stringify({ ideogramUrl, s3Url }),
                    source: 'Ideogram'
                }], { session });

                book.bookCover = s3Url;
                book.generationStatus.cover.status = 'completed';
                await book.save({ session });

                await session.commitTransaction();
                logger.info(`✅ Successfully regenerated cover for book: ${book._id} | S3: ${s3Url}`);
            } catch (err) {
                await session.abortTransaction();
                logger.error(`❌ Re-generation failed for book ${book._id} in batch ${batchId}`, err);

                if (bookWasFound) {
                    await Book.findByIdAndUpdate(book._id, {
                        'generationStatus.cover.status': 'failed',
                        'generationStatus.cover.errorMessage': err.message || 'An unknown error occurred'
                    });
                }
            } finally {
                session.endSession();
            }
        }

        logger.info(`🎉 Cover re-generation completed for batch: ${batchId}`);
    } catch (error) {
        logger.error(`Critical error while retrying cover generation for batch ${batchId}`, error);
        throw error;
    } finally {
        jobService.queueReJob('re-generate-tags', { batchId: batchId });
        logger.info(`📦 Queued re-tags generation for batch: ${batchId}`);
    }
};

/**
 * @desc Processes book tags generation using OpenAI
 * @param {string} bookId - The ID of the book to process
 */
const processBookTagsGeneration = async (bookId) => {
    logger.info(`Starting tags generation for book: ${bookId}`);

    const book = await Book.findById(bookId)
        .populate({ path: 'genres', select: 'description' })
        .populate({ path: 'spiceLevels', select: 'description' })
        .populate({ path: 'endings', select: 'description' })
        .populate({
            path: 'plots',
            select: 'title description',
            populate: {
                path: 'chapters',
                select: 'name description'
            }
        });

    if (!book) {
        logger.error(`Book not found for tag generation: ${bookId}`);
        return;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await book.updateOne(
            { 'generationStatus.tags.status': 'in_progress' },
            { session }
        );

        const genre = book.genres?.[0];
        const spice = book.spiceLevels?.[0];
        const ending = book.endings?.[0];
        const plot = book.plots?.[0];

        const genreLayer = genre?.description ?? '';
        const spiceLevel = spice?.description ?? '';
        const endingDesc = ending?.description ?? '';

        let storyDescription = '';
        if (plot) {
            const plotInfo = `Troop Title: ${plot.title}\nTroop Description: ${plot?.description ?? ''}`;
            const chaptersInfo = plot.chapters?.length
                ? "\nChapters:\n" + plot.chapters.map(ch => `- ${ch.name}: ${ch?.description ?? ''}`).join('\n')
                : "";
            storyDescription = plotInfo + chaptersInfo;
        }

        // 🔥 Call LLM for tags
        const { parsedContent, fullPrompt, rawContent } = await generateBookTags(
            storyDescription,
            genreLayer,
            spiceLevel,
            endingDesc
        );

        const tags = parsedContent?.tags ?? [];
        if (!Array.isArray(tags) || tags.length === 0) {
            throw new Error('OpenAI response did not contain any tags.');
        }

        const savedTagIds = [];

        for (const tagName of tags) {
            const normalizedTag = tagName.trim().toLowerCase();

            // Find existing tag or create new one atomically
            const tag = await TagsModal.findOneAndUpdate(
                { name: tagName },
                { name: tagName },
                { new: true, upsert: true, session }
            );

            // Avoid duplicate references in book.tags
            if (!book.tags.includes(tag._id)) {
                book.tags.push(tag._id);
            }

            savedTagIds.push(tag._id);
        }

        book.generationStatus.tags.status = "completed";
        await book.save({ session });

        // Store LLM response
        await BookGeneratedContent.create([{
            bookId: book._id,
            batchId: book.batchId,
            contentType: 'tag',
            promptUsed: fullPrompt,
            tags,
            rawApiResponse: rawContent,
            source: 'OpenAI-o3-mini'
        }], { session });

        await session.commitTransaction();
        logger.info(`Tags generated successfully for book: ${book._id}`);

    } catch (error) {
        await session.abortTransaction();
        logger.error(`Failed to generate tags for book: ${book._id}`, error);

        if (error instanceof OpenAIParseError) {
            await BookGeneratedContent.create({
                bookId: book._id,
                batchId: book.batchId,
                contentType: 'tags',
                promptUsed: error.prompt,
                tags: [],
                rawApiResponse: error.rawResponse
            });
        }

        await Book.findByIdAndUpdate(book._id, {
            'generationStatus.tags.status': 'failed',
            'generationStatus.tags.errorMessage': error.message || 'An unknown error occurred'
        });
    } finally {
        session.endSession();
    }
};

/**
 * @desc Re-generates book tags for a given batch
 * @param {string} batchId - The ID of the batch
 */
const regenerateBookTags = async (batchId) => {
    logger.info(`🔄 Starting re-generation of book tags for batch: ${batchId}`);

    const batch = await BookBatch.findById(batchId);
    if (!batch) {
        logger.error(`Batch not found for re-generation: ${batchId}`);
        return;
    }

    try {
        const booksToRetry = await Book.find({
            batchId,
            'generationStatus.tags.status': { $ne: 'completed' }
        })
            .populate({ path: 'genres', select: 'description' })
            .populate({ path: 'spiceLevels', select: 'description' })
            .populate({ path: 'endings', select: 'description' })
            .populate({
                path: 'plots',
                select: 'title description',
                populate: { path: 'chapters', select: 'name description' }
            });

        if (booksToRetry.length === 0) {
            logger.info(`✅ No books found with pending/failed tags generation in batch: ${batchId}`);
            return;
        }

        for (const book of booksToRetry) {
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                logger.info(`Retrying tags generation for book: ${book._id}`);

                await book.updateOne(
                    { 'generationStatus.tags.status': 'in_progress' },
                    { session }
                );

                const genre = book.genres?.[0];
                const spice = book.spiceLevels?.[0];
                const ending = book.endings?.[0];
                const plot = book.plots?.[0];

                const genreLayer = genre?.description ?? '';
                const spiceLevel = spice?.description ?? '';
                const endingDesc = ending?.description ?? '';

                let storyDescription = '';
                if (plot) {
                    const plotInfo = `Troop Title: ${plot.title}\nTroop Description: ${plot?.description ?? ''}`;
                    const chaptersInfo = plot.chapters?.length
                        ? "\nChapters:\n" + plot.chapters.map(ch => `- ${ch.name}: ${ch?.description ?? ''}`).join('\n')
                        : "";
                    storyDescription = plotInfo + chaptersInfo;
                }

                // Call LLM for tags
                const { parsedContent, fullPrompt, rawContent } = await generateBookTags(
                    storyDescription,
                    genreLayer,
                    spiceLevel,
                    endingDesc
                );

                const tags = parsedContent?.tags ?? [];
                if (!Array.isArray(tags) || tags.length === 0) {
                    throw new Error('OpenAI response did not contain any tags.');
                }

                const savedTagIds = [];

                for (const tagName of tags) {
                    const normalizedTag = tagName.trim().toLowerCase();

                    // Find existing tag or create new one atomically
                    const tag = await TagsModal.findOneAndUpdate(
                        { name: tagName },
                        { name: tagName },
                        { new: true, upsert: true, session }
                    );

                    // Avoid duplicate references in book.tags
                    if (!book.tags.includes(tag._id)) {
                        book.tags.push(tag._id);
                    }

                    savedTagIds.push(tag._id);
                }

                book.generationStatus.tags.status = "completed";
                await book.save({ session });

                // Store LLM response
                await BookGeneratedContent.create([{
                    bookId: book._id,
                    batchId: book.batchId,
                    contentType: 'tag',
                    promptUsed: fullPrompt,
                    tags,
                    rawApiResponse: rawContent,
                    source: 'OpenAI-o3-mini'
                }], { session });

                await session.commitTransaction();
                logger.info(`✅ Successfully regenerated tags for book: ${book._id}`);

            } catch (err) {
                await session.abortTransaction();
                logger.error(`❌ Re-generation failed for book ${book._id} in batch ${batchId}`, err);

                await Book.findByIdAndUpdate(book._id, {
                    'generationStatus.tags.status': 'failed',
                    'generationStatus.tags.errorMessage': err.message || 'An unknown error occurred'
                });
            } finally {
                session.endSession();
            }
        }

        logger.info(`🎉 Tags re-generation completed for batch: ${batchId}`);
    } catch (error) {
        logger.error(`Critical error while retrying tags generation for batch ${batchId}`, error);
        throw error;
    }
};







module.exports = { processBookTitleGeneration, processBookDescriptionGeneration, processBookChapterGeneration, processBookCoverGeneration, processBookTagsGeneration, regenerateBookTitles, regenerateBookDescriptions, regenerateBookCovers, regenerateBookChapters, regenerateBookTags };