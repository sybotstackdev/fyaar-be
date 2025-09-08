const Instruction = require('../models/instructionModel');
const logger = require('../utils/logger');

/**
 * Create a new instruction
 * @param {Object} instructionData - Instruction data
 * @returns {Object} Created instruction
 */
const createInstruction = async (instructionData) => {
  try {
    // Check if instruction name already exists
    const existingInstruction = await Instruction.nameExists(instructionData.name);
    if (existingInstruction) {
      throw new Error('Instruction name already exists');
    }

    // Create new instruction
    const instruction = new Instruction(instructionData);
    await instruction.save();

    logger.info(`New instruction created: ${instruction.name}`);

    return instruction;
  } catch (error) {
    logger.error('Instruction creation error:', error.message);
    throw error;
  }
};

/**
 * Get all instructions with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Object} Instructions and pagination info
 */
const getAllInstructions = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search = '',
      isActive = ''
    } = options;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'instructions.instructionName': { $regex: search, $options: 'i' } },
        { 'instructions.instructionValue': { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query
    const instructions = await Instruction.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Instruction.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    logger.info(`Retrieved ${instructions.length} instructions`);

    return {
      results: instructions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    };
  } catch (error) {
    logger.error('Get all instructions error:', error.message);
    throw error;
  }
};

/**
 * Get instruction by ID
 * @param {string} instructionId - Instruction ID
 * @returns {Object} Instruction data
 */
const getInstructionById = async (instructionId) => {
  try {
    const instruction = await Instruction.findById(instructionId);

    if (!instruction) {
      throw new Error('Instruction not found');
    }

    return instruction;
  } catch (error) {
    logger.error('Get instruction by ID error:', error.message);
    throw error;
  }
};

/**
 * Update instruction
 * @param {string} instructionId - Instruction ID
 * @param {Object} updateData - Update data
 * @returns {Object} Updated instruction
 */
const updateInstruction = async (instructionId, updateData) => {
  try {
    const instruction = await Instruction.findById(instructionId);

    if (!instruction) {
      throw new Error('Instruction not found');
    }

    // Check if new instruction name conflicts with existing instructions
    if (updateData.name && updateData.name !== instruction.name) {
      const existingInstruction = await Instruction.findOne({
        name: { $regex: updateData.name, $options: 'i' },
        _id: { $ne: instructionId }
      });
      if (existingInstruction) {
        throw new Error('Instruction name already exists');
      }
    }

    // Update instruction
    Object.assign(instruction, updateData);
    await instruction.save();

    logger.info(`Instruction updated: ${instruction.name}`);

    return instruction;
  } catch (error) {
    logger.error('Update instruction error:', error.message);
    throw error;
  }
};

/**
 * Delete instruction
 * @param {string} instructionId - Instruction ID
 * @returns {boolean} Success status
 */
const deleteInstruction = async (instructionId) => {
  try {
    const instruction = await Instruction.findById(instructionId);

    if (!instruction) {
      throw new Error('Instruction not found');
    }

    await Instruction.findByIdAndDelete(instructionId);

    logger.info(`Instruction deleted: ${instruction.name}`);

    return true;
  } catch (error) {
    logger.error('Delete instruction error:', error.message);
    throw error;
  }
};

/**
 * Soft delete instruction (set isActive to false)
 * @param {string} instructionId - Instruction ID
 * @returns {Object} Updated instruction
 */
const deactivateInstruction = async (instructionId) => {
  try {
    const instruction = await Instruction.findById(instructionId);

    if (!instruction) {
      throw new Error('Instruction not found');
    }

    instruction.isActive = false;
    await instruction.save();

    logger.info(`Instruction deactivated: ${instruction.name}`);

    return instruction;
  } catch (error) {
    logger.error('Deactivate instruction error:', error.message);
    throw error;
  }
};

/**
 * Reactivate instruction (set isActive to true)
 * @param {string} instructionId - Instruction ID
 * @returns {Object} Updated instruction
 */
const reactivateInstruction = async (instructionId) => {
  try {
    const instruction = await Instruction.findById(instructionId);

    if (!instruction) {
      throw new Error('Instruction not found');
    }

    instruction.isActive = true;
    await instruction.save();

    logger.info(`Instruction reactivated: ${instruction.name}`);

    return instruction;
  } catch (error) {
    logger.error('Reactivate instruction error:', error.message);
    throw error;
  }
};

module.exports = {
  createInstruction,
  getAllInstructions,
  getInstructionById,
  updateInstruction,
  deleteInstruction,
  deactivateInstruction,
  reactivateInstruction
}; 