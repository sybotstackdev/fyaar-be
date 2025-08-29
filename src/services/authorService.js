const Author = require('../models/authorModel');
const logger = require('../utils/logger');
const Genre = require('../models/genreModel');
const ApiError = require('../utils/ApiError');

/**
 * Create a new author
 * @param {Object} authorData - Author data
 * @returns {Object} Created author
 */
const createAuthor = async (authorData) => {
  try {

    // Validate that the genre exists
    const genre = await Genre.findById(authorData.genre);
    if (!genre) {
      throw new ApiError(404, 'Genre not found');
    }

    // Check if author name already exists
    const existingAuthor = await Author.nameExists(authorData.authorName);
    if (existingAuthor) {
      throw new ApiError(400, 'Author name already exists');
    }

    // Create new author
    const author = new Author(authorData);
    await author.save();

    logger.info(`New author created: ${author.authorName}`);
    const populatedAuthor = await Author.findById(author._id).populate('genre', 'title');
    return populatedAuthor;
  } catch (error) {
    logger.error('Author creation error:', error.message);
    throw error;
  }
};

/**
 * Get all authors with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Object} Authors and pagination info
 */
const getAllAuthors = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search = '',
      genre = '',
      isActive = ''
    } = options;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { authorName: { $regex: search, $options: 'i' } },
        { writingStyle: { $regex: search, $options: 'i' } },
        { designStyle: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    if (genre) {
      query.genre = genre;
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query
    const authors = await Author.find(query)
      .populate('genre', 'title')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Author.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    logger.info(`Retrieved ${authors.length} authors`);

    return {
      results: authors,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    };
  } catch (error) {
    logger.error('Get all authors error:', error.message);
    throw error;
  }
};

/**
 * Get author by ID
 * @param {string} authorId - Author ID
 * @returns {Object} Author
 */
const getAuthorById = async (authorId) => {
  try {
    const author = await Author.findById(authorId).populate('genre', 'title');

    if (!author) {
      throw new ApiError(404, 'Author not found');
    }

    return author;
  } catch (error) {
    logger.error('Get author by ID error:', error.message);
    throw error;
  }
};

/**
 * Update author
 * @param {string} authorId - Author ID
 * @param {Object} updateData - Update data
 * @returns {Object} Updated author
 */
const updateAuthor = async (authorId, updateData) => {
  try {
    const author = await Author.findById(authorId);

    if (!author) {
      throw new ApiError(404, 'Author not found');
    }

    // If genre is being updated, validate it exists
    if (updateData.genre) {
      const genre = await Genre.findById(updateData.genre);
      if (!genre) {
        throw new ApiError(404, 'Genre not found');
      }
    }

    // Check if new author name conflicts with existing authors
    if (updateData.authorName && updateData.authorName !== author.authorName) {
      const existingAuthor = await Author.findOne({
        authorName: { $regex: updateData.authorName, $options: 'i' },
        _id: { $ne: authorId }
      });
      if (existingAuthor) {
        throw new ApiError(400, 'Author name already exists');
      }
    }

    // Update author
    Object.assign(author, updateData);
    await author.save();

    logger.info(`Author updated: ${author.authorName}`);

    const populatedAuthor = await Author.findById(author._id).populate('genre', 'title');
    return populatedAuthor;
  } catch (error) {
    logger.error('Update author error:', error.message);
    throw error;
  }
};

/**
 * Delete author
 * @param {string} authorId - Author ID
 * @returns {boolean} Success status
 */
const deleteAuthor = async (authorId) => {
  try {
    const author = await Author.findById(authorId);

    if (!author) {
      throw new ApiError(404, 'Author not found');
    }

    await Author.findByIdAndDelete(authorId);

    logger.info(`Author deleted: ${author.authorName}`);

    return true;
  } catch (error) {
    logger.error('Delete author error:', error.message);
    throw error;
  }
};

/**
 * Soft delete author (set isActive to false)
 * @param {string} authorId - Author ID
 * @returns {Object} Updated author
 */
const deactivateAuthor = async (authorId) => {
  try {
    const author = await Author.findById(authorId);

    if (!author) {
      throw new ApiError(404, 'Author not found');
    }

    author.isActive = false;
    await author.save();

    logger.info(`Author deactivated: ${author.authorName}`);

    return author;
  } catch (error) {
    logger.error('Deactivate author error:', error.message);
    throw error;
  }
};

/**
 * Reactivate author (set isActive to true)
 * @param {string} authorId - Author ID
 * @returns {Object} Updated author
 */
const reactivateAuthor = async (authorId) => {
  try {
    const author = await Author.findById(authorId);

    if (!author) {
      throw new ApiError(404, 'Author not found');
    }

    author.isActive = true;
    await author.save();

    logger.info(`Author reactivated: ${author.authorName}`);

    return author;
  } catch (error) {
    logger.error('Reactivate author error:', error.message);
    throw error;
  }
};

module.exports = {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
  deactivateAuthor,
  reactivateAuthor
}; 