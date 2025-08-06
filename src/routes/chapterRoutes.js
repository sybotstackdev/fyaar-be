const express = require('express');
const {
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
} = require('../controllers/chapterController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  validateObjectId,
  validatePagination,
  validateChapter
} = require('../middleware/validator');

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Create new chapter
router.post('/', 
  authenticate,
  authorize('admin'),
  validateChapter,
  createChapter
);

// Get all chapters with pagination and filtering
router.get('/', 
  validatePagination,
  getAllChapters
);

// Get chapters by plot
router.get('/plot/:id', 
  validateObjectId,
  getChaptersByPlot
);

// Reorder chapters for a plot
router.put('/plot/:plotId/reorder',   
  authenticate,
  authorize('admin'),
  validateObjectId,
  reorderChapters
);

// Get chapter by slug
router.get('/slug/:slug', 
  getChapterBySlug
);

// Get chapter by ID
router.get('/:id', 
  validateObjectId,
  getChapterById
);

// Update chapter
router.put('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  validateChapter,
  updateChapter
);

// Delete chapter
router.delete('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deleteChapter
);

// Deactivate chapter (soft delete)
router.patch('/:id/deactivate', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deactivateChapter
);

// Reactivate chapter
router.patch('/:id/reactivate', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  reactivateChapter
);

module.exports = router; 