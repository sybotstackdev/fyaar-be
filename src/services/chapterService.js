const Chapter = require('../models/chapterModel');
const Plot = require('../models/plotModel');
const logger = require('../utils/logger');

/**
 * Create a new chapter
 * @param {Object} chapterData - Chapter creation data
 * @returns {Object} Created chapter
 */
const createChapter = async (chapterData) => {
  try {
    // Validate that the plot exists
    const plot = await Plot.findById(chapterData.plot);
    if (!plot) {
      throw new Error('Plot not found');
    }

    // Get next order number if not provided
    if (!chapterData.order) {
      chapterData.order = await Chapter.getNextOrder(chapterData.plot);
    }

    // Generate slug from name (same logic as model middleware)
    const generatedSlug = chapterData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if a chapter with the same slug already exists in this plot
    const existingChapter = await Chapter.findOne({ 
      plot: chapterData.plot, 
      slug: generatedSlug 
    });
    
    if (existingChapter) {
      throw new Error(`A chapter with the slug '${generatedSlug}' already exists in this plot`);
    }

    const chapter = new Chapter(chapterData);
    await chapter.save();
    
    // Populate plot information
    await chapter.populate('plot', 'title genre');
    
    logger.info(`New chapter created: ${chapter.name}`);
    return chapter;
  } catch (error) {
    logger.error('Chapter creation error:', error.message);
    throw error;
  }
};

/**
 * Get all chapters with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Object} Chapters and pagination info
 */
const getAllChapters = async (options = {}) => {
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
    const chapters = await Chapter.find(query)
      .populate('plot', 'title genre')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Chapter.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    logger.info(`Retrieved ${chapters.length} chapters`);

    return {
      results: chapters,
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
    logger.error('Get all chapters error:', error.message);
    throw error;
  }
};

/**
 * Get chapter by ID
 * @param {string} chapterId - Chapter ID
 * @returns {Object} Chapter data
 */
const getChapterById = async (chapterId) => {
  try {
    const chapter = await Chapter.findById(chapterId)
      .populate('plot', 'title genre');

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    return chapter;
  } catch (error) {
    logger.error('Get chapter by ID error:', error.message);
    throw error;
  }
};

/**
 * Get chapter by slug
 * @param {string} slug - Chapter slug
 * @returns {Object} Chapter data
 */
const getChapterBySlug = async (slug) => {
  try {
    const chapter = await Chapter.findBySlug(slug)
      .populate('plot', 'title genre');
    
    if (!chapter || !chapter.isActive) {
      throw new Error('Chapter not found');
    }

    return chapter;
  } catch (error) {
    logger.error('Get chapter by slug error:', error.message);
    throw error;
  }
};

/**
 * Update chapter
 * @param {string} chapterId - Chapter ID
 * @param {Object} updateData - Update data
 * @returns {Object} Updated chapter
 */
const updateChapter = async (chapterId, updateData) => {
  try {
    const chapter = await Chapter.findById(chapterId);

    if (!chapter) {
      throw new Error('Chapter not found');
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
      
      // Check if another chapter with the same slug exists in the same plot
      const existingChapter = await Chapter.findOne({ 
        plot: updateData.plot || chapter.plot, 
        slug: generatedSlug,
        _id: { $ne: chapterId } // Exclude the current chapter being updated
      });
      
      if (existingChapter) {
        throw new Error(`A chapter with the slug '${generatedSlug}' already exists in this plot`);
      }
    }

    // Update chapter
    Object.assign(chapter, updateData);
    await chapter.save();
    
    await chapter.populate('plot', 'title genre');

    logger.info(`Chapter updated: ${chapter.name}`);
    return chapter;
  } catch (error) {
    logger.error('Update chapter error:', error.message);
    throw error;
  }
};

/**
 * Delete chapter
 * @param {string} chapterId - Chapter ID
 * @returns {boolean} Success status
 */
const deleteChapter = async (chapterId) => {
  try {
    const chapter = await Chapter.findById(chapterId);

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    await Chapter.findByIdAndDelete(chapterId);

    logger.info(`Chapter deleted: ${chapter.name}`);
    return true;
  } catch (error) {
    logger.error('Delete chapter error:', error.message);
    throw error;
  }
};

/**
 * Soft delete chapter (set isActive to false)
 * @param {string} chapterId - Chapter ID
 * @returns {Object} Updated chapter
 */
const deactivateChapter = async (chapterId) => {
  try {
    const chapter = await Chapter.findById(chapterId);

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    chapter.isActive = false;
    await chapter.save();

    logger.info(`Chapter deactivated: ${chapter.name}`);
    return chapter;
  } catch (error) {
    logger.error('Deactivate chapter error:', error.message);
    throw error;
  }
};

/**
 * Reactivate chapter (set isActive to true)
 * @param {string} chapterId - Chapter ID
 * @returns {Object} Updated chapter
 */
const reactivateChapter = async (chapterId) => {
  try {
    const chapter = await Chapter.findById(chapterId);

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    chapter.isActive = true;
    await chapter.save();

    logger.info(`Chapter reactivated: ${chapter.name}`);
    return chapter;
  } catch (error) {
    logger.error('Reactivate chapter error:', error.message);
    throw error;
  }
};

/**
 * Get chapters by plot
 * @param {string} plotId - Plot ID
 * @returns {Array} Array of chapters
 */
const getChaptersByPlot = async (plotId) => {
  try {
    const chapters = await Chapter.findByPlot(plotId)
      .populate('plot', 'title genre');

    return chapters;
  } catch (error) {
    logger.error('Get chapters by plot error:', error.message);
    throw error;
  }
};

/**
 * Reorder chapters for a plot
 * @param {string} plotId - Plot ID
 * @param {Array} chapterIds - Array of chapter IDs in new order
 * @returns {Array} Updated chapters
 */
const reorderChapters = async (plotId, chapterIds) => {
  try {
    // Validate that the plot exists
    const plot = await Plot.findById(plotId);
    if (!plot) {
      throw new Error('Plot not found');
    }

    // Update order for each chapter
    const updatePromises = chapterIds.map((chapterId, index) => {
      return Chapter.findByIdAndUpdate(
        chapterId,
        { order: index + 1 },
        { new: true }
      );
    });

    const updatedChapters = await Promise.all(updatePromises);
    
    // Populate plot information
    await Chapter.populate(updatedChapters, { path: 'plot', select: 'title genre' });

    logger.info(`Chapters reordered for plot: ${plot.title}`);
    return updatedChapters;
  } catch (error) {
    logger.error('Reorder chapters error:', error.message);
    throw error;
  }
};

module.exports = {
  createChapter,
  getAllChapters,
  getChapterById,
  getChapterBySlug,
  updateChapter,
  deleteChapter,
  deactivateChapter,
  reactivateChapter,
  getChaptersByPlot,
  reorderChapters
}; 