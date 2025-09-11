const { default: mongoose } = require("mongoose");

const booksViewsSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        unique: true,
        required: true
    },
    readers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                unique: true,
                required: [true, 'User ID is required']
            }
        }
    ]

},{
    timestamps: true
})

module.exports = mongoose.model('booksViews', booksViewsSchema)