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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
tagSchema.index({ name: 1 });
tagSchema.index({ isActive: 1 });

// Instance method to get public profile
tagSchema.methods.getPublicProfile = function() {
  const tagObject = this.toObject();
  delete tagObject.__v;
  return tagObject;
};

module.exports = mongoose.model('Tag', tagSchema); 