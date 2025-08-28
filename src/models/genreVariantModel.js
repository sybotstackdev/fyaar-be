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
    genre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

genreVariantModel.index({ genre: 1 });
genreVariantModel.index({ name: 1 });

module.exports = mongoose.model('GenreVariant', genreVariantModel);
