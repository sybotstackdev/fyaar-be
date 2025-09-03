const { bookGenerationQueue } = require('../config/queue');
const logger = require('../utils/logger');

/**
 * @desc Add a job to the book generation queue.
 * @param {string} jobName - The name of the job to add (e.g., 'generate-titles').
 * @param {Object} data - The data for the job.
 */
const queueJob = async (jobName, data) => {
    logger.info(`Adding job '${jobName}' to queue with data:`, data);
    await bookGenerationQueue.add(jobName, data, {
        attempts: 1,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    });
};

module.exports = {
    queueJob
};