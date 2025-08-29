const mongoose = require('mongoose');

const endingSchema = new mongoose.Schema({
  optionLabel: {
    type: String,
    required: [true, 'Option label is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
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
endingSchema.index({ optionLabel: 1 });
endingSchema.index({ slug: 1 });
endingSchema.index({ isActive: 1 });

// Pre-save middleware to generate slug
endingSchema.pre('save', function(next) {
  if (!this.isModified('optionLabel')) return next();
  
  // Generate slug from option label
  this.slug = this.optionLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Static method to find ending by slug
endingSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Instance method to get public profile
endingSchema.methods.getPublicProfile = function() {
  const endingObject = this.toObject();
  delete endingObject.__v;
  return endingObject;
};

module.exports = mongoose.model('Ending', endingSchema); 