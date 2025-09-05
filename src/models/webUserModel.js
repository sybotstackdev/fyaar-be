const mongoose = require('mongoose');

const webUserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot be more than 100 characters']
  },
  penName: {
    type: String,
    trim: true,
    maxlength: [50, 'Pen name cannot be more than 50 characters'],
    default: null
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot be more than 20 characters'],
    default: null
  },
  ageGroup: {
    type: String,
    required: [true, 'Age group is required'],
    trim: true
  },
  languages: {
    type: [String],
    required: [true, 'Languages are required'],
    validate: {
      validator: function(languages) {
        return languages && languages.length > 0;
      },
      message: 'At least one language must be specified'
    }
  },
  socialLinks: {
    type: [String],
    default: []
  },
  experienceLevel: {
    type: String,
    required: [true, 'Experience level is required'],
    trim: true
  },
  publishedBefore: {
    type: String,
    required: [true, 'Published before status is required'],
    trim: true
  },
  sharedWork: {
    type: [String],
    default: []
  },
  sharedWorkOther: {
    type: String,
    trim: true,
    maxlength: [200, 'Other shared work description cannot be more than 200 characters'],
    default: null
  },
  wordCounts: {
    type: [String],
    default: []
  },
  contentTypes: {
    type: [String],
    required: [true, 'Content types are required'],
    validate: {
      validator: function(contentTypes) {
        return contentTypes && contentTypes.length > 0;
      },
      message: 'At least one content type must be specified'
    }
  },
  contentTypesOther: {
    type: String,
    trim: true,
    maxlength: [200, 'Other content types description cannot be more than 200 characters'],
    default: null
  },
  genres: {
    type: [String],
    required: [true, 'Genres are required'],
    validate: {
      validator: function(genres) {
        return genres && genres.length > 0;
      },
      message: 'At least one genre must be specified'
    }
  },
  genresOther: {
    type: String,
    trim: true,
    maxlength: [200, 'Other genres description cannot be more than 200 characters'],
    default: null
  },
  readyContent: {
    type: String,
    required: [true, 'Ready content status is required'],
    trim: true
  },
  monthlyOutput: {
    type: String,
    required: [true, 'Monthly output is required'],
    trim: true
  },
  writingSample: {
    type: String,
    trim: true,
    default: null
  },
  writingSampleFile: {
    type: String,
    default: null
  },
  fileInfo: {
    originalName: {
      type: String,
      default: null
    },
    size: {
      type: Number,
      default: null
    },
    mimetype: {
      type: String,
      default: null
    },
    dataUrl: {
      type: String,
      default: null
    }
  },
  motivation: {
    type: String,
    required: [true, 'Motivation is required'],
    trim: true
  },
  originalContent: {
    type: Boolean,
    required: [true, 'Original content agreement is required']
  },
  agreeToReview: {
    type: Boolean,
    required: [true, 'Agreement to review is required']
  },
  registrationStatus: {
    type: String,
    default: 'pending',
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
webUserSchema.index({ email: 1 });
webUserSchema.index({ registrationStatus: 1 });
webUserSchema.index({ createdAt: -1 });
webUserSchema.index({ fullName: 'text', email: 'text' });

// Virtual for formatted registration date
webUserSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Instance method to get public profile (without sensitive data)
webUserSchema.methods.getPublicProfile = function() {
  const profile = this.toObject();
  delete profile.__v;
  return profile;
};

// Static method to find by email
webUserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to check if email exists
webUserSchema.statics.emailExists = async function(email) {
  const user = await this.findOne({ email: email.toLowerCase() });
  return !!user;
};

// Static method to get users by status
webUserSchema.statics.getByStatus = function(status, options = {}) {
  const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = options;
  const skip = (page - 1) * limit;
  
  return this.find({ registrationStatus: status })
    .sort({ [sort]: order === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(limit);
};

// Pre-save middleware to validate conditional fields
webUserSchema.pre('save', function(next) {
  // If sharedWork includes 'other', sharedWorkOther should be provided
  if (this.sharedWork && this.sharedWork.includes('other')) {
    if (!this.sharedWorkOther || this.sharedWorkOther.trim().length === 0) {
      return next(new Error('Please specify other shared work details when "other" is selected'));
    }
  }
  
  // If contentTypes includes 'other', contentTypesOther should be provided
  if (this.contentTypes && this.contentTypes.includes('other')) {
    if (!this.contentTypesOther || this.contentTypesOther.trim().length === 0) {
      return next(new Error('Please specify other content types when "other" is selected'));
    }
  }
  
  // If genres includes 'other', genresOther should be provided
  if (this.genres && this.genres.includes('other')) {
    if (!this.genresOther || this.genresOther.trim().length === 0) {
      return next(new Error('Please specify other genres when "other" is selected'));
    }
  }
  
  next();
});

module.exports = mongoose.model('WebUser', webUserSchema);
