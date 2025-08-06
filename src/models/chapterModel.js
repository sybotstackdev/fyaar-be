const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chapter name is required'],
    trim: true,
    maxlength: [200, 'Chapter name cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Chapter description is required'],
    trim: true,
    maxlength: [2000, 'Chapter description cannot be more than 2000 characters']
  },
  plot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plot',
    required: [true, 'Plot is required']
  },
  order: {
    type: Number,
    required: [true, 'Chapter order is required'],
    min: [1, 'Chapter order must be at least 1']
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
chapterSchema.index({ plot: 1 });
chapterSchema.index({ order: 1 });
chapterSchema.index({ slug: 1 });
chapterSchema.index({ isActive: 1 });

// Compound index for plot and order
chapterSchema.index({ plot: 1, order: 1 });

// Pre-save middleware to generate slug
chapterSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  // Generate slug from name
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Static method to find chapter by slug
chapterSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Static method to find chapters by plot
chapterSchema.statics.findByPlot = function(plotId) {
  return this.find({ plot: plotId, isActive: true }).sort({ order: 1 });
};

// Static method to get next order number for a plot
chapterSchema.statics.getNextOrder = async function(plotId) {
  const lastChapter = await this.findOne({ plot: plotId })
    .sort({ order: -1 })
    .select('order');
  
  return lastChapter ? lastChapter.order + 1 : 1;
};

// Instance method to get public profile
chapterSchema.methods.getPublicProfile = function() {
  const chapterObject = this.toObject();
  delete chapterObject.__v;
  return chapterObject;
};

module.exports = mongoose.model('Chapter', chapterSchema); 