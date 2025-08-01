const Genre = require('../models/genreModel');
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
      throw new Error('Genre with this title already exists');
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
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search = '',
      isActive = ''
    } = options;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [genres, total] = await Promise.all([
      Genre.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Genre.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      results: genres.map(genre => genre.getPublicProfile()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    logger.error('Get all genres error:', error.message);
    throw error;
  }
};

/**
 * Get genre by ID
 * @param {string} genreId - Genre ID
 * @returns {Object} Genre profile
 */
const getGenreById = async (genreId) => {
  try {
    const genre = await Genre.findById(genreId);
    
    if (!genre) {
      throw new Error('Genre not found');
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
      throw new Error('Genre not found');
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
    if (updateData.title) {
      const existingGenre = await Genre.findOne({ 
        title: updateData.title, 
        _id: { $ne: genreId } 
      });
      if (existingGenre) {
        throw new Error('Genre with this title already exists');
      }
    }

    const genre = await Genre.findByIdAndUpdate(
      genreId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!genre) {
      throw new Error('Genre not found');
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
      throw new Error('Genre not found');
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