const axios = require('axios');
const config = require('../../config/environment');
const logger = require('../../utils/logger');
const ApiError = require('../../utils/ApiError');

if (!config.ideogram || !config.ideogram.apiKey) {
  logger.error('Ideogram API key is not configured in environment.js');
  throw new Error('Ideogram API key is not configured.');
}

const ideogramApi = axios.create({
  baseURL: 'https://api.ideogram.ai/v1',
  headers: {
    Authorization: `Bearer ${config.ideogram.apiKey}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Polls the Ideogram API for the result of an image generation job.
 * @param {string} requestId - The request ID of the generation job.
 * @returns {Promise<string>} The URL of the generated image.
 */
const pollForResult = async (requestId) => {
  const pollInterval = 2000; // 2 seconds
  const maxAttempts = 30; // 1 minute timeout

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      logger.info(`Polling for request ID: ${requestId} (Attempt ${attempt + 1})`);
      const response = await ideogramApi.get(`/images/generations/${requestId}`);
      const { state, images } = response.data;

      if (state === 'completed') {
        if (images && images.length > 0 && images[0].url) {
          logger.info(`Image generation completed for request ID: ${requestId}`);
          return images[0].url;
        } else {
          throw new Error('Generation completed but no image URL was found.');
        }
      } else if (state !== 'pending' && state !== 'processing') {
        throw new Error(`Image generation failed with state: ${state}`);
      }
    } catch (error) {
      logger.error(`Error polling for Ideogram result for request ID ${requestId}:`, error.message);
      throw new ApiError(500, 'Failed to poll for image generation result.');
    }
  }

  throw new ApiError(408, 'Image generation timed out.');
};

/**
 * Generate an image using the Ideogram API.
 * @param {string} prompt - The prompt to generate the image from.
 * @returns {Promise<string>} The URL of the generated image.
 */
const generateImage = async (prompt) => {
  try {
    logger.info('Sending image generation request to Ideogram...');
    const response = await ideogramApi.post('/images/generations', {
      prompt
    });

    const requestId = response.data.request_id;
    if (!requestId) {
      throw new Error('No request_id returned from Ideogram.');
    }

    logger.info(`Ideogram generation started with request ID: ${requestId}`);
    return await pollForResult(requestId);
  } catch (error) {
    logger.error('Error generating image from Ideogram:', error.response ? error.response.data : error.message);
    throw new ApiError(500, 'Failed to generate image from Ideogram.');
  }
};

module.exports = {
  generateImage
};
