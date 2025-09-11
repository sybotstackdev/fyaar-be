const express = require('express');
const { apiLimiter } = require('../middleware/rateLimiter.js');
const { authenticate } = require('../middleware/auth');
const { HandleBookMark, getUserBookmarks, getSingleUserBookmark } = require('../controllers/Book/bookmarkController');

const router = express.Router();

router.use(apiLimiter)

router.post("/:id" , 
    authenticate,
    HandleBookMark
)

router.get("/" , 
    authenticate,
    getUserBookmarks
)

router.get("/:id" , 
    authenticate,
    getSingleUserBookmark
)


module.exports = router