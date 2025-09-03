const mongoose = require('mongoose');

const bookGeneratedContentSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
        index: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookBatch',
        required: true,
        index: true
    },
    contentType: {
        type: String,
        enum: ['title', 'description', 'tag', 'cover_prompt', 'cover_image_url', 'chapter'],
        required: true,
        index: true
    },
    content: {
        type: String,
        default: '',
        // required: true
    },
    titles: [{
        title: { type: String, required: true },
        category: { type: String, required: true },
        status: { type: String, enum: ['active', 'inactive'], default: 'inactive' }
    }],
    promptUsed: {
        type: String
    },
    rawApiResponse: {
        type: String
    },
    source: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('BookGeneratedContent', bookGeneratedContentSchema);
