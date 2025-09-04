const Location = require('../models/locationModel');
const logger = require('../utils/logger');

/**
 * Create a new location
 * @param {Object} locationData - Location data
 * @returns {Object} Created location
 */
const createLocation = async (locationData) => {
  try {
    // Check if location with same name already exists
    const existingLocation = await Location.findOne({ name: locationData.name });
    if (existingLocation) {
      throw new Error('Location with this name already exists');
    }

    // Create new location
    const location = new Location(locationData);
    await location.save();

    logger.info(`New location created: ${location.name}`);

    return location.getPublicProfile();
  } catch (error) {
    logger.error('Create location error:', error.message);
    throw error;
  }
};

/**
 * Get all locations with pagination
 * @param {Object} options - Pagination and filter options
 * @returns {Object} Locations and pagination info
 */
const getAllLocations = async (options = {}) => {
  try {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const sortWhitelist = ['createdAt', 'name', 'usage_count'];
    const sort = sortWhitelist.includes(options.sort) ? options.sort : 'createdAt';
    const order = options.order === 'asc' ? 1 : -1;
    const { search = '', category = '', country = '', isActive = '' } = options;

    const matchQuery = {};
    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      matchQuery.category = category;
    }
    if (country) {
      matchQuery.country = { $regex: country, $options: 'i' };
    }
    if (isActive !== '') {
      matchQuery.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;
    let locations;
    let total;

    if (sort === 'usage_count') {
      const pipeline = [
        { $match: matchQuery },
        {
          $lookup: {
            from: 'books',
            localField: '_id',
            foreignField: 'locations',
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

      const result = await Location.aggregate(pipeline);
      locations = result[0].results;
      total = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
    } else {
      const [locationDocs, totalDocs] = await Promise.all([
        Location.find(matchQuery)
          .sort({ [sort]: order })
          .skip(skip)
          .limit(limit),
        Location.countDocuments(matchQuery)
      ]);
      total = totalDocs;
      locations = locationDocs.map(doc => doc.getPublicProfile());
    }

    const totalPages = Math.ceil(total / limit);

    return {
      results: locations,
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
    logger.error('Get all locations error:', error.message);
    throw error;
  }
};

/**
 * Get locations by category
 * @param {string} category - Location category
 * @returns {Array} Locations in category
 */
const getLocationsByCategory = async (category) => {
  try {
    const locations = await Location.findByCategory(category);
    return locations.map(location => location.getPublicProfile());
  } catch (error) {
    logger.error('Get locations by category error:', error.message);
    throw error;
  }
};

/**
 * Get location by ID
 * @param {string} locationId - Location ID
 * @returns {Object} Location profile
 */
const getLocationById = async (locationId) => {
  try {
    const location = await Location.findById(locationId);
    
    if (!location) {
      throw new Error('Location not found');
    }

    return location.getPublicProfile();
  } catch (error) {
    logger.error('Get location by ID error:', error.message);
    throw error;
  }
};

/**
 * Get location by slug
 * @param {string} slug - Location slug
 * @returns {Object} Location profile
 */
const getLocationBySlug = async (slug) => {
  try {
    const location = await Location.findBySlug(slug);
    
    if (!location) {
      throw new Error('Location not found');
    }

    return location.getPublicProfile();
  } catch (error) {
    logger.error('Get location by slug error:', error.message);
    throw error;
  }
};

/**
 * Update location
 * @param {string} locationId - Location ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated location profile
 */
const updateLocation = async (locationId, updateData) => {
  try {
    // Check if name is being updated and if it already exists
    if (updateData.name) {
      const existingLocation = await Location.findOne({ 
        name: updateData.name, 
        _id: { $ne: locationId } 
      });
      if (existingLocation) {
        throw new Error('Location with this name already exists');
      }
    }

    const location = await Location.findByIdAndUpdate(
      locationId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!location) {
      throw new Error('Location not found');
    }

    logger.info(`Location updated: ${location.name}`);

    return location.getPublicProfile();
  } catch (error) {
    logger.error('Update location error:', error.message);
    throw error;
  }
};

/**
 * Delete location
 * @param {string} locationId - Location ID
 * @returns {boolean} Success status
 */
const deleteLocation = async (locationId) => {
  try {
    const location = await Location.findByIdAndDelete(locationId);
    
    if (!location) {
      throw new Error('Location not found');
    }

    logger.info(`Location deleted: ${location.name}`);

    return true;
  } catch (error) {
    logger.error('Delete location error:', error.message);
    throw error;
  }
};

module.exports = {
  createLocation,
  getAllLocations,
  getLocationsByCategory,
  getLocationById,
  getLocationBySlug,
  updateLocation,
  deleteLocation,
}; 