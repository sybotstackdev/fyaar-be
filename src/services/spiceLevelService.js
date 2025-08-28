const SpiceLevel = require('../models/spiceLevelModel');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Create a new spice level setting
 * @param {Object} spiceLevelData - Spice level data
 * @returns {Object} Created spice level
 */
const createSpiceLevel = async (spiceLevelData) => {
  try {
    // Check if spice level with same combo name already exists
    const existingSpiceLevel = await SpiceLevel.findOne({ comboName: spiceLevelData.comboName });
    if (existingSpiceLevel) {
      throw new ApiError(400, 'Spice level setting with this combo name already exists');
    }

    // Create new spice level
    const spiceLevel = new SpiceLevel(spiceLevelData);
    await spiceLevel.save();

    logger.info(`New spice level setting created: ${spiceLevel.comboName}`);

    return spiceLevel.getPublicProfile();
  } catch (error) {
    logger.error('Create spice level error:', error.message);
    throw error;
  }
};

/**
 * Get all spice level settings with pagination
 * @param {Object} options - Pagination and filter options
 * @returns {Object} Spice level settings and pagination info
 */
const getAllSpiceLevels = async (options = {}) => {
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
        { comboName: { $regex: search, $options: 'i' } },
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

    const [spiceLevels, total] = await Promise.all([
      SpiceLevel.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      SpiceLevel.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      results: spiceLevels.map(spiceLevel => spiceLevel.getPublicProfile()),
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
    logger.error('Get all spice levels error:', error.message);
    throw error;
  }
};

/**
 * Get spice level by ID
 * @param {string} spiceLevelId - Spice level ID
 * @returns {Object} Spice level profile
 */
const getSpiceLevelById = async (spiceLevelId) => {
  try {
    const spiceLevel = await SpiceLevel.findById(spiceLevelId);

    if (!spiceLevel) {
      throw new ApiError(404, 'Spice level setting not found');
    }

    return spiceLevel.getPublicProfile();
  } catch (error) {
    logger.error('Get spice level by ID error:', error.message);
    throw error;
  }
};

/**
 * Get spice level by slug
 * @param {string} slug - Spice level slug
 * @returns {Object} Spice level profile
 */
const getSpiceLevelBySlug = async (slug) => {
  try {
    const spiceLevel = await SpiceLevel.findBySlug(slug);

    if (!spiceLevel) {
      throw new ApiError(404, 'Spice level setting not found');
    }

    return spiceLevel.getPublicProfile();
  } catch (error) {
    logger.error('Get spice level by slug error:', error.message);
    throw error;
  }
};

/**
 * Update spice level
 * @param {string} spiceLevelId - Spice level ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated spice level profile
 */
const updateSpiceLevel = async (spiceLevelId, updateData) => {
  try {
    // Check if combo name is being updated and if it already exists
    if (updateData.comboName) {
      const existingSpiceLevel = await SpiceLevel.findOne({
        comboName: updateData.comboName,
        _id: { $ne: spiceLevelId }
      });
      if (existingSpiceLevel) {
        throw new ApiError(400, 'Spice level setting with this combo name already exists');
      }
    }

    const spiceLevel = await SpiceLevel.findByIdAndUpdate(
      spiceLevelId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!spiceLevel) {
      throw new ApiError(404, 'Spice level setting not found');
    }

    logger.info(`Spice level setting updated: ${spiceLevel.comboName}`);

    return spiceLevel.getPublicProfile();
  } catch (error) {
    logger.error('Update spice level error:', error.message);
    throw error;
  }
};

/**
 * Delete spice level
 * @param {string} spiceLevelId - Spice level ID
 * @returns {boolean} Success status
 */
const deleteSpiceLevel = async (spiceLevelId) => {
  try {
    const spiceLevel = await SpiceLevel.findByIdAndDelete(spiceLevelId);

    if (!spiceLevel) {
      throw new ApiError(404, 'Spice level setting not found');
    }

    logger.info(`Spice level setting deleted: ${spiceLevel.comboName}`);

    return true;
  } catch (error) {
    logger.error('Delete spice level error:', error.message);
    throw error;
  }
};

module.exports = {
  createSpiceLevel,
  getAllSpiceLevels,
  getSpiceLevelById,
  getSpiceLevelBySlug,
  updateSpiceLevel,
  deleteSpiceLevel,
}; 