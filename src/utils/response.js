/**
 * Standard API response utility functions
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {*} data - Response data
 */
const success = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} errors - Error details
 */
const error = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Created response
 * @param {Object} res - Express response object
 * @param {string} message - Response message
 * @param {*} data - Response data
 */
const created = (res, message = 'Resource created successfully', data = null) => {
  return success(res, 201, message, data);
};

/**
 * No content response
 * @param {Object} res - Express response object
 */
const noContent = (res) => {
  return res.status(204).send();
};

/**
 * Bad request response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {*} errors - Validation errors
 */
const badRequest = (res, message = 'Bad Request', errors = null) => {
  return error(res, 400, message, errors);
};

/**
 * Unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, 401, message);
};

/**
 * Forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const forbidden = (res, message = 'Forbidden') => {
  return error(res, 403, message);
};

/**
 * Not found response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const notFound = (res, message = 'Resource not found') => {
  return error(res, 404, message);
};

/**
 * Conflict response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const conflict = (res, message = 'Resource conflict') => {
  return error(res, 409, message);
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Array} errors - Validation errors
 */
const validationError = (res, message = 'Validation failed', errors = []) => {
  return error(res, 422, message, errors);
};

/**
 * Internal server error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const internalError = (res, message = 'Internal Server Error') => {
  return error(res, 500, message);
};

module.exports = {
  success,
  error,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  internalError
}; 