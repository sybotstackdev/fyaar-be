const express = require('express');
const router = express.Router();

const {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactsByStatus,
  getContactStats
} = require('../controllers/contactController');
const { authenticate, authorize } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  validateObjectId,
  validatePagination
} = require('../middleware/validator');
const {
  validateContactSubmission,
  validateContactStatusUpdate,
  validateContactId,
  validateStatusParam,
  validatePagination: validateContactPagination
} = require('../middleware/validators/contactValidator');

// Public routes
// Submit contact form
router.post('/web/contact',
  authLimiter,
  validateContactSubmission,
  createContact
);

// Admin only routes
// Get all contact messages with pagination and filtering
router.get('/web/contact',
  authenticate,
  authorize('admin'),
  validateContactPagination,
  getAllContacts
);

// Get specific contact by ID
router.get('/web/contact/:id',
  authenticate,
  authorize('admin'),
  validateContactId,
  getContactById
);

// Update contact status
router.put('/web/contact/:id/status',
  authenticate,
  authorize('admin'),
  validateContactId,
  validateContactStatusUpdate,
  updateContactStatus
);

// Delete contact message
router.delete('/web/contact/:id',
  authenticate,
  authorize('admin'),
  validateContactId,
  deleteContact
);

// Get contacts by status
router.get('/web/contact/status/:status',
  authenticate,
  authorize('admin'),
  validateStatusParam,
  validateContactPagination,
  getContactsByStatus
);

// Get contact statistics
router.get('/web/contact/stats',
  authenticate,
  authorize('admin'),
  getContactStats
);

module.exports = router;
