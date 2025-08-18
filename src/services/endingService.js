const Ending = require('../models/endingModel');
const logger = require('../utils/logger');

/**
 * Create a new ending option
 * @param {Object} endingData - Ending data
 * @returns {Object} Created ending
 */
const createEnding = async (endingData) => {
  try {
    // Check if ending with same option label already exists
    const existingEnding = await Ending.findOne({ optionLabel: endingData.optionLabel });
    if (existingEnding) {
      throw new Error('Ending option with this label already exists');
    }

    // Create new ending
    const ending = new Ending(endingData);
    await ending.save();

    logger.info(`New ending option created: ${ending.optionLabel}`);

    return ending.getPublicProfile();
  } catch (error) {
    logger.error('Create ending error:', error.message);
    throw error;
  }
};

/**
 * Get all endings with pagination
 * @param {Object} options - Pagination and filter options
 * @returns {Object} Endings and pagination info
 */
const getAllEndings = async (options = {}) => {
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
        { optionLabel: { $regex: search, $options: 'i' } },
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
    
    const [endings, total] = await Promise.all([
      Ending.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Ending.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      results: endings.map(ending => ending.getPublicProfile()),
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
    logger.error('Get all endings error:', error.message);
    throw error;
  }
};

/**
 * Get ending by ID
 * @param {string} endingId - Ending ID
 * @returns {Object} Ending profile
 */
const getEndingById = async (endingId) => {
  try {
    const ending = await Ending.findById(endingId);
    
    if (!ending) {
      throw new Error('Ending option not found');
    }

    return ending.getPublicProfile();
  } catch (error) {
    logger.error('Get ending by ID error:', error.message);
    throw error;
  }
};

/**
 * Get ending by slug
 * @param {string} slug - Ending slug
 * @returns {Object} Ending profile
 */
const getEndingBySlug = async (slug) => {
  try {
    const ending = await Ending.findBySlug(slug);
    
    if (!ending) {
      throw new Error('Ending option not found');
    }

    return ending.getPublicProfile();
  } catch (error) {
    logger.error('Get ending by slug error:', error.message);
    throw error;
  }
};

/**
 * Update ending
 * @param {string} endingId - Ending ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated ending profile
 */
const updateEnding = async (endingId, updateData) => {
  try {
    // Check if option label is being updated and if it already exists
    if (updateData.optionLabel) {
      const existingEnding = await Ending.findOne({ 
        optionLabel: updateData.optionLabel, 
        _id: { $ne: endingId } 
      });
      if (existingEnding) {
        throw new Error('Ending option with this label already exists');
      }
    }

    const ending = await Ending.findByIdAndUpdate(
      endingId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!ending) {
      throw new Error('Ending option not found');
    }

    logger.info(`Ending option updated: ${ending.optionLabel}`);

    return ending.getPublicProfile();
  } catch (error) {
    logger.error('Update ending error:', error.message);
    throw error;
  }
};

/**
 * Delete ending
 * @param {string} endingId - Ending ID
 * @returns {boolean} Success status
 */
const deleteEnding = async (endingId) => {
  try {
    const ending = await Ending.findByIdAndDelete(endingId);
    
    if (!ending) {
      throw new Error('Ending option not found');
    }

    logger.info(`Ending option deleted: ${ending.optionLabel}`);

    return true;
  } catch (error) {
    logger.error('Delete ending error:', error.message);
    throw error;
  }
};

/**
 * Get all active endings (public)
 * @returns {Array} Active endings
 */

module.exports = {
  createEnding,
  getAllEndings,
  getEndingById,
  getEndingBySlug,
  updateEnding,
  deleteEnding,
}; 