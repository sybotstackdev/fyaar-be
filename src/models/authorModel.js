const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  authorName: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot be more than 100 characters']
  },
  writingStyle: {
    type: String,
    required: [true, 'Writing style is required'],
    trim: true,
    maxlength: [1000, 'Writing style cannot be more than 1000 characters']
  },
  designStyle: {
    type: String,
    required: [true, 'Design style is required'],
    trim: true,
    maxlength: [1000, 'Design style cannot be more than 1000 characters']
  },
  genre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre',
    required: [true, 'Genre is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
authorSchema.index({ authorName: 1 });
authorSchema.index({ genre: 1 });
authorSchema.index({ createdAt: -1 });

// Static method to find author by name
authorSchema.statics.findByName = function(authorName) {
  return this.findOne({ authorName: { $regex: authorName, $options: 'i' } });
};

// Static method to find authors by genre
authorSchema.statics.findByGenre = function(genreId) {
  return this.find({ genre: genreId, isActive: true });
};

// Static method to check if author name exists
authorSchema.statics.nameExists = async function(authorName) {
  const author = await this.findOne({ authorName: { $regex: authorName, $options: 'i' } });
  return !!author;
};

module.exports = mongoose.model('Author', authorSchema); 