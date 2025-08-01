const SpiceMood = require('../models/spiceMoodModel');
const logger = require('../utils/logger');

/**
 * Create a new spice mood setting
 * @param {Object} spiceMoodData - Spice mood data
 * @returns {Object} Created spice mood
 */
const createSpiceMood = async (spiceMoodData) => {
  try {
    // Check if spice mood with same combo name already exists
    const existingSpiceMood = await SpiceMood.findOne({ comboName: spiceMoodData.comboName });
    if (existingSpiceMood) {
      throw new Error('Spice mood setting with this combo name already exists');
    }

    // Create new spice mood
    const spiceMood = new SpiceMood(spiceMoodData);
    await spiceMood.save();

    logger.info(`New spice mood setting created: ${spiceMood.comboName}`);

    return spiceMood.getPublicProfile();
  } catch (error) {
    logger.error('Create spice mood error:', error.message);
    throw error;
  }
};

/**
 * Get all spice mood settings with pagination
 * @param {Object} options - Pagination and filter options
 * @returns {Object} Spice mood settings and pagination info
 */
const getAllSpiceMoods = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search = '',
      isActive = '',
      intensity = ''
    } = options;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { comboName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { moodSpiceBlend: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    if (intensity) {
      query.intensity = intensity;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [spiceMoods, total] = await Promise.all([
      SpiceMood.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      SpiceMood.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      results: spiceMoods.map(spiceMood => spiceMood.getPublicProfile()),
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
    logger.error('Get all spice moods error:', error.message);
    throw error;
  }
};

/**
 * Get spice mood by ID
 * @param {string} spiceMoodId - Spice mood ID
 * @returns {Object} Spice mood profile
 */
const getSpiceMoodById = async (spiceMoodId) => {
  try {
    const spiceMood = await SpiceMood.findById(spiceMoodId);
    
    if (!spiceMood) {
      throw new Error('Spice mood setting not found');
    }

    return spiceMood.getPublicProfile();
  } catch (error) {
    logger.error('Get spice mood by ID error:', error.message);
    throw error;
  }
};

/**
 * Get spice mood by slug
 * @param {string} slug - Spice mood slug
 * @returns {Object} Spice mood profile
 */
const getSpiceMoodBySlug = async (slug) => {
  try {
    const spiceMood = await SpiceMood.findBySlug(slug);
    
    if (!spiceMood) {
      throw new Error('Spice mood setting not found');
    }

    return spiceMood.getPublicProfile();
  } catch (error) {
    logger.error('Get spice mood by slug error:', error.message);
    throw error;
  }
};

/**
 * Update spice mood
 * @param {string} spiceMoodId - Spice mood ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated spice mood profile
 */
const updateSpiceMood = async (spiceMoodId, updateData) => {
  try {
    // Check if combo name is being updated and if it already exists
    if (updateData.comboName) {
      const existingSpiceMood = await SpiceMood.findOne({ 
        comboName: updateData.comboName, 
        _id: { $ne: spiceMoodId } 
      });
      if (existingSpiceMood) {
        throw new Error('Spice mood setting with this combo name already exists');
      }
    }

    const spiceMood = await SpiceMood.findByIdAndUpdate(
      spiceMoodId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!spiceMood) {
      throw new Error('Spice mood setting not found');
    }

    logger.info(`Spice mood setting updated: ${spiceMood.comboName}`);

    return spiceMood.getPublicProfile();
  } catch (error) {
    logger.error('Update spice mood error:', error.message);
    throw error;
  }
};

/**
 * Delete spice mood
 * @param {string} spiceMoodId - Spice mood ID
 * @returns {boolean} Success status
 */
const deleteSpiceMood = async (spiceMoodId) => {
  try {
    const spiceMood = await SpiceMood.findByIdAndDelete(spiceMoodId);
    
    if (!spiceMood) {
      throw new Error('Spice mood setting not found');
    }

    logger.info(`Spice mood setting deleted: ${spiceMood.comboName}`);

    return true;
  } catch (error) {
    logger.error('Delete spice mood error:', error.message);
    throw error;
  }
};

module.exports = {
  createSpiceMood,
  getAllSpiceMoods,
  getSpiceMoodById,
  getSpiceMoodBySlug,
  updateSpiceMood,
  deleteSpiceMood,
}; 