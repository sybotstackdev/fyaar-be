const express = require('express');
const {
  createSpiceLevel,
  getAllSpiceLevels,
  getSpiceLevelById,
  getSpiceLevelBySlug,
  updateSpiceLevel,
  deleteSpiceLevel,
  toggleSpiceLevelStatus
} = require('../controllers/spiceLevelController');
const { authenticate, authorize } = require('../middleware/auth');

const {
  validateSpiceLevel,
  validateObjectId,
  validatePagination
} = require('../middleware/validator');

const router = express.Router();

// Public route
router.get('/slug/:slug', getSpiceLevelBySlug);

// Admin-only routes
router.post('/', 
  authenticate,
  authorize('admin'),
  validateSpiceLevel,
  createSpiceLevel
);

router.get('/', 
  authenticate,
  validatePagination,
  getAllSpiceLevels
);

router.get('/:id', 
  authenticate,
  validateObjectId,
  getSpiceLevelById
);

router.put('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  validateSpiceLevel,
  updateSpiceLevel
);

router.delete('/:id', 
  authenticate,
  validateObjectId,
  deleteSpiceLevel
);

router.patch('/:id/toggle', 
  authenticate,
  validateObjectId,
  toggleSpiceLevelStatus
);

module.exports = router; 