const multer = require('multer');
const ApiError = require('../utils/ApiError');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Invalid file type. Only images are allowed.'), false);
    }
};

const limits = {
    fileSize: 10 * 1024 * 1024,
};

const upload = multer({
    storage,
    fileFilter,
    limits,
});

module.exports = upload;
