const genreVariantService = require('../services/genreVariantService');
const { asyncHandler } = require('../middleware/errorHandler');
const ApiResponse = require('../utils/response');

const createGenreVariant = asyncHandler(async (req, res) => {
  const { genreId } = req.params;
  const variant = await genreVariantService.createGenreVariant(genreId, req.body);
  return ApiResponse.created(res, 'Genre variant created successfully', variant);
});

const updateGenreVariant = asyncHandler(async (req, res) => {
  const { genreId, id: variantId } = req.params;
  const updatedVariant = await genreVariantService.updateGenreVariant(genreId, variantId, req.body);
  return ApiResponse.success(res, 200, 'Genre variant updated successfully', updatedVariant);
});

const deleteGenreVariant = asyncHandler(async (req, res) => {
  const { genreId, id: variantId } = req.params;
  const deletedVariant = await genreVariantService.deleteGenreVariant(genreId, variantId);
  return ApiResponse.success(res, 200, 'Genre variant deleted successfully', deletedVariant);
});

module.exports = {
  createGenreVariant,
  updateGenreVariant,
  deleteGenreVariant
};