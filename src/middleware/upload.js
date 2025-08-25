const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Use memory storage to process images with sharp before uploading to S3
const storage = multer.memoryStorage();

// Filter for allowed image file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|heic|heif/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());

  if (mimetype || extname) {
    return cb(null, true);
  }
  cb(new ApiError(400, 'Invalid file type. Only JPEG, PNG, WEBP, and HEIC images are allowed.'));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

module.exports = upload;
