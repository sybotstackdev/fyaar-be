const varientService = require('../services/variantsServices.js');
const { asyncHandler } = require('../middleware/errorHandler');
const ApiResponse = require('../utils/response');

const GetAllVariants = asyncHandler(async (req, res) => {
  const variant = await varientService.getVariants(req.query);
  return ApiResponse.created(res, 'Genre variants fetched successfully', variant);
});

const GetSingleVariant = asyncHandler(async (req, res) => {
  const variant = await varientService.getVariantById(req.params.variantId);
  return ApiResponse.created(res, 'variant fetched successfully', variant);
});

const createVarient = asyncHandler(async (req, res) => {
  const variant = await varientService.createVariant(req.body);
  return ApiResponse.created(res, 'variant created successfully', variant);
});

const updateVarient = asyncHandler(async (req, res) => {
  const { id: variantId } = req.params;
  const updatedVariant = await varientService.updateVariant(variantId, req.body);
  return ApiResponse.success(res, 200, 'variant updated successfully', updatedVariant);
});

const deleteVariant = asyncHandler(async (req, res) => {
  const { id: variantId } = req.params;
  const deletedVariant = await varientService.deleteVariant(variantId);
  return ApiResponse.success(res, 200, 'variant deleted successfully', deletedVariant);
});

module.exports = {
  GetAllVariants,
  GetSingleVariant,
  createVarient,
  updateVarient,
  deleteVariant
};