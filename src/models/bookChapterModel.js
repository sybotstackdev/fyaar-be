const mongoose = require('mongoose');

const bookChapterSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Chapter title is required'],
    trim: true,
    maxlength: [200, 'Chapter title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Chapter content is required']
  },
  order: {
    type: Number,
    required: [true, 'Chapter order is required']
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    index: true
  },
  deletedAt: {
    type: Date,
    default: null,
    index: true
  }
}, {
  timestamps: true
});

bookChapterSchema.index({ book: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('BookChapter', bookChapterSchema);
