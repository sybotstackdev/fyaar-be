const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  // The token will be automatically removed from the database after this date
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '1s' }
  },
});

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
