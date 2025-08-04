const LocationService = require('../services/locationService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create a new location (admin only)
 * POST /api/locations
 */
const createLocation = asyncHandler(async (req, res) => {
  const { name, category, description, country, state } = req.body;

  const location = await LocationService.createLocation({
    name,
    category,
    description,
    country,
    state
  });

  return ApiResponse.created(res, 'Location created successfully', location);
});

/**
 * Get all locations with pagination (admin only)
 * GET /api/locations
 */
const getAllLocations = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, category, country, isActive } = req.query;

  const result = await LocationService.getAllLocations({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc',
    search: search || '',
    category: category || '',
    country: country || '',
    isActive: isActive || ''
  });

  return ApiResponse.success(res, 200, 'Locations retrieved successfully', result);
});

/**
 * Get locations by category (public)
 * GET /api/locations/category/:category
 */
const getLocationsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  const locations = await LocationService.getLocationsByCategory(category);

  return ApiResponse.success(res, 200, 'Locations retrieved successfully', locations);
});

/**
 * Get location by ID (admin only)
 * GET /api/locations/:id
 */
const getLocationById = asyncHandler(async (req, res) => {
  const location = await LocationService.getLocationById(req.params.id);

  return ApiResponse.success(res, 200, 'Location retrieved successfully', location);
});

/**
 * Get location by slug (public)
 * GET /api/locations/slug/:slug
 */
const getLocationBySlug = asyncHandler(async (req, res) => {
  const location = await LocationService.getLocationBySlug(req.params.slug);

  return ApiResponse.success(res, 200, 'Location retrieved successfully', location);
});

/**
 * Update location by ID (admin only)
 * PUT /api/locations/:id
 */
const updateLocation = asyncHandler(async (req, res) => {
  const updatedLocation = await LocationService.updateLocation(req.params.id, req.body);

  return ApiResponse.success(res, 200, 'Location updated successfully', updatedLocation);
});

/**
 * Delete location by ID (admin only)
 * DELETE /api/locations/:id
 */
const deleteLocation = asyncHandler(async (req, res) => {
  await LocationService.deleteLocation(req.params.id);

  return ApiResponse.success(res, 200, 'Location deleted successfully');
});

/**
 * Toggle location active status (admin only)
 * PATCH /api/locations/:id/toggle
 */
const toggleLocationStatus = asyncHandler(async (req, res) => {
  const location = await LocationService.getLocationById(req.params.id);
  
  const updatedLocation = await LocationService.updateLocation(req.params.id, {
    isActive: !location.isActive
  });

  const status = updatedLocation.isActive ? 'activated' : 'deactivated';
  return ApiResponse.success(res, 200, `Location ${status} successfully`, updatedLocation);
});

module.exports = {
  createLocation,
  getAllLocations,
  getLocationsByCategory,
  getLocationById,
  getLocationBySlug,
  updateLocation,
  deleteLocation,
  toggleLocationStatus
}; 