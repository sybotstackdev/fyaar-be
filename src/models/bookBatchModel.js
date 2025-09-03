const mongoose = require('mongoose');

const bookBatchSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    bookCount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    errorMessage: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

bookBatchSchema.virtual('books', {
    ref: 'Book',
    localField: '_id',
    foreignField: 'batchId'
});

module.exports = mongoose.model('BookBatch', bookBatchSchema);