require('dotenv').config();
const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const config = require('./config/environment');
const logger = require('./utils/logger');
const { processBookTitleGeneration, processBookDescriptionGeneration, processBookChapterGeneration, processBookCoverGeneration, regenerateBookTitles, regenerateBookDescriptions, regenerateBookChapters, regenerateBookCovers, regenerateBookTags, processBookTagsGeneration } = require('./jobs/bookGenerationJob');

const redisConnection = {
    host: config.redis.host || '127.0.0.1',
    port: config.redis.port || 6379,
    password: config.redis.password || undefined
};

mongoose.connect(config.mongo.uri)      
    .then(() => logger.info('Worker connected to MongoDB'))
    .catch(err => {
        logger.error('Worker failed to connect to MongoDB', err);
        process.exit(1);
    }); 

logger.info('Starting BullMQ worker...');

const worker = new Worker('book-generation', async job => {
    logger.info(`Processing job '${job.name}' with ID ${job.id}`);
    if (job.name === 'generate-titles') {
        await processBookTitleGeneration(job.data.batchId);
    } else if (job.name === 'generate-description') {
        await processBookDescriptionGeneration(job.data.bookId);
    } else if (job.name === 'generate-chapters') {
        await processBookChapterGeneration(job.data.bookId);
    } else if(job.name === 'generate-cover') {
        await processBookCoverGeneration(job.data.bookId);
    }  else if(job.name === 'generate-tags') {
        await processBookTagsGeneration(job.data.bookId)
    }
}, {
    connection: redisConnection,
    concurrency: 5
});

worker.on('completed', job => {
    logger.info(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} has failed with error:`, err.message);
});


const Newworker = new Worker('re-book-generation', async job => {
    
    logger.info(`Processing job '${job.name}' with ID ${job.id} and data : ${job.data}`);
    if (job.name === 're-generate-titles') {
        await regenerateBookTitles(job.data.batchId);
    } else if (job.name === 're-generate-description') {
        await regenerateBookDescriptions(job.data.batchId);
    } else if (job.name === 're-generate-chapters') {
        await regenerateBookChapters(job.data.batchId);
    } else if(job.name === 're-generate-cover') {
        await regenerateBookCovers(job.data.batchId);
    } else if(job.name === 're-generate-tags') {
        await regenerateBookTags(job.data.batchId)
    }
}, {
    connection: redisConnection,
    concurrency: 5
});

Newworker.on('completed', job => {
    logger.info(`Job ${job.id} has completed!`);
});

Newworker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} has failed with error:`, err.message);
});