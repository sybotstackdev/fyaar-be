const Narrative = require('../models/narrativeModel');
const logger = require('../utils/logger');

/**
 * Create a new narrative option
 * @param {Object} narrativeData - Narrative data
 * @returns {Object} Created narrative
 */
const createNarrative = async (narrativeData) => {
  try {
    // Check if narrative with same option label already exists
    const existingNarrative = await Narrative.findOne({ optionLabel: narrativeData.optionLabel });
    if (existingNarrative) {
      throw new Error('Narrative option with this label already exists');
    }

    // Create new narrative
    const narrative = new Narrative(narrativeData);
    await narrative.save();

    logger.info(`New narrative option created: ${narrative.optionLabel}`);

    return narrative.getPublicProfile();
  } catch (error) {
    logger.error('Create narrative error:', error.message);
    throw error;
  }
};

/**
 * Get all narratives with pagination
 * @param {Object} options - Pagination and filter options
 * @returns {Object} Narratives and pagination info
 */
const getAllNarratives = async (options = {}) => {
  try {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const sortWhitelist = ['createdAt', 'optionLabel', 'usage_count'];
    const sort = sortWhitelist.includes(options.sort) ? options.sort : 'createdAt';
    const order = options.order === 'asc' ? 1 : -1;
    const { search = '', isActive = '' } = options;

    const matchQuery = {};
    if (search) {
      matchQuery.$or = [
        { optionLabel: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== '') {
      matchQuery.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;
    let narratives;
    let total;

    if (sort === 'usage_count') {
      const pipeline = [
        { $match: matchQuery },
        {
          $lookup: {
            from: 'books',
            localField: '_id',
            foreignField: 'narrative',
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

      const result = await Narrative.aggregate(pipeline);
      narratives = result[0].results;
      total = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
    } else {
      const [narrativeDocs, totalDocs] = await Promise.all([
        Narrative.find(matchQuery)
          .sort({ [sort]: order })
          .skip(skip)
          .limit(limit),
        Narrative.countDocuments(matchQuery)
      ]);
      total = totalDocs;
      narratives = narrativeDocs.map(doc => doc.getPublicProfile());
    }

    const totalPages = Math.ceil(total / limit);

    return {
      results: narratives,
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
    logger.error('Get all narratives error:', error.message);
    throw error;
  }
};

/**
 * Get narrative by ID
 * @param {string} narrativeId - Narrative ID
 * @returns {Object} Narrative profile
 */
const getNarrativeById = async (narrativeId) => {
  try {
    const narrative = await Narrative.findById(narrativeId);
    
    if (!narrative) {
      throw new Error('Narrative option not found');
    }

    return narrative.getPublicProfile();
  } catch (error) {
    logger.error('Get narrative by ID error:', error.message);
    throw error;
  }
};

/**
 * Get narrative by slug
 * @param {string} slug - Narrative slug
 * @returns {Object} Narrative profile
 */
const getNarrativeBySlug = async (slug) => {
  try {
    const narrative = await Narrative.findBySlug(slug);
    
    if (!narrative) {
      throw new Error('Narrative option not found');
    }

    return narrative.getPublicProfile();
  } catch (error) {
    logger.error('Get narrative by slug error:', error.message);
    throw error;
  }
};

/**
 * Update narrative
 * @param {string} narrativeId - Narrative ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated narrative profile
 */
const updateNarrative = async (narrativeId, updateData) => {
  try {
    // Check if option label is being updated and if it already exists
    if (updateData.optionLabel) {
      const existingNarrative = await Narrative.findOne({ 
        optionLabel: updateData.optionLabel, 
        _id: { $ne: narrativeId } 
      });
      if (existingNarrative) {
        throw new Error('Narrative option with this label already exists');
      }
    }

    const narrative = await Narrative.findByIdAndUpdate(
      narrativeId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!narrative) {
      throw new Error('Narrative option not found');
    }

    logger.info(`Narrative option updated: ${narrative.optionLabel}`);

    return narrative.getPublicProfile();
  } catch (error) {
    logger.error('Update narrative error:', error.message);
    throw error;
  }
};

/**
 * Delete narrative
 * @param {string} narrativeId - Narrative ID
 * @returns {boolean} Success status
 */
const deleteNarrative = async (narrativeId) => {
  try {
    const narrative = await Narrative.findByIdAndDelete(narrativeId);
    
    if (!narrative) {
      throw new Error('Narrative option not found');
    }

    logger.info(`Narrative option deleted: ${narrative.optionLabel}`);

    return true;
  } catch (error) {
    logger.error('Delete narrative error:', error.message);
    throw error;
  }
};

/**
 * Get all active narratives (public)
 * @returns {Array} Active narratives
 */

module.exports = {
  createNarrative,
  getAllNarratives,
  getNarrativeById,
  getNarrativeBySlug,
  updateNarrative,
  deleteNarrative,
}; 