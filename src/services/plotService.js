const Plot = require('../models/plotModel');
const Genre = require('../models/genreModel');
const logger = require('../utils/logger');

/**
 * Create a new plot
 * @param {Object} plotData - Plot creation data
 * @returns {Object} Created plot
 */
const createPlot = async (plotData) => {
  try {
    // Validate that the genre exists
    const genre = await Genre.findById(plotData.genre);
    if (!genre) {
      throw new Error('Genre not found');
    }

    const plot = new Plot(plotData);
    await plot.save();
    
    // Populate genre information
    await plot.populate('genre', 'title description');
    
    logger.info(`New plot created: ${plot.title}`);
    return plot;
  } catch (error) {
    logger.error('Plot creation error:', error.message);
    throw error;
  }
};

/**
 * Get all plots with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Object} Plots and pagination info
 */
const getAllPlots = async (options = {}) => {
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
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre) {
      query.genre = genre;
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
    const plots = await Plot.find(query)

    // Get total count
    const total = await Plot.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    logger.info(`Retrieved ${plots.length} plots`);

    return {
      results: plots,
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
    logger.error('Get all plots error:', error.message);
    throw error;
  }
};

/**
 * Get plot by ID
 * @param {string} plotId - Plot ID
 * @returns {Object} Plot data
 */
const getPlotById = async (plotId) => {
  try {
    const plot = await Plot.findById(plotId)
      .populate('genre', 'title description')
      .populate('chapters')
      .populate('visualPrompts');

    if (!plot) {
      throw new Error('Plot not found');
    }

    return plot;
  } catch (error) {
    logger.error('Get plot by ID error:', error.message);
    throw error;
  }
};

/**
 * Get plot by slug
 * @param {string} slug - Plot slug
 * @returns {Object} Plot data
 */
const getPlotBySlug = async (slug) => {
  try {
    const plot = await Plot.findBySlug(slug)
      .populate('genre', 'title description')
      .populate('chapters')
      .populate('visualPrompts');
    
    if (!plot || !plot.isActive) {
      throw new Error('Plot not found');
    }

    return plot;
  } catch (error) {
    logger.error('Get plot by slug error:', error.message);
    throw error;
  }
};

/**
 * Update plot
 * @param {string} plotId - Plot ID
 * @param {Object} updateData - Update data
 * @returns {Object} Updated plot
 */
const updatePlot = async (plotId, updateData) => {
  try {
    const plot = await Plot.findById(plotId);

    if (!plot) {
      throw new Error('Plot not found');
    }

    // If genre is being updated, validate it exists
    if (updateData.genre) {
      const genre = await Genre.findById(updateData.genre);
      if (!genre) {
        throw new Error('Genre not found');
      }
    }

    // Update plot
    Object.assign(plot, updateData);
    await plot.save();
    
    await plot.populate('genre', 'title description');
    await plot.populate('chapters');

    logger.info(`Plot updated: ${plot.title}`);
    return plot;
  } catch (error) {
    logger.error('Update plot error:', error.message);
    throw error;
  }
};

/**
 * Delete plot
 * @param {string} plotId - Plot ID
 * @returns {boolean} Success status
 */
const deletePlot = async (plotId) => {
  try {
    const plot = await Plot.findById(plotId);

    if (!plot) {
      throw new Error('Plot not found');
    }

    await Plot.findByIdAndDelete(plotId);

    logger.info(`Plot deleted: ${plot.title}`);
    return true;
  } catch (error) {
    logger.error('Delete plot error:', error.message);
    throw error;
  }
};

/**
 * Soft delete plot (set isActive to false)
 * @param {string} plotId - Plot ID
 * @returns {Object} Updated plot
 */
const deactivatePlot = async (plotId) => {
  try {
    const plot = await Plot.findById(plotId);

    if (!plot) {
      throw new Error('Plot not found');
    }

    plot.isActive = false;
    await plot.save();

    logger.info(`Plot deactivated: ${plot.title}`);
    return plot;
  } catch (error) {
    logger.error('Deactivate plot error:', error.message);
    throw error;
  }
};

/**
 * Reactivate plot (set isActive to true)
 * @param {string} plotId - Plot ID
 * @returns {Object} Updated plot
 */
const reactivatePlot = async (plotId) => {
  try {
    const plot = await Plot.findById(plotId);

    if (!plot) {
      throw new Error('Plot not found');
    }

    plot.isActive = true;
    await plot.save();

    logger.info(`Plot reactivated: ${plot.title}`);
    return plot;
  } catch (error) {
    logger.error('Reactivate plot error:', error.message);
    throw error;
  }
};

/**
 * Get plots by genre
 * @param {string} genreId - Genre ID
 * @returns {Array} Array of plots
 */
const getPlotsByGenre = async (genreId) => {
  try {
    const plots = await Plot.findByGenre(genreId)
      .populate('genre', 'title description')
      .populate('chapters')
      .sort({ createdAt: -1 });

    return plots;
  } catch (error) {
    logger.error('Get plots by genre error:', error.message);
    throw error;
  }
};

/**
 * Get plot with chapter count
 * @param {string} plotId - Plot ID
 * @returns {Object} Plot with chapter count
 */
const getPlotWithChapterCount = async (plotId) => {
  try {
    const plot = await Plot.findById(plotId)
      .populate('genre', 'title description')
      .populate('chapters');

    if (!plot) {
      throw new Error('Plot not found');
    }

    // Get chapter count from database for accuracy
    const chapterCount = await Plot.getChapterCount(plotId);
    
    // Add chapter count to the plot object
    const plotWithCount = plot.toObject();
    plotWithCount.chapterCount = chapterCount;

    return plotWithCount;
  } catch (error) {
    logger.error('Get plot with chapter count error:', error.message);
    throw error;
  }
};

module.exports = {
  createPlot,
  getAllPlots,
  getPlotById,
  getPlotBySlug,
  updatePlot,
  deletePlot,
  deactivatePlot,
  reactivatePlot,
  getPlotsByGenre,
  getPlotWithChapterCount
}; 