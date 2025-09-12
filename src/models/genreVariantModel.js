const mongoose = require('mongoose');

const genreVariantModel = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    relation: {
        type: String,
        required: [true, 'Name is required'],
        enum : ["Title" , "Description"],
        default : "Title"
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

genreVariantModel.index({ genre: 1 });
genreVariantModel.index({ name: 1 });

module.exports = mongoose.model('GenreVariant', genreVariantModel);
