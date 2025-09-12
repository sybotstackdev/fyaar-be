const Variant = require('../models/genreVariantModel');
const Genre = require('../models/genreModel');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const checkGenreExists = async (genreId) => {
  const genre = await Genre.findById(genreId);
  if (!genre) {
    throw new ApiError(404, 'Parent genre not found');
  }
};

const getVariants = async (params) => {
  try {
    const { page = 1, limit = 10, search = "", filter } = params;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" }; // optional search
    }

    if (filter) {
      query.relation = { $in: [filter] }
    }

    const skip = (page - 1) * limit;

    // Fetch paginated data
    const variants = await Variant.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Total count for pagination
    const total = await Variant.countDocuments(query);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: variants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages,
        hasNext,
        hasPrev
      },
    };
  } catch (error) {
    throw new Error("Error fetching genre variants: " + error.message);
  }
};

const getVariantById = async (variantId) => {
  const variant = await Variant.findOne({ _id: variantId });
  if (!variant) {
    throw new ApiError(404, 'Genre variant not found or does not belong to this genre');
  }
  return variant;
};

const findVariantById = async (variantId) => {
  const variant = await Variant.findOne({ _id: variantId });
  if (!variant) {
    throw new ApiError(404, 'Genre variant not found or does not belong to this genre');
  }
  return variant;
};

const createVariant = async (variantData) => {

  const newVariant = new Variant({
    ...variantData
  });

  await newVariant.save();
  return newVariant;
};

const updateVariant = async (variantId, updateData) => {
  const variant = await findVariantById(variantId);

  Object.assign(variant, updateData);
  await variant.save();

  logger.info(`Genre variant ${variantId} updated`);
  return variant;
};

const deleteVariant = async (variantId) => {
  const variant = await findVariantById(variantId);
  await variant.deleteOne();
  logger.info(`Genre variant ${variantId} deleted`);
  return null;
};

module.exports = {
  getVariants,
  createVariant,
  updateVariant,
  deleteVariant,
  getVariantById
};