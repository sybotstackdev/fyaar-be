const mongoose = require('mongoose');

const narrativeSchema = new mongoose.Schema({
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
narrativeSchema.index({ optionLabel: 1 });
narrativeSchema.index({ slug: 1 });
narrativeSchema.index({ isActive: 1 });

// Pre-save middleware to generate slug
narrativeSchema.pre('save', function(next) {
  if (!this.isModified('optionLabel')) return next();
  
  // Generate slug from option label
  this.slug = this.optionLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Static method to find narrative by slug
narrativeSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Instance method to get public profile
narrativeSchema.methods.getPublicProfile = function() {
  const narrativeObject = this.toObject();
  delete narrativeObject.__v;
  return narrativeObject;
};

module.exports = mongoose.model('Narrative', narrativeSchema); 