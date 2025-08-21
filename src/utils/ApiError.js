class ApiError extends Error {
    /**
     * Creates a new ApiError instance.
     * @param {number} statusCode - The HTTP status code for the error.
     * @param {string} message - The error message.
     * @param {boolean} [isOperational=true] - Indicates if the error is operational (trusted) or a programming error.
     * @param {string} [stack=''] - The error stack trace.
     */
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;
