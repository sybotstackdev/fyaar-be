const InstructionService = require('../services/instructionService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create a new instruction
 * POST /api/instructions
 */
const createInstruction = asyncHandler(async (req, res) => {
  const { name, instructions } = req.body;

  const result = await InstructionService.createInstruction({
    name,
    instructions
  });

  return ApiResponse.created(res, 'Instruction created successfully', result);
});

/**
 * Get all instructions with pagination and filtering
 * GET /api/instructions
 */
const getAllInstructions = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, isActive } = req.query;

  const result = await InstructionService.getAllInstructions({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc',
    search: search || '',
    isActive: isActive || ''
  });

  return ApiResponse.success(res, 200, 'Instructions retrieved successfully', result);
});

/**
 * Get instruction by ID
 * GET /api/instructions/:id
 */
const getInstructionById = asyncHandler(async (req, res) => {
  const instruction = await InstructionService.getInstructionById(req.params.id);

  return ApiResponse.success(res, 200, 'Instruction retrieved successfully', instruction);
});

/**
 * Update instruction
 * PUT /api/instructions/:id
 */
const updateInstruction = asyncHandler(async (req, res) => {
  const updatedInstruction = await InstructionService.updateInstruction(req.params.id, req.body);

  return ApiResponse.success(res, 200, 'Instruction updated successfully', updatedInstruction);
});

/**
 * Delete instruction
 * DELETE /api/instructions/:id
 */
const deleteInstruction = asyncHandler(async (req, res) => {
  await InstructionService.deleteInstruction(req.params.id);

  return ApiResponse.success(res, 200, 'Instruction deleted successfully');
});

/**
 * Deactivate instruction (soft delete)
 * PATCH /api/instructions/:id/deactivate
 */
const deactivateInstruction = asyncHandler(async (req, res) => {
  const instruction = await InstructionService.deactivateInstruction(req.params.id);

  return ApiResponse.success(res, 200, 'Instruction deactivated successfully', instruction);
});

/**
 * Reactivate instruction
 * PATCH /api/instructions/:id/reactivate
 */
const reactivateInstruction = asyncHandler(async (req, res) => {
  const instruction = await InstructionService.reactivateInstruction(req.params.id);

  return ApiResponse.success(res, 200, 'Instruction reactivated successfully', instruction);
});

module.exports = {
  createInstruction,
  getAllInstructions,
  getInstructionById,
  updateInstruction,
  deleteInstruction,
  deactivateInstruction,
  reactivateInstruction
}; 