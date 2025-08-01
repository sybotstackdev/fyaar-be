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
    
    const [narratives, total] = await Promise.all([
      Narrative.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Narrative.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      results: narratives.map(narrative => narrative.getPublicProfile()),
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