const express = require('express')
const { apiLimiter } = require('../middleware/rateLimiter')
const { authenticate, authorize } = require('../middleware/auth')
const { validateObjectId, validateGenreVariant } = require('../middleware/validator')
const { GetAllVariants, GetSingleVariant, createVarient, updateVarient, deleteVariant } = require('../controllers/variantsController')

const router = express.Router()

router.use(apiLimiter)

router.get('/' , 
    authenticate,
    authorize('admin'),
    GetAllVariants
)

router.get('/:variantId' , 
    authenticate,
    authorize('admin'),
    GetSingleVariant
)

// Admin-only routes
router.post('/', 
  authenticate,
  authorize('admin'),
  validateGenreVariant,
  createVarient
);

router.put('/:id', 
  authenticate,
  authorize('admin'), 
  validateObjectId,
  validateGenreVariant,
  updateVarient
);

router.delete('/:id', 
  authenticate,
  authorize('admin'),
  validateObjectId,
  deleteVariant
);

module.exports = router