const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Location name cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Location category is required'],
    enum: {
      values: ['tier1-cities', 'tier2-cities', 'vacation-travel', 'international', 'speculative-fantasy'],
      message: 'Category must be one of: tier1-cities, tier2-cities, vacation-travel, international, speculative-fantasy'
    }
  },
  description: {
    type: String,
    required: [true, 'Location description is required'],
    trim: true,
    maxlength: [1000, 'Location description cannot be more than 1000 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [100, 'Country name cannot be more than 100 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [100, 'State name cannot be more than 100 characters']
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
locationSchema.index({ name: 1 });
locationSchema.index({ category: 1 });
locationSchema.index({ country: 1 });
locationSchema.index({ slug: 1 });
locationSchema.index({ isActive: 1 });

// Pre-save middleware to generate slug
locationSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  // Generate slug from name
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Static method to find location by slug
locationSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Static method to find locations by category
locationSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

// Instance method to get public profile
locationSchema.methods.getPublicProfile = function() {
  const locationObject = this.toObject();
  delete locationObject.__v;
  return locationObject;
};

module.exports = mongoose.model('Location', locationSchema); 