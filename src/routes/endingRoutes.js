const express = require('express');
const {
  createEnding,
  getAllEndings,
  getEndingById,
  getEndingBySlug,
  updateEnding,
  deleteEnding,
  toggleEndingStatus,
} = require('../controllers/endingController');
const { authenticate, authorize } = require('../middleware/auth');

const {
  validateEnding,
  validateObjectId,
  validatePagination
} = require('../middleware/validator');

const router = express.Router();

router.get('/slug/:slug', getEndingBySlug);

// Admin-only routes
router.post('/', 
  authenticate,
  authorize('admin'),
  validateEnding,
  createEnding
);

router.get('/', 
  authenticate,
  validatePagination,
  getAllEndings
);

router.get('/:id', 
  authenticate,
  validateObjectId,
  getEndingById
);

router.put('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  validateEnding,
  updateEnding
);

router.delete('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deleteEnding
);

router.patch('/:id/toggle', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  toggleEndingStatus
);

module.exports = router; 