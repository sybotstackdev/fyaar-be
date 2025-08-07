const express = require('express');
const {
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
} = require('../controllers/visualPromptController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  validateObjectId,
  validatePagination,
  validateVisualPrompt
} = require('../middleware/validator');

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Create new visual prompt
router.post('/', 
  authenticate,
  authorize('admin'),
  validateVisualPrompt,
  createVisualPrompt
);

// Get all visual prompts with pagination and filtering
router.get('/', 
  validatePagination,
  getAllVisualPrompts
);

// Get visual prompts by plot
router.get('/plot/:id', 
  validateObjectId,
  getVisualPromptsByPlot
);

// Reorder visual prompts for a plot
router.put('/plot/:plotId/reorder',   
  authenticate,
  authorize('admin'),
  validateObjectId,
  reorderVisualPrompts
);

// Get visual prompt by slug
router.get('/slug/:slug', 
  getVisualPromptBySlug
);

// Get visual prompt by ID
router.get('/:id', 
  validateObjectId,
  getVisualPromptById
);

// Update visual prompt
router.put('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  validateVisualPrompt,
  updateVisualPrompt
);

// Delete visual prompt
router.delete('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deleteVisualPrompt
);

// Deactivate visual prompt (soft delete)
router.patch('/:id/deactivate', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deactivateVisualPrompt
);

// Reactivate visual prompt
router.patch('/:id/reactivate', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  reactivateVisualPrompt
);

module.exports = router;
