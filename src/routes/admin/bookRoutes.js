const express = require('express');
const {
    createBook,
    getAllBooks,
    restoreBook,
    getBookById,
    updateBook,
    deleteBook,
    getBookAnalytics,
    getChaptersByBook,
    uploadBookCover,
    permanentlyDeleteBook,
    reorderBookChapters
} = require('../../controllers/Book/bookController');
const { authenticate, authorize, softAuthenticate } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimiter');
const {
    validateNewBook,
    validateUpdateBook,
    validateReorderChapters
} = require('../../middleware/validators/bookValidator');
const { validateObjectId } = require('../../middleware/validator');
const upload = require('../../middleware/upload');

const router = express.Router();

router.use(apiLimiter);

router.post('/',
    authenticate,
    authorize('admin'),
    validateNewBook,
    createBook
);

router.post('/upload-cover',
    authenticate,
    authorize('admin'),
    upload.single('file'),
    uploadBookCover
);

router.get('/', authenticate, authorize('admin'), getAllBooks);

router.get('/:id/chapters',
    authenticate,
    authorize('admin'),
    validateObjectId,
    getChaptersByBook
);

router.patch('/:id/chapters/reorder',
    authenticate,
    authorize('admin'),
    validateObjectId,
    reorderBookChapters
);

router.get('/analytics',
    authenticate,
    authorize('admin'),
    getBookAnalytics
);

router.get('/:id',
    authenticate,
    authorize('admin'),
    validateObjectId,
    getBookById
);

router.put('/:id',
    authenticate,
    authorize('admin'),
    validateObjectId,
    validateUpdateBook,
    updateBook
);

router.delete('/:id',
    authenticate,
    authorize('admin'),
    validateObjectId,
    deleteBook
);

router.patch('/:id/restore',
    authenticate,
    authorize('admin'),
    validateObjectId,
    restoreBook
);

router.delete('/:id/permanent',
    authenticate,
    authorize('admin'),
    validateObjectId,
    permanentlyDeleteBook
);

module.exports = router;