const VisualPrompt = require('../models/visualPromptModel');
const Plot = require('../models/plotModel');
const logger = require('../utils/logger');

/**
 * Create a new visual prompt
 * @param {Object} visualPromptData - Visual prompt creation data
 * @returns {Object} Created visual prompt
 */
const createVisualPrompt = async (visualPromptData) => {
  try {
    // Validate that the plot exists
    const plot = await Plot.findById(visualPromptData.plot);
    if (!plot) {
      throw new Error('Plot not found');
    }

    // Get next order number if not provided
    if (!visualPromptData.order) {
      visualPromptData.order = await VisualPrompt.getNextOrder(visualPromptData.plot);
    }

    // Generate slug from name (same logic as model middleware)
    const generatedSlug = visualPromptData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if a visual prompt with the same slug already exists in this plot
    const existingVisualPrompt = await VisualPrompt.findOne({ 
      plot: visualPromptData.plot, 
      slug: generatedSlug 
    });
    
    if (existingVisualPrompt) {
      throw new Error(`A visual prompt with the slug '${generatedSlug}' already exists in this plot`);
    }

    const visualPrompt = new VisualPrompt(visualPromptData);
    await visualPrompt.save();
    
    // Populate plot information
    await visualPrompt.populate('plot', 'title genre');
    
    logger.info(`New visual prompt created: ${visualPrompt.name}`);
    return visualPrompt;
  } catch (error) {
    logger.error('Visual prompt creation error:', error.message);
    throw error;
  }
};

/**
 * Get all visual prompts with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Object} Visual prompts and pagination info
 */
const getAllVisualPrompts = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'order',
      order = 'asc',
      search = '',
      plot = '',
      isActive = ''
    } = options;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (plot) {
      query.plot = plot;
    }

    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query
    const visualPrompts = await VisualPrompt.find(query)
      .populate('plot', 'title genre')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await VisualPrompt.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    logger.info(`Retrieved ${visualPrompts.length} visual prompts`);

    return {
      results: visualPrompts,
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
    logger.error('Get all visual prompts error:', error.message);
    throw error;
  }
};

/**
 * Get visual prompt by ID
 * @param {string} visualPromptId - Visual prompt ID
 * @returns {Object} Visual prompt data
 */
const getVisualPromptById = async (visualPromptId) => {
  try {
    const visualPrompt = await VisualPrompt.findById(visualPromptId)
      .populate('plot', 'title genre');

    if (!visualPrompt) {
      throw new Error('Visual prompt not found');
    }

    return visualPrompt;
  } catch (error) {
    logger.error('Get visual prompt by ID error:', error.message);
    throw error;
  }
};

/**
 * Get visual prompt by slug
 * @param {string} slug - Visual prompt slug
 * @returns {Object} Visual prompt data
 */
const getVisualPromptBySlug = async (slug) => {
  try {
    const visualPrompt = await VisualPrompt.findBySlug(slug)
      .populate('plot', 'title genre');
    
    if (!visualPrompt || !visualPrompt.isActive) {
      throw new Error('Visual prompt not found');
    }

    return visualPrompt;
  } catch (error) {
    logger.error('Get visual prompt by slug error:', error.message);
    throw error;
  }
};

/**
 * Update visual prompt
 * @param {string} visualPromptId - Visual prompt ID
 * @param {Object} updateData - Update data
 * @returns {Object} Updated visual prompt
 */
const updateVisualPrompt = async (visualPromptId, updateData) => {
  try {
    const visualPrompt = await VisualPrompt.findById(visualPromptId);

    if (!visualPrompt) {
      throw new Error('Visual prompt not found');
    }

    // If plot is being updated, validate it exists
    if (updateData.plot) {
      const plot = await Plot.findById(updateData.plot);
      if (!plot) {
        throw new Error('Plot not found');
      }
    }

    // If name is being updated, check for slug conflicts
    if (updateData.name) {
      // Generate slug from name (same logic as model middleware)
      const generatedSlug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Check if another visual prompt with the same slug exists in the same plot
      const existingVisualPrompt = await VisualPrompt.findOne({ 
        plot: updateData.plot || visualPrompt.plot, 
        slug: generatedSlug,
        _id: { $ne: visualPromptId } // Exclude the current visual prompt being updated
      });
      
      if (existingVisualPrompt) {
        throw new Error(`A visual prompt with the slug '${generatedSlug}' already exists in this plot`);
      }
    }

    // Update visual prompt
    Object.assign(visualPrompt, updateData);
    await visualPrompt.save();
    
    await visualPrompt.populate('plot', 'title genre');

    logger.info(`Visual prompt updated: ${visualPrompt.name}`);
    return visualPrompt;
  } catch (error) {
    logger.error('Update visual prompt error:', error.message);
    throw error;
  }
};

