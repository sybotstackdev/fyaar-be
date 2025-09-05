const express = require('express');
const userRoutes = require('./userRoutes');
const webUserRoutes = require('./webUserRoutes');
const contactRoutes = require('./contactRoutes');
const genreRoutes = require('./genreRoutes');
const spiceLevelRoutes = require('./spiceLevelRoutes');
const narrativeRoutes = require('./narrativeRoutes');
const locationRoutes = require('./locationRoutes');
const authorRoutes = require('./authorRoutes');
const instructionRoutes = require('./instructionRoutes');
const plotRoutes = require('./plotRoutes');
const chapterRoutes = require('./chapterRoutes');
const visualPromptRoutes = require('./visualPromptRoutes');
const endingRoutes = require('./endingRoutes');
const tagRoutes = require('./tagRoutes');
const bookRoutes = require('./admin/bookRoutes');
const bookChapterRoutes = require('./admin/bookChapterRoutes');
const categoryRoutes = require('./admin/categoryRoutes');
const bookBatchRoutes = require('./admin/bookBatchRoutes');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', userRoutes.authRoutes);
router.use('/users', userRoutes.userRoutes);
router.use('/', webUserRoutes);
router.use('/', contactRoutes);
router.use('/genres', genreRoutes);
router.use('/spice-levels', spiceLevelRoutes);
router.use('/narratives', narrativeRoutes);
router.use('/endings', endingRoutes);
router.use('/tags', tagRoutes);
router.use('/locations', locationRoutes);
router.use('/authors', authorRoutes);
router.use('/instructions', instructionRoutes);
router.use('/plots', plotRoutes);
router.use('/chapters', chapterRoutes);
router.use('/visual-prompts', visualPromptRoutes);
router.use('/books', bookRoutes);
router.use('/books/chapters', bookChapterRoutes);
router.use('/categories', categoryRoutes);
router.use('/batches', bookBatchRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

module.exports = router; 