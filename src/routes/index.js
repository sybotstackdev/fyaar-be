const express = require('express');
const userRoutes = require('./userRoutes');
const genreRoutes = require('./genreRoutes');
const spiceMoodRoutes = require('./spiceMoodRoutes');
const narrativeRoutes = require('./narrativeRoutes');
const locationRoutes = require('./locationRoutes');

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
router.use('/genres', genreRoutes);
router.use('/spice-moods', spiceMoodRoutes);
router.use('/narratives', narrativeRoutes);
router.use('/locations', locationRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

module.exports = router; 