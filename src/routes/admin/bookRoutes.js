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
    uploadCoverImage,
    permanentlyDeleteBook,
    reorderBookChapters
} = require('../../controllers/Book/bookController');
const { authenticate, authorize, softAuthenticate } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimiter');
const {
    validateNewBook,
    validateUpdateBook
} = require('../../middleware/validators/bookValidator');
const { validateObjectId } = require('../../middleware/validator');
const multer = require('multer');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

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
    uploadCoverImage
);

router.get('/', softAuthenticate, getAllBooks);

router.get('/:id/chapters',
    softAuthenticate,
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