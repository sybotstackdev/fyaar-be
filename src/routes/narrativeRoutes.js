const express = require('express');
const {
  createNarrative,
  getAllNarratives,
  getNarrativeById,
  getNarrativeBySlug,
  updateNarrative,
  deleteNarrative,
  toggleNarrativeStatus,
} = require('../controllers/narrativeController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const {
  validateNarrative,
  validateObjectId,
  validatePagination
} = require('../middleware/validator');

const router = express.Router();

router.get('/slug/:slug', getNarrativeBySlug);

// Admin-only routes
router.post('/', 
  authenticate,
  authorize('admin'),
  validateNarrative,
  createNarrative
);

router.get('/', 
  authenticate,
  validatePagination,
  getAllNarratives
);

router.get('/:id', 
  authenticate,
  validateObjectId,
  getNarrativeById
);

router.put('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  validateNarrative,
  updateNarrative
);

router.delete('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deleteNarrative
);

router.patch('/:id/toggle', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  toggleNarrativeStatus
);

module.exports = router; 