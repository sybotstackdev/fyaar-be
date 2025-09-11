const express = require('express')
const { apiLimiter } = require('../middleware/rateLimiter')
const { authenticate, authorize } = require('../middleware/auth')
const { CreateReport, getAllReports, getSingleReport, updateReportStatus, deleteReport } = require('../controllers/reportController')

const router = express.Router()

router.use(apiLimiter)

router.post('/' , 
    authenticate,
    CreateReport
)

router.get('/' , 
    authenticate,
    authorize('admin'),
    getAllReports
)

router.get('/:id' , 
    authenticate,
    authorize('admin'),
    getSingleReport
)

router.put('/:id' , 
    authenticate,
    authorize('admin'),
    updateReportStatus
)

router.delete('/:id' , 
    authenticate,
    authorize('admin'),
    deleteReport
)

module.exports = router