const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
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
tagSchema.index({ name: 1 });
tagSchema.index({ slug: 1 });
tagSchema.index({ isActive: 1 });

// Pre-save middleware to generate slug
tagSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  // Generate slug from name
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Static method to find tag by slug
tagSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Instance method to get public profile
tagSchema.methods.getPublicProfile = function() {
  const tagObject = this.toObject();
  delete tagObject.__v;
  return tagObject;
};

module.exports = mongoose.model('Tag', tagSchema); 