const express = require('express');
const {
    createChapter,
    getChapterById,
    updateChapter,
    deleteChapter,
    generateAndUpdateChapters
} = require('../../controllers/Book/bookChapterController');
const { authenticate, authorize } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/rateLimiter');
const { validateNewChapter, validateUpdateChapter } = require('../../middleware/validators/bookValidator');
const { validateObjectId } = require('../../middleware/validator');

const router = express.Router();

router.use(apiLimiter);

router.post('/',
    authenticate,
    authorize('admin'),
    validateNewChapter,
    createChapter
);

router.get('/:id',
    authenticate,
    authorize('admin'),
    validateObjectId,
    getChapterById
);

router.put('/:id',
    authenticate,
    authorize('admin'),
    validateObjectId,
    validateUpdateChapter,
    updateChapter
);

router.delete('/:id',
    authenticate,
    authorize('admin'),
    validateObjectId,
    deleteChapter
);

router.put('/:id/generate-chapters',
    authenticate,
    authorize('admin'),
    validateObjectId,
    generateAndUpdateChapters
);

module.exports = router;