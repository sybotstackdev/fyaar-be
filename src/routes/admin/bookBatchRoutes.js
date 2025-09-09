const express = require('express');
const router = express.Router();
const { createBookBatch, getBookBatches, getBookBatchById, deleteBookBatch, UpdateBookBatch } = require('../../controllers/Book/bookBatchController');
const { authenticate, authorize } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimiter');
const { createBookBatchSchema } = require('../../middleware/validators/bookBatchValidator');
const { validatePagination, validateObjectId } = require('../../middleware/validator');

router.use(apiLimiter);

router.route('/')
    .post(
        authenticate,
        authorize('admin'),
        createBookBatchSchema,
        createBookBatch
    );

router.route('/:id').put(
    authenticate,
    authorize('admin'),
    UpdateBookBatch
)

router.route('/')
    .get(
        authenticate,
        authorize('admin'),
        validatePagination,
        getBookBatches
    );

router.route('/:id')
    .get(
        authenticate,
        authorize('admin'),
        validateObjectId,
        getBookBatchById
    );

router.route('/:id')
    .delete(
        authenticate,
        authorize('admin'),
        validateObjectId,
        deleteBookBatch
    );

module.exports = router;
