const Tag = require('../models/tagModel');
const logger = require('../utils/logger');

/**
 * Create a new tag
 * @param {Object} tagData - Tag data
 * @returns {Object} Created tag
 */
const createTag = async (tagData) => {
  try {
    // Check if tag with same name already exists
    const existingTag = await Tag.findOne({ name: tagData.name });
    if (existingTag) {
      throw new Error('Tag with this name already exists');
    }

    // Create new tag
    const tag = new Tag(tagData);
    await tag.save();

    logger.info(`New tag created: ${tag.name}`);

    return tag.getPublicProfile();
  } catch (error) {
    logger.error('Create tag error:', error.message);
    throw error;
  }
};

/**
 * Get all tags with pagination
 * @param {Object} options - Pagination and filter options
 * @returns {Object} Tags and pagination info
 */
const getAllTags = async (options = {}) => {
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
        { name: { $regex: search, $options: 'i' } }
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
    
    const [tags, total] = await Promise.all([
      Tag.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Tag.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      results: tags.map(tag => tag.getPublicProfile()),
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
    logger.error('Get all tags error:', error.message);
    throw error;
  }
};

/**
 * Get tag by ID
 * @param {string} tagId - Tag ID
 * @returns {Object} Tag profile
 */
const getTagById = async (tagId) => {
  try {
    const tag = await Tag.findById(tagId);
    
    if (!tag) {
      throw new Error('Tag not found');
    }

    return tag.getPublicProfile();
  } catch (error) {
    logger.error('Get tag by ID error:', error.message);
    throw error;
  }
};

/**
 * Get tag by slug
 * @param {string} slug - Tag slug
 * @returns {Object} Tag profile
 */
const getTagBySlug = async (slug) => {
  try {
    const tag = await Tag.findBySlug(slug);
    
    if (!tag) {
      throw new Error('Tag not found');
    }

    return tag.getPublicProfile();
  } catch (error) {
    logger.error('Get tag by slug error:', error.message);
    throw error;
  }
};

/**
 * Update tag
 * @param {string} tagId - Tag ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated tag profile
 */
const updateTag = async (tagId, updateData) => {
  try {
    // Check if name is being updated and if it already exists
    if (updateData.name) {
      const existingTag = await Tag.findOne({ 
        name: updateData.name, 
        _id: { $ne: tagId } 
      });
      if (existingTag) {
        throw new Error('Tag with this name already exists');
      }
    }

    const tag = await Tag.findByIdAndUpdate(
      tagId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!tag) {
      throw new Error('Tag not found');
    }

    logger.info(`Tag updated: ${tag.name}`);

    return tag.getPublicProfile();
  } catch (error) {
    logger.error('Update tag error:', error.message);
    throw error;
  }
};

/**
 * Delete tag
 * @param {string} tagId - Tag ID
 * @returns {boolean} Success status
 */
const deleteTag = async (tagId) => {
  try {
    const tag = await Tag.findByIdAndDelete(tagId);
    
    if (!tag) {
      throw new Error('Tag not found');
    }

    logger.info(`Tag deleted: ${tag.name}`);

    return true;
  } catch (error) {
    logger.error('Delete tag error:', error.message);
    throw error;
  }
};

/**
 * Get all active tags (public)
 * @returns {Array} Active tags
 */

module.exports = {
  createTag,
  getAllTags,
  getTagById,
  getTagBySlug,
  updateTag,
  deleteTag,
}; 