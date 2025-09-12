const GenreVariant = require('../models/genreVariantModel');
const Genre = require('../models/genreModel');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const getGenreVariants = async (params) => {
  try {
    const { page = 1, limit = 10, search = "" } = params;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" }; // optional search
    }

    const skip = (page - 1) * limit;

    // Fetch paginated data
    const variants = await GenreVariant.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Total count for pagination
    const total = await GenreVariant.countDocuments(query);

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


module.exports = {
  getGenreVariants,
};