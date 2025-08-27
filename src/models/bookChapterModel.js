const mongoose = require('mongoose');

const bookChapterSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Chapter title is required'],
        trim: true,
        maxlength: [200, 'Chapter title cannot be more than 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Chapter content is required'],
        maxlength: [50000, 'Chapter content cannot be more than 50,000 characters']
    },
    order: {
        type: Number
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

bookChapterSchema.index({ book: 1, order: 1 }, { unique: true, partialFilterExpression: { order: { $exists: true } } });
bookChapterSchema.index({ deletedAt: 1 });

bookChapterSchema.pre('save', async function (next) {
    if (this.isNew && (this.order === null || this.order === undefined)) {
        const lastChapter = await this.constructor.findOne({ book: this.book }).sort('-order');
        this.order = (lastChapter && lastChapter.order !== null) ? lastChapter.order + 1 : 1;
    }
    next();
});

module.exports = mongoose.model('BookChapter', bookChapterSchema);
