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
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const sortWhitelist = ['createdAt', 'comboName', 'usage_count'];
    const sort = sortWhitelist.includes(options.sort) ? options.sort : 'createdAt';
    const order = options.order === 'asc' ? 1 : -1;
    const { search = '', isActive = '' } = options;

    const matchQuery = {};
    if (search) {
      matchQuery.$or = [
        { comboName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== '') {
      matchQuery.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;
    let spiceLevels;
    let total;

    if (sort === 'usage_count') {
      const pipeline = [
        { $match: matchQuery },
        {
          $lookup: {
            from: 'books',
            localField: '_id',
            foreignField: 'spiceLevels',
            as: 'books'
          }
        },
        {
          $addFields: {
            usage_count: { $size: '$books' }
          }
        },
        { $sort: { [sort]: order } },
        {
          $facet: {
            results: [
              { $skip: skip },
              { $limit: limit },
              { $project: { books: 0, __v: 0 } }
            ],
            totalCount: [{ $count: 'count' }]
          }
        }
      ];

      const result = await SpiceLevel.aggregate(pipeline);
      spiceLevels = result[0].results;
      total = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
    } else {
      const [spiceLevelDocs, totalDocs] = await Promise.all([
        SpiceLevel.find(matchQuery)
          .sort({ [sort]: order })
          .skip(skip)
          .limit(limit),
        SpiceLevel.countDocuments(matchQuery)
      ]);
      total = totalDocs;
      spiceLevels = spiceLevelDocs.map(doc => doc.getPublicProfile());
    }

    const totalPages = Math.ceil(total / limit);

    return {
      results: spiceLevels,
      pagination: {
        page,
        limit,
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