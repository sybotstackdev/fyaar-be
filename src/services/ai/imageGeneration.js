require('dotenv').config();
const axios = require('axios');
const config = require('../../config/environment');
const logger = require('../../utils/logger');
const ApiError = require('../../utils/ApiError');
const { uploadToS3 } = require('../fileUploadService');

if (!config.ideogram || !config.ideogram.apiKey) {
  logger.error('Ideogram API key is not configured in environment.js');
  throw new Error('Ideogram API key is not configured.');
}

const ideogramApi = axios.create({
  baseURL: 'https://api.ideogram.ai/v1',
  headers: {
    'Api-Key': config.ideogram.apiKey
  }
});


/**
 * Generate an image using the Ideogram API.
 * @param {string} prompt - The prompt to generate the image from.
 * @returns {Promise<{ideogramUrl: string, s3Url: string}>} The URL of the generated image from Ideogram and the URL after saving to S3.
 */
const generateImage = async (prompt) => {
  try {
    logger.info(`Starting image generation for prompt: ${prompt}`);

    const { data } = await ideogramApi.post('/ideogram-v3/generate', {
      prompt: prompt,
      aspect_ratio: "2x3",
      magic_prompt: "ON",
      negative_prompt: "Do *not* include any other text on the cover besides the title and author name. Avoid filler taglines, series names, or fake blurbs — keep it clean and typography-focused."
    });
    logger.info(`Ideogram API response: ${data}`);

    const ideogramUrl = data?.data?.[0]?.url || null;

    if (!ideogramUrl) {
      logger.error('Unexpected Ideogram response shape:', JSON.stringify(data));
      throw new ApiError(502, 'Ideogram did not return an image URL.');
    }

    logger.info(`Ideogram returned URL: ${ideogramUrl}`);

    const imgResp = await axios.get(ideogramUrl, { responseType: 'arraybuffer', timeout: 60_000 });
    const buffer = Buffer.from(imgResp.data);

    const s3Url = await uploadToS3({ buffer }, 'book-covers');
    logger.info(`Uploaded generated cover to S3: ${s3Url}`);

    return { ideogramUrl, s3Url };

  } catch (err) {
    const msg = err?.response?.data || err?.message || err;
    logger.error('Error in generateImage (Ideogram -> S3):', msg);
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, 'Image generation/upload failed.');
  }
};

module.exports = {
  generateImage
};
