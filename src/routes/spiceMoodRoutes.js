const express = require('express');
const {
  createSpiceMood,
  getAllSpiceMoods,
  getSpiceMoodById,
  getSpiceMoodBySlug,
  updateSpiceMood,
  deleteSpiceMood,
  toggleSpiceMoodStatus
} = require('../controllers/spiceMoodController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const {
  validateSpiceMood,
  validateObjectId,
  validatePagination
} = require('../middleware/validator');

const router = express.Router();

// Public route
router.get('/slug/:slug', getSpiceMoodBySlug);

// Admin-only routes
router.post('/', 
  authenticate,
  authorize('admin'),
  validateSpiceMood,
  createSpiceMood
);

router.get('/', 
  authenticate,
  validatePagination,
  getAllSpiceMoods
);

router.get('/:id', 
  authenticate,
  validateObjectId,
  getSpiceMoodById
);

router.put('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  validateSpiceMood,
  updateSpiceMood
);

router.delete('/:id', 
  authenticate,
  validateObjectId,
  deleteSpiceMood
);

router.patch('/:id/toggle', 
  authenticate,
  validateObjectId,
  toggleSpiceMoodStatus
);

module.exports = router; 