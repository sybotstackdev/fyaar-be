const express = require('express');
const {
  createGenre,
  getAllGenres,
  getGenreById,
  getGenreBySlug,
  updateGenre,
  deleteGenre,
  toggleGenreStatus
} = require('../controllers/genreController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const {
  validateGenre,
  validateObjectId,
  validatePagination
} = require('../middleware/validator');

const router = express.Router();


router.get('/slug/:slug', getGenreBySlug);

// Admin-only routes
router.post('/', 
  authenticate,
  authorize('admin'),
  validateGenre,
  createGenre
);

router.get('/', 
  authenticate,
  authorize('user','admin'),
  validatePagination,
  getAllGenres
);

router.get('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  getGenreById
);

router.put('/:id', 
  authenticate,
  authorize('admin'), 
  validateObjectId,
  updateGenre
);

router.delete('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deleteGenre
);

router.patch('/:id/toggle', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  toggleGenreStatus
);

module.exports = router; 