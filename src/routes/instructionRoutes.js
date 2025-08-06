const express = require('express');
const {
  createInstruction,
  getAllInstructions,
  getInstructionById,
  updateInstruction,
  deleteInstruction,
  deactivateInstruction,
  reactivateInstruction
} = require('../controllers/instructionController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  validateObjectId,
  validatePagination,
  validateInstruction
} = require('../middleware/validator');

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Create new instruction
router.post('/', 
  authenticate,
  authorize('admin'),
  validateInstruction,
  createInstruction
);

// Get all instructions with pagination and filtering
router.get('/', 
  validatePagination,
  getAllInstructions
);

// Get instruction by ID
router.get('/:id', 
  validateObjectId,
  getInstructionById
);

// Update instruction
router.put('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  validateInstruction,
  updateInstruction
);

// Delete instruction
router.delete('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deleteInstruction
);

// Deactivate instruction (soft delete)
router.patch('/:id/deactivate', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deactivateInstruction
);

// Reactivate instruction
router.patch('/:id/reactivate', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  reactivateInstruction
);

module.exports = router; 