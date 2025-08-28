const GenreVariant = require('../models/genreVariantModel');
const Genre = require('../models/genreModel');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const checkGenreExists = async (genreId) => {
  const genre = await Genre.findById(genreId);
  if (!genre) {
    throw new ApiError(404, 'Parent genre not found');
  }
};

const getVariantById = async (genreId, variantId) => {
  await checkGenreExists(genreId);
  const variant = await GenreVariant.findOne({ _id: variantId, genre: genreId });
  if (!variant) {
    throw new ApiError(404, 'Genre variant not found or does not belong to this genre');
  }
  return variant;
};

const createGenreVariant = async (genreId, variantData) => {
  await checkGenreExists(genreId);

  const newVariant = new GenreVariant({
    ...variantData,
    genre: genreId // Set genre from the URL parameter
  });

  await newVariant.save();
  logger.info(`New genre variant created for genre ${genreId}`);
  return newVariant;
};

const updateGenreVariant = async (genreId, variantId, updateData) => {
  const variant = await getVariantById(genreId, variantId);

  Object.assign(variant, updateData);
  await variant.save();

  logger.info(`Genre variant ${variantId} updated`);
  return variant;
};

const deleteGenreVariant = async (genreId, variantId) => {
  const variant = await getVariantById(genreId, variantId);
  await variant.deleteOne();
  logger.info(`Genre variant ${variantId} deleted`);
  return null;
};

module.exports = {
  createGenreVariant,
  updateGenreVariant,
  deleteGenreVariant,
  getVariantById
};