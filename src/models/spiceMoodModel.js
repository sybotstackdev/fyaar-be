const mongoose = require('mongoose');

const spiceMoodSchema = new mongoose.Schema({
  comboName: {
    type: String,
    required: [true, 'Combo name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Combo name cannot be more than 100 characters']
  },
  moodSpiceBlend: {
    type: [String],
    required: [true, 'Mood + Spice Blend is required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one mood + spice blend item is required'
    }
  },
  intensity: {
    type: String,
    required: [true, 'Intensity is required'],
    enum: {
      values: ['Low', 'Low–Med', 'Medium', 'High', 'Very High'],
      message: 'Intensity must be one of: Low, Low–Med, Medium, High, Very High'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
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
spiceMoodSchema.index({ comboName: 1 });
spiceMoodSchema.index({ slug: 1 });
spiceMoodSchema.index({ isActive: 1 });
spiceMoodSchema.index({ intensity: 1 });

// Pre-save middleware to generate slug
spiceMoodSchema.pre('save', function(next) {
  if (!this.isModified('comboName')) return next();
  
  // Generate slug from combo name
  this.slug = this.comboName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Static method to find spice mood by slug
spiceMoodSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Instance method to get public profile
spiceMoodSchema.methods.getPublicProfile = function() {
  const spiceMoodObject = this.toObject();
  delete spiceMoodObject.__v;
  return spiceMoodObject;
};

module.exports = mongoose.model('SpiceMood', spiceMoodSchema); 