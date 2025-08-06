const express = require('express');
const {
  createPlot,
  getAllPlots,
  getPlotById,
  getPlotBySlug,
  updatePlot,
  deletePlot,
  deactivatePlot,
  reactivatePlot,
  getPlotsByGenre
} = require('../controllers/plotController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  validateObjectId,
  validatePagination,
  validatePlot
} = require('../middleware/validator');

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Create new plot
router.post('/', 
  authenticate,
  authorize('admin'),
  validatePlot,
  createPlot
);

// Get all plots with pagination and filtering
router.get('/', 
  validatePagination,
  getAllPlots
);

// Get plots by genre
router.get('/genre/:genreId', 
  validateObjectId,
  getPlotsByGenre
);

// Get plot by slug
router.get('/slug/:slug', 
  getPlotBySlug
);

// Get plot by ID
router.get('/:id', 
  validateObjectId,
  getPlotById
);

// Update plot
router.put('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  validatePlot,
  updatePlot
);

// Delete plot
router.delete('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deletePlot
);

// Deactivate plot (soft delete)
router.patch('/:id/deactivate', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deactivatePlot
);

// Reactivate plot
router.patch('/:id/reactivate', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  reactivatePlot
);

module.exports = router; 