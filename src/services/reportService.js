const mongoose = require('mongoose')
const Book = require('../models/bookModel.js')
const Report = require('../models/reportModal.js')

/**
 * Create a new report
 */
const createReport = async (payload, user) => {
    try {
        const { book, report = "" } = payload

        if (!mongoose.Types.ObjectId.isValid(user) || !mongoose.Types.ObjectId.isValid(book)) {
            return {
                success: false,
                status: 400,
                message: "Invalid user or book ID"
            }
        }

        const bookExists = await Book.exists({ _id: book })
        if (!bookExists) {
            return {
                success: false,
                status: 404,
                message: "Book not found"
            }
        }

        const alreadyReported = await Report.findOne({ user, book })
        if (alreadyReported) {
            return {
                success: false,
                status: 200,
                message: "You have already reported this book",
                data: alreadyReported
            }
        }

        const newReport = await Report.create({ user, book, report })
        return {
            success: true,
            status: 201,
            message: "Your Report Has Been Received!",
            data: newReport
        }
    } catch (err) {
        console.error("createReport:", err)
        return {
            success: false,
            status: 500,
            message: err.message || "Server error"
        }
    }
}

/**
 * Get all reports (Admin use)
 */
const getAllReports = async () => {
    try {
        const reports = await Report.find()
            .populate("book", "title")

        return {
            success: true,
            status: 200,
            message: "Reports fetched successfully",
            data: reports
        }
    } catch (err) {
        return {
            success: false,
            status: 500,
            message: err.message || "Error fetching reports"
        }
    }
}

/**
 * Get single report by ID
 */
const getSingleReport = async (reportId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return {
                success: false,
                status: 400,
                message: "Invalid report ID"
            }
        }

        const report = await Report.findById(reportId)
            .populate("book", "title")

        if (!report) {
            return {
                success: false,
                status: 404,
                message: "Report not found"
            }
        }

        return {
            success: true,
            status: 200,
            message: "Report fetched successfully",
            data: report
        }
    } catch (err) {
        return {
            success: false,
            status: 500,
            message: err.message || "Error fetching report"
        }
    }
}

/**
 * Update report status
 */
const updateReportStatus = async (reportId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return {
                success: false,
                status: 400,
                message: "Invalid report ID"
            }
        }

        const report = await Report.findById(reportId)
        if (!report) {
            return {
                success: false,
                status: 404,
                message: "Report not found"
            }
        }

        report.isRead = true
        await report.save()

        return {
            success: true,
            status: 200,
            message: "Report status updated successfully",
            data: report
        }
    } catch (err) {
        return {
            success: false,
            status: 500,
            message: err.message || "Error updating report status"
        }
    }
}

/**
 * Delete report by ID
 */
const deleteReport = async (reportId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return {
                success: false,
                status: 400,
                message: "Invalid report ID"
            };
        }

        const report = await Report.findById(reportId);

        if (!report) {
            return {
                success: false,
                status: 404,
                message: "Report not found"
            };
        }

        await Report.deleteOne({ _id: reportId });

        return {
            success: true,
            status: 200,
            message: "Report deleted successfully"
        };
    } catch (err) {
        return {
            success: false,
            status: 500,
            message: err.message || "Error deleting report"
        };
    }
};

module.exports = {
    deleteReport
};


module.exports = {
    createReport,
    getAllReports,
    getSingleReport,
    updateReportStatus,
    deleteReport
}
