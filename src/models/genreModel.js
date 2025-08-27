const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Genre title is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Genre title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Genre description is required'],
    trim: true,
    maxlength: [5000, 'Genre description cannot be more than 5000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
genreSchema.index({ title: 1 });
genreSchema.index({ slug: 1 });
genreSchema.index({ isActive: 1 });

// Pre-save middleware to generate slug
genreSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  // Generate slug from title
  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Static method to find genre by slug
genreSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Instance method to get public profile
genreSchema.methods.getPublicProfile = function() {
  const genreObject = this.toObject();
  delete genreObject.__v;
  return genreObject;
};

module.exports = mongoose.model('Genre', genreSchema); 