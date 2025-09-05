const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Use memory storage to process files as base64
const storage = multer.memoryStorage();

// Filter for allowed document file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());

  if (mimetype || extname) {
    return cb(null, true);
  }
  cb(new ApiError(400, 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
};

const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter
});

// Middleware to convert file to base64
const convertToBase64 = (req, res, next) => {
  if (req.file) {
    const base64String = req.file.buffer.toString('base64');
    req.file.base64 = base64String;
    req.file.dataUrl = `data:${req.file.mimetype};base64,${base64String}`;
  }
  next();
};

module.exports = { upload, convertToBase64 };
