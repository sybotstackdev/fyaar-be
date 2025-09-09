const { Queue } = require('bullmq');
const config = require('./environment');
const logger = require('../utils/logger');

const redisConnection = {
    host: config.redis.host || '127.0.0.1',
    port: config.redis.port || 6379,
    password: config.redis.password || undefined
};

logger.info(`Connecting to Redis at ${redisConnection.host}:${redisConnection.port}`);

const bookGenerationQueue = new Queue('book-generation', { connection: redisConnection });

bookGenerationQueue.on('error', err => {
    logger.error('BullMQ Queue Error:', err);
});

const bookReGenerationQueue = new Queue('re-book-generation', { connection: redisConnection });

bookReGenerationQueue.on('error', err => {
    logger.error('BullMQ Queue Error:', err);
});

module.exports = {
    bookGenerationQueue,
    bookReGenerationQueue
};