/**
 * Delete visual prompt
 * @param {string} visualPromptId - Visual prompt ID
 * @returns {boolean} Success status
 */
const deleteVisualPrompt = async (visualPromptId) => {
  try {
    const visualPrompt = await VisualPrompt.findById(visualPromptId);

    if (!visualPrompt) {
      throw new Error('Visual prompt not found');
    }

    await VisualPrompt.findByIdAndDelete(visualPromptId);

    logger.info(`Visual prompt deleted: ${visualPrompt.name}`);
    return true;
  } catch (error) {
    logger.error('Delete visual prompt error:', error.message);
    throw error;
  }
};

/**
 * Soft delete visual prompt (set isActive to false)
 * @param {string} visualPromptId - Visual prompt ID
 * @returns {Object} Updated visual prompt
 */
const deactivateVisualPrompt = async (visualPromptId) => {
  try {
    const visualPrompt = await VisualPrompt.findById(visualPromptId);

    if (!visualPrompt) {
      throw new Error('Visual prompt not found');
    }

    visualPrompt.isActive = false;
    await visualPrompt.save();

    logger.info(`Visual prompt deactivated: ${visualPrompt.name}`);
    return visualPrompt;
  } catch (error) {
    logger.error('Deactivate visual prompt error:', error.message);
    throw error;
  }
};

/**
 * Reactivate visual prompt (set isActive to true)
 * @param {string} visualPromptId - Visual prompt ID
 * @returns {Object} Updated visual prompt
 */
const reactivateVisualPrompt = async (visualPromptId) => {
  try {
    const visualPrompt = await VisualPrompt.findById(visualPromptId);

    if (!visualPrompt) {
      throw new Error('Visual prompt not found');
    }

    visualPrompt.isActive = true;
    await visualPrompt.save();

    logger.info(`Visual prompt reactivated: ${visualPrompt.name}`);
    return visualPrompt;
  } catch (error) {
    logger.error('Reactivate visual prompt error:', error.message);
    throw error;
  }
};

/**
 * Get visual prompts by plot
 * @param {string} plotId - Plot ID
 * @returns {Array} Array of visual prompts
 */
const getVisualPromptsByPlot = async (plotId) => {
  try {
    const visualPrompts = await VisualPrompt.findByPlot(plotId)
      .populate('plot', 'title genre');

    return visualPrompts;
  } catch (error) {
    logger.error('Get visual prompts by plot error:', error.message);
    throw error;
  }
};

/**
 * Reorder visual prompts for a plot
 * @param {string} plotId - Plot ID
 * @param {Array} visualPromptIds - Array of visual prompt IDs in new order
 * @returns {Array} Updated visual prompts
 */
const reorderVisualPrompts = async (plotId, visualPromptIds) => {
  try {
    // Validate that the plot exists
    const plot = await Plot.findById(plotId);
    if (!plot) {
      throw new Error('Plot not found');
    }

    // Update order for each visual prompt
    const updatePromises = visualPromptIds.map((visualPromptId, index) => {
      return VisualPrompt.findByIdAndUpdate(
        visualPromptId,
        { order: index + 1 },
        { new: true }
      );
    });

    const updatedVisualPrompts = await Promise.all(updatePromises);
    
    // Populate plot information
    await VisualPrompt.populate(updatedVisualPrompts, { path: 'plot', select: 'title genre' });

    logger.info(`Visual prompts reordered for plot: ${plot.title}`);
    return updatedVisualPrompts;
  } catch (error) {
    logger.error('Reorder visual prompts error:', error.message);
    throw error;
  }
};

module.exports = {
  createVisualPrompt,
  getAllVisualPrompts,
  getVisualPromptById,
  getVisualPromptBySlug,
  updateVisualPrompt,   
  deleteVisualPrompt,
  deactivateVisualPrompt,
  reactivateVisualPrompt,
  getVisualPromptsByPlot,
  reorderVisualPrompts
};
