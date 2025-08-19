const express = require('express');
const {
  createTag,
  getAllTags,
  getTagById,
  getTagBySlug,
  updateTag,
  deleteTag,
  toggleTagStatus,
} = require('../controllers/tagController');
const { authenticate, authorize } = require('../middleware/auth');

const {
  validateTag,
  validateObjectId,
  validatePagination
} = require('../middleware/validator');

const router = express.Router();

router.get('/slug/:slug', getTagBySlug);

// Admin-only routes
router.post('/', 
  authenticate,
  authorize('admin'),
  validateTag,
  createTag
);

router.get('/', 
  authenticate,
  validatePagination,
  getAllTags
);

router.get('/:id', 
  authenticate,
  validateObjectId,
  getTagById
);

router.put('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  validateTag,
  updateTag
);

router.delete('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deleteTag
);

router.patch('/:id/toggle', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  toggleTagStatus
);

module.exports = router; 