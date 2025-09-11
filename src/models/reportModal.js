const { default: mongoose } = require("mongoose");

const ReportModal = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'Book'
    },
    report: {
        type : String,
        default : ""
    },
    isRead : {
        type : Boolean,
        default : false
    }
},{ timestamps: true })

module.exports = mongoose.model('reports' , ReportModal)