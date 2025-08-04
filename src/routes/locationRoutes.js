const express = require('express');
const {
  createLocation,
  getAllLocations,
  getLocationsByCategory,
  getLocationById,
  getLocationBySlug,
  updateLocation,
  deleteLocation,
  toggleLocationStatus
} = require('../controllers/locationController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const {
  validateLocation,
  validateObjectId,
  validatePagination
} = require('../middleware/validator');

const router = express.Router();

// Public routes
router.get('/slug/:slug', getLocationBySlug);
router.get('/category/:category', getLocationsByCategory);

// Admin-only routes
router.post('/', 
  authenticate,
  authorize('admin'),
  validateLocation,
  createLocation
);

router.get('/', 
  authenticate,
  authorize('user','admin'),
  validatePagination,
  getAllLocations
);

router.get('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  getLocationById
);

router.put('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  validateLocation,
  updateLocation
);

router.delete('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deleteLocation
);

router.patch('/:id/toggle', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  toggleLocationStatus
);

module.exports = router; 