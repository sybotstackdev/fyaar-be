const mongoose = require('mongoose');

const spiceLevelSchema = new mongoose.Schema({
  comboName: {
    type: String,
    required: [true, 'Combo name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Combo name cannot be more than 100 characters']
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
spiceLevelSchema.index({ comboName: 1 });
spiceLevelSchema.index({ slug: 1 });
spiceLevelSchema.index({ isActive: 1 });

// Pre-save middleware to generate slug
spiceLevelSchema.pre('save', function(next) {
  if (!this.isModified('comboName')) return next();
  
  // Generate slug from combo name
  this.slug = this.comboName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Static method to find spice level by slug
spiceLevelSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Instance method to get public profile
spiceLevelSchema.methods.getPublicProfile = function() {
  const spiceLevelObject = this.toObject();
  delete spiceLevelObject.__v;
  return spiceLevelObject;
};

module.exports = mongoose.model('SpiceLevel', spiceLevelSchema);
