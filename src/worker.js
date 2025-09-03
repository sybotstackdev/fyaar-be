require('dotenv').config();
const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const config = require('./config/environment');
const logger = require('./utils/logger');
const { processBookTitleGeneration } = require('./jobs/bookGenerationJob');

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
    }
}, { connection: redisConnection });

worker.on('completed', job => {
    logger.info(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} has failed with error:`, err.message);
});