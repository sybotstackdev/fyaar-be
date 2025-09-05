const Contact = require('../models/contactModel');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Create a new contact message
 * @param {Object} contactData - Contact form data
 * @param {Object} requestInfo - Request information (IP, User-Agent)
 * @returns {Promise<Object>} Created contact
 */
const createContact = async (contactData, requestInfo = {}) => {
  try {
    // Add request information
    const dataWithRequestInfo = {
      ...contactData,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    };

    const contact = await Contact.create(dataWithRequestInfo);
    
    logger.info(`New contact message created: ${contact._id} from ${contact.email}`);
    
    return contact;
  } catch (error) {
    logger.error('Error creating contact:', error);
    throw new ApiError(500, 'Failed to create contact message');
  }
};

/**
 * Get all contact messages with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated contact messages
 */
const getAllContacts = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search = '',
      status = '',
      priority = ''
    } = options;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [contacts, totalContacts] = await Promise.all([
      Contact.find(query)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Contact.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalContacts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      contacts,
      pagination: {
        currentPage: page,
        totalPages,
        totalContacts,
        hasNextPage,
        hasPrevPage,
        limit,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
        startIndex: skip + 1,
        endIndex: Math.min(skip + limit, totalContacts),
        showing: `${skip + 1}-${Math.min(skip + limit, totalContacts)} of ${totalContacts}`
      }
    };
  } catch (error) {
    logger.error('Error getting all contacts:', error);
    throw new ApiError(500, 'Failed to retrieve contact messages');
  }
};

/**
 * Get contact by ID
 * @param {string} contactId - Contact ID
 * @returns {Promise<Object>} Contact message
 */
const getContactById = async (contactId) => {
  try {
    const contact = await Contact.findById(contactId);
    
    if (!contact) {
      throw new ApiError(404, 'Contact message not found');
    }
    
    return contact;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error('Error getting contact by ID:', error);
    throw new ApiError(500, 'Failed to retrieve contact message');
  }
};

/**
 * Update contact status
 * @param {string} contactId - Contact ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated contact
 */
const updateContactStatus = async (contactId, status) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      contactId,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      throw new ApiError(404, 'Contact message not found');
    }
    
    logger.info(`Contact status updated: ${contactId} to ${status}`);
    return contact;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error('Error updating contact status:', error);
    throw new ApiError(500, 'Failed to update contact status');
  }
};

/**
 * Delete contact message
 * @param {string} contactId - Contact ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteContact = async (contactId) => {
  try {
    const contact = await Contact.findByIdAndDelete(contactId);
    
    if (!contact) {
      throw new ApiError(404, 'Contact message not found');
    }
    
    logger.info(`Contact message deleted: ${contactId}`);
    return { id: contactId, deleted: true };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error('Error deleting contact:', error);
    throw new ApiError(500, 'Failed to delete contact message');
  }
};

/**
 * Get contacts by status with pagination
 * @param {string} status - Contact status
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Contact messages with pagination info
 */
const getContactsByStatus = async (status, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    // Build query
    const query = { status };

    // Execute query with pagination
    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Contact.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      contacts,
      pagination: {
        currentPage: page,
        totalPages,
        totalContacts: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
        startIndex: skip + 1,
        endIndex: Math.min(skip + limit, total),
        showing: `${skip + 1}-${Math.min(skip + limit, total)} of ${total}`
      }
    };
  } catch (error) {
    logger.error('Error getting contacts by status:', error);
    throw new ApiError(500, 'Failed to retrieve contacts by status');
  }
};

/**
 * Get contact statistics
 * @returns {Promise<Object>} Contact statistics
 */
const getContactStats = async () => {
  try {
    const [statusStats, totalContacts, recentContacts] = await Promise.all([
      Contact.getContactStats(),
      Contact.countDocuments(),
      Contact.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      })
    ]);

    // Format status statistics
    const statusCounts = {
      new: 0,
      read: 0,
      replied: 0,
      archived: 0
    };

    statusStats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    return {
      totalContacts,
      recentContacts,
      statusCounts,
      newMessages: statusCounts.new
    };
  } catch (error) {
    logger.error('Error getting contact stats:', error);
    throw new ApiError(500, 'Failed to retrieve contact statistics');
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactsByStatus,
  getContactStats
};
