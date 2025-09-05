const ContactService = require('../services/contactService');
const ApiResponse = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

/**
 * Create a new contact message
 * POST /api/web/contact
 */
const createContact = asyncHandler(async (req, res) => {
  const contactData = req.body;
  
  // Get request information
  const requestInfo = {
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  };

  const contact = await ContactService.createContact(contactData, requestInfo);

  return ApiResponse.created(res, 'Contact message sent successfully', {
    ...contact.toObject(),
    status: 'sent'
  });
});

/**
 * Get all contact messages (Admin only)
 * GET /api/web/contact
 */
const getAllContacts = asyncHandler(async (req, res) => {
  const { page, limit, sort, order, search, status, priority } = req.query;

  const result = await ContactService.getAllContacts({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc',
    search: search || '',
    status: status || '',
    priority: priority || ''
  });

  return ApiResponse.success(res, 200, 'Contact messages retrieved successfully', {
    ...result,
    status: 'success'
  });
});

/**
 * Get specific contact by ID (Admin only)
 * GET /api/web/contact/:id
 */
const getContactById = asyncHandler(async (req, res) => {
  const contact = await ContactService.getContactById(req.params.id);

  return ApiResponse.success(res, 200, 'Contact message retrieved successfully', {
    ...contact.toObject(),
    status: 'found'
  });
});

/**
 * Update contact status (Admin only)
 * PUT /api/web/contact/:id/status
 */
const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, 'Status is required');
  }

  const updatedContact = await ContactService.updateContactStatus(req.params.id, status);

  return ApiResponse.success(res, 200, 'Contact status updated successfully', {
    ...updatedContact.toObject(),
    status: 'updated',
    newStatus: status
  });
});

/**
 * Delete contact message (Admin only)
 * DELETE /api/web/contact/:id
 */
const deleteContact = asyncHandler(async (req, res) => {
  const result = await ContactService.deleteContact(req.params.id);

  return ApiResponse.success(res, 200, 'Contact message deleted successfully', {
    ...result,
    status: 'deleted'
  });
});

/**
 * Get contacts by status (Admin only)
 * GET /api/web/contact/status/:status
 */
const getContactsByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const { page, limit, sort, order } = req.query;

  const result = await ContactService.getContactsByStatus(status, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || 'createdAt',
    order: order || 'desc'
  });

  return ApiResponse.success(res, 200, `Contact messages with status '${status}' retrieved successfully`, {
    ...result,
    status: 'success',
    filterStatus: status,
    totalCount: result.pagination.totalContacts
  });
});

/**
 * Get contact statistics (Admin only)
 * GET /api/web/contact/stats
 */
const getContactStats = asyncHandler(async (req, res) => {
  const stats = await ContactService.getContactStats();

  return ApiResponse.success(res, 200, 'Contact statistics retrieved successfully', {
    ...stats,
    status: 'success',
    generatedAt: new Date().toISOString()
  });
});

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactsByStatus,
  getContactStats
};
