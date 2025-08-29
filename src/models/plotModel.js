const mongoose = require('mongoose');

const plotSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Plot title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Plot description is required'],
    trim: true,
  },
  genre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre',
    required: [true, 'Genre is required']
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
plotSchema.index({ title: 1 });
plotSchema.index({ genre: 1 });
plotSchema.index({ slug: 1 });
plotSchema.index({ isActive: 1 });

// Pre-save middleware to generate slug
plotSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  // Generate slug from title
  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Static method to find plot by slug
plotSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Static method to find plots by genre
plotSchema.statics.findByGenre = function(genreId) {
  return this.find({ genre: genreId, isActive: true });
};

// Static method to get chapter count for a plot
plotSchema.statics.getChapterCount = async function(plotId) {
  const Chapter = mongoose.model('Chapter');
  return await Chapter.countDocuments({ plot: plotId, isActive: true });
};

// Static method to get visual prompt count for a plot
plotSchema.statics.getVisualPromptCount = async function(plotId) {
  const VisualPrompt = mongoose.model('VisualPrompt');
  return await VisualPrompt.countDocuments({ plot: plotId, isActive: true });
};

// Instance method to get public profile
plotSchema.methods.getPublicProfile = function() {
  const plotObject = this.toObject();
  delete plotObject.__v;
  return plotObject;
};

// Virtual for chapters
plotSchema.virtual('chapters', {
  ref: 'Chapter',
  localField: '_id',
  foreignField: 'plot',
  options: { sort: { order: 1 } }
});

// Virtual for visual prompts
plotSchema.virtual('visualPrompts', {
  ref: 'VisualPrompt',
  localField: '_id',
  foreignField: 'plot',
  options: { sort: { order: 1 } }
});

// Virtual for chapter count
plotSchema.virtual('chapterCount').get(function() {
  if (this.chapters && Array.isArray(this.chapters)) {
    return this.chapters.length;
  }
  return 0;
});

// Virtual for visual prompt count
plotSchema.virtual('visualPromptCount').get(function() {
  if (this.visualPrompts && Array.isArray(this.visualPrompts)) {
    return this.visualPrompts.length;
  }
  return 0;
});

module.exports = mongoose.model('Plot', plotSchema); 