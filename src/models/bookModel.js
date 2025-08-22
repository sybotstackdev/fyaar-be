const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Book title is required'],
        trim: true,
        maxlength: [200, 'Book title cannot be more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Book description is required'],
        trim: true,
        maxlength: [5000, 'Book description cannot be more than 5000 characters']
    },
    authors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
        required: [true, 'At least one author is required']
    }],
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        required: [true, 'At least one tag is required']
    }],
    bookCover: {
        type: String,
        required: [true, 'Book cover is required']
    },
    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
    plots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plot' }],
    narrative: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Narrative' }],
    endings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ending' }],
    spiceMoods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SpiceMood' }],
    locations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived', 'unpublished'],
        default: 'unpublished',
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
bookSchema.index({ title: 'text', description: 'text' });
bookSchema.index({ slug: 1 });
bookSchema.index({ authors: 1 });
bookSchema.index({ tags: 1 });
bookSchema.index({ genres: 1 });
bookSchema.index({ spiceMoods: 1 });
bookSchema.index({ locations: 1 });
bookSchema.index({ plots: 1 });
bookSchema.index({ narrative: 1 });
bookSchema.index({ endings: 1 });


// Slug generation
bookSchema.pre('save', async function (next) {
    if (!this.isModified('title')) {
        return next();
    }

    const generateBaseSlug = (title) =>
        title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

    let baseSlug = generateBaseSlug(this.title);
    let slug = baseSlug;
    let counter = 2;

    while (await this.constructor.findOne({ slug: slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    this.slug = slug;
    next();
});

// Soft delete
bookSchema.pre('findOneAndUpdate', async function (next) {
    if (this.getUpdate().isDeleted) {
        this.getUpdate().deletedAt = new Date();
    }
    next();
});

// Virtual for chapter count
bookSchema.virtual('chapterCount', {
    ref: 'BookChapter',
    localField: '_id',
    foreignField: 'book',
    count: true
});

module.exports = mongoose.model('Book', bookSchema);