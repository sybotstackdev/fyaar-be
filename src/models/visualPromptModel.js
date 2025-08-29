const mongoose = require('mongoose');

const visualPromptSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Visual prompt name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Visual prompt description is required'],
    trim: true
  },
  plot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plot',
    required: [true, 'Plot is required']
  },
  order: {
    type: Number,
    required: [true, 'Visual prompt order is required'],
    min: [1, 'Visual prompt order must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
visualPromptSchema.index({ plot: 1 });
visualPromptSchema.index({ order: 1 });
visualPromptSchema.index({ slug: 1 });
visualPromptSchema.index({ isActive: 1 });

// Compound index for plot and order
visualPromptSchema.index({ plot: 1, order: 1 });

// Pre-save middleware to generate slug
visualPromptSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  // Generate slug from name
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Static method to find visual prompt by slug
visualPromptSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Static method to find visual prompts by plot
visualPromptSchema.statics.findByPlot = function(plotId) {
  return this.find({ plot: plotId, isActive: true }).sort({ order: 1 });
};

// Static method to get next order number for a plot
visualPromptSchema.statics.getNextOrder = async function(plotId) {
  const lastVisualPrompt = await this.findOne({ plot: plotId })
    .sort({ order: -1 })
    .select('order');
  
  return lastVisualPrompt ? lastVisualPrompt.order + 1 : 1;
};

// Instance method to get public profile
visualPromptSchema.methods.getPublicProfile = function() {
  const visualPromptObject = this.toObject();
  delete visualPromptObject.__v;
  return visualPromptObject;
};

module.exports = mongoose.model('VisualPrompt', visualPromptSchema); 