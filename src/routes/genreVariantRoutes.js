const express = require('express');
const {
  createGenreVariant,
  updateGenreVariant,
  deleteGenreVariant
} = require('../controllers/genreVariantController');
const { authenticate, authorize } = require('../middleware/auth');

const {
  validateGenreVariant,
  validateObjectId,
} = require('../middleware/validator');

const router = express.Router({ mergeParams: true });

// Admin-only routes
router.post('/', 
  authenticate,
  authorize('admin'),
  validateGenreVariant,
  createGenreVariant
);

router.put('/:id', 
  authenticate,
  authorize('admin'), 
  validateObjectId,
  validateGenreVariant,
  updateGenreVariant
);

router.delete('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deleteGenreVariant
);

module.exports = router; 