const Bookmark = require("../../models/bookmarkModal.js")

/**
 * Add or Remove bookmark
 */
const AddAndRemoveBookmark = async (bookId, userId) => {
    try {
        if (!bookId || !userId) {
            return {
                message: "Values are missing",
                status: 400,
                success: false
            }
        }

        const isExisted = await Bookmark.findOne({ book: bookId, user: userId })

        if (isExisted) {
            await Bookmark.deleteOne({ book: bookId, user: userId })
            return {
                message: "Book removed from the bookmark list",
                status: 200,
                success: true
            }
        } else {
            const newBookmark = new Bookmark({
                user: userId,
                book: bookId
            })

            await newBookmark.save()
            return {
                message: "Book added to the bookmark list",
                status: 201,
                success: true,
            }
        }
    } catch (error) {
        return {
            message: "Error while updating bookmark status",
            status: 500,
            success: false,
            error: error.message || error
        }
    }
}

/**
 * Get all bookmarks (admin/global use)
 */
const getAllBookmarks = async () => {
    try {
        const bookmarks = await Bookmark.find()
            .populate({
                path : 'book',
                select : "title bookCover"
            })

        return {
            message: "All bookmarks fetched successfully",
            status: 200,
            success: true,
            data: bookmarks
        }
    } catch (error) {
        return {
            message: "Error while fetching bookmarks",
            status: 500,
            success: false,
            error: error.message || error
        }
    }
}

/**
 * Get all bookmarks of a specific user
 */
const getUserBookmarks = async (userId) => {
    try {
        if (!userId) {
            return {
                message: "User ID is required",
                status: 400,
                success: false
            }
        }

        const bookmarks = await Bookmark.find({ user: userId })
            .populate({
                path : "book",
                select : "title bookCover"
            })

        return {
            message: "User bookmarks fetched successfully",
            status: 200,
            success: true,
            data: bookmarks
        }
    } catch (error) {
        return {
            message: "Error while fetching user bookmarks",
            status: 500,
            success: false,
            error: error.message || error
        }
    }
}

/**
 * Get single bookmark of a user for a specific book
 */
const getSingleUserBookmark = async (bookId, userId) => {
    try {
        if (!userId || !bookId) {
            return {
                message: "User ID and Book ID are required",
                status: 400,
                success: false
            }
        }

        const bookmark = await Bookmark.findOne({ user: userId, book: bookId })
            .populate({
                path : "book",
                select : "title bookCover"
            })

        if (!bookmark) {
            return {
                message: "Bookmark not found",
                status: 404,
                success: false
            }
        }

        return {
            message: "Bookmark fetched successfully",
            status: 200,
            success: true,
            data: bookmark
        }
    } catch (error) {
        return {
            message: "Error while fetching bookmark",
            status: 500,
            success: false,
            error: error.message || error
        }
    }
}

module.exports = {
    AddAndRemoveBookmark,
    getAllBookmarks,
    getUserBookmarks,
    getSingleUserBookmark
}
