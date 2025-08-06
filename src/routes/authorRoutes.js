const express = require('express');
const {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
  deactivateAuthor,
  reactivateAuthor
} = require('../controllers/authorController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  validateObjectId,
  validatePagination,
  validateAuthor
} = require('../middleware/validator');

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Create new author
router.post('/', 
  authenticate,
  authorize('admin'),
  validateAuthor,
  createAuthor
);

// Get all authors with pagination and filtering
router.get('/', 
  validatePagination,
  getAllAuthors
);

// Get author by ID
router.get('/:id', 
  validateObjectId,
  getAuthorById
);

// Update author
router.put('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  validateAuthor,
  updateAuthor
);

// Delete author
router.delete('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deleteAuthor
);

// Deactivate author (soft delete)
router.patch('/:id/deactivate', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deactivateAuthor
);

// Reactivate author
router.patch('/:id/reactivate', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  reactivateAuthor
);

module.exports = router; 