const express = require('express')
const { authenticate, authorize } = require('../../middleware/auth.js')
const { GetDetails } = require('../../controllers/dashboardControllers.js')

const router = express.Router()

router.get('/project/stats' , authenticate , authorize("admin") , GetDetails)

module.exports = router