const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: 6
  },
  type: {
    type: String,
    enum: ['login', 'registration', 'password_reset'],
    default: 'login'
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static method to generate OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to find valid OTP
otpSchema.statics.findValidOTP = function(email, otp, type = 'login') {
  return this.findOne({
    email: email.toLowerCase(),
    otp,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to invalidate (delete) OTPs for an email
otpSchema.statics.invalidateOTPs = function(email, type = 'login') {
  return this.deleteMany({
    email: email.toLowerCase(),
    type,
    isUsed: false
  });
};

module.exports = mongoose.model('OTP', otpSchema);
