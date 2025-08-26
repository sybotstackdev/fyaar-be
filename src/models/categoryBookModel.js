const mongoose = require('mongoose');

const categoryBookSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    order: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for performance and data integrity
// Ensures a book can only be in a category once
categoryBookSchema.index({ category: 1, book: 1 }, { unique: true });

// For quickly fetching and ordering books within a category
categoryBookSchema.index({ category: 1, order: 1 });

// For quickly finding all categories a book belongs to
categoryBookSchema.index({ book: 1 });

module.exports = mongoose.model('CategoryBook', categoryBookSchema);
