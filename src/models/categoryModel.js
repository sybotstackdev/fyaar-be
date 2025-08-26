const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Category name cannot be more than 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    genres: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['manual', 'auto'],
        default: 'manual',
        required: true
    }
}, {
    timestamps: true
});

// Slug generation from name
categorySchema.pre('save', async function (next) {
    if (!this.isModified('name')) {
        return next();
    }

    const generateBaseSlug = (name) =>
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

    let baseSlug = generateBaseSlug(this.name);
    let slug = baseSlug;
    let counter = 2;

    while (await this.constructor.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    this.slug = slug;
    next();
});

// Indexes for performance
categorySchema.index({ slug: 1 });
categorySchema.index({ type: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ tags: 1 });
categorySchema.index({ genres: 1 });

module.exports = mongoose.model('Category', categorySchema);
