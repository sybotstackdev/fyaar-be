const mongoose = require('mongoose');

const instructionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Instruction name is required'],
    trim: true
  },
  instructions: [{
    instructionName : {
      type: String,
      required: [true, 'Instruction name is required'],
      trim: true
    },
    instructionValue : {
      type: String,
      required: [true, 'Instruction value is required'],
      trim: true
    },
    instructionInput : {
      type: String,
      default: ""
    },
    createdAt : {
      type: Date,
      default: Date.now
    },
    updatedAt : {
      type: Date,
      default: Date.now
    }
  }],
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
instructionSchema.index({ name: 1 });
instructionSchema.index({ createdAt: -1 });

// Static method to find instruction by name
instructionSchema.statics.findByName = function(name) {
  return this.findOne({ name: { $regex: name, $options: 'i' } });
};

// Static method to check if instruction name exists
instructionSchema.statics.nameExists = async function(name) {
  const instruction = await this.findOne({ name: { $regex: name, $options: 'i' } });
  return !!instruction;
};

module.exports = mongoose.model('Instruction', instructionSchema); 