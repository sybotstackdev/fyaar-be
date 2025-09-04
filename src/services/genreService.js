const Genre = require('../models/genreModel');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Create a new genre
 * @param {Object} genreData - Genre data
 * @returns {Object} Created genre
 */
const createGenre = async (genreData) => {
  try {
    // Check if genre with same title already exists
    const existingGenre = await Genre.findOne({ title: genreData.title });
    if (existingGenre) {
      throw new ApiError(400, 'Genre with this title already exists');
    }

    // Create new genre
    const genre = new Genre(genreData);
    await genre.save();

    logger.info(`New genre created: ${genre.title}`);

    return genre.getPublicProfile();
  } catch (error) {
    logger.error('Create genre error:', error.message);
    throw error;
  }
};

/**
 * Get all genres with pagination
 * @param {Object} options - Pagination and filter options
 * @returns {Object} Genres and pagination info
 */
const getAllGenres = async (options = {}) => {
  try {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const sortWhitelist = ['createdAt', 'title', 'usage_count'];
    const sort = sortWhitelist.includes(options.sort) ? options.sort : 'createdAt';
    const order = options.order === 'asc' ? 1 : -1;
    const { search = '', isActive = '' } = options;

    const matchQuery = {};
    if (search) {
      matchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== '') {
      matchQuery.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;
    let genres;
    let total;

    if (sort === 'usage_count') {
      const pipeline = [
        { $match: matchQuery },
        {
          $lookup: {
            from: 'books',
            localField: '_id',
            foreignField: 'genres',
            as: 'books',
          },
        },
        {
          $addFields: {
            usage_count: { $size: '$books' },
          },
        },
        { $sort: { [sort]: order } },
        {
          $facet: {
            results: [
              { $skip: skip },
              { $limit: limit },
              { $project: { books: 0, __v: 0 } }
            ],
            totalCount: [{ $count: 'count' }],
          },
        },
      ];

      const result = await Genre.aggregate(pipeline);
      genres = result[0].results;
      total = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
    } else {
      const [genreDocs, totalDocs] = await Promise.all([
        Genre.find(matchQuery)
          .sort({ [sort]: order })
          .skip(skip)
          .limit(limit),
        Genre.countDocuments(matchQuery),
      ]);
      total = totalDocs;
      genres = genreDocs.map(doc => doc.getPublicProfile());
    }

    const totalPages = Math.ceil(total / limit);

    return {
      results: genres,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    logger.error('Get all genres error:', error.message);
    throw error;
  }
};

/**
 * Get genre by ID
 * @param {string} genreId - Genre ID
 * @returns {Object} Genre
 */
const getGenreById = async (genreId) => {
  try {
    // Add .populate('variants') to fetch the related variants
    const genre = await Genre.findById(genreId).populate('variants');

    if (!genre) {
      throw new ApiError(404, 'Genre not found');
    }

    return genre.getPublicProfile();
  } catch (error) {
    logger.error('Get genre by ID error:', error.message);
    throw error;
  }
};

/**
 * Get genre by slug
 * @param {string} slug - Genre slug
 * @returns {Object} Genre profile
 */
const getGenreBySlug = async (slug) => {
  try {
    const genre = await Genre.findBySlug(slug);

    if (!genre) {
      throw new ApiError(404, 'Genre not found');
    }

    return genre.getPublicProfile();
  } catch (error) {
    logger.error('Get genre by slug error:', error.message);
    throw error;
  }
};

/**
 * Update genre
 * @param {string} genreId - Genre ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated genre profile
 */
const updateGenre = async (genreId, updateData) => {
  try {
    // Check if title is being updated and if it already exists
    if (updateData?.title) {
      const existingGenre = await Genre.findOne({
        title: updateData.title,
        _id: { $ne: genreId }
      });
      if (existingGenre) {
        throw new ApiError(400, 'Genre with this title already exists');
      }
    }

    const genre = await Genre.findByIdAndUpdate(
      genreId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!genre) {
      throw new ApiError(404, 'Genre not found');
    }

    logger.info(`Genre updated: ${genre.title}`);

    return genre.getPublicProfile();
  } catch (error) {
    logger.error('Update genre error:', error.message);
    throw error;
  }
};

/**
 * Delete genre
 * @param {string} genreId - Genre ID
 * @returns {boolean} Success status
 */
const deleteGenre = async (genreId) => {
  try {
    const genre = await Genre.findByIdAndDelete(genreId);

    if (!genre) {
      throw new ApiError(404, 'Genre not found');
    }

    logger.info(`Genre deleted: ${genre.title}`);

    return true;
  } catch (error) {
    logger.error('Delete genre error:', error.message);
    throw error;
  }
};


module.exports = {
  createGenre,
  getAllGenres,
  getGenreById,
  getGenreBySlug,
  updateGenre,
  deleteGenre,
}; 