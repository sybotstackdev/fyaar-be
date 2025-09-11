const bookmarkService = require("../../services/Book/bookmarkServices")
const ApiResponse = require('../../utils/response');

const HandleBookMark = async (req, res, next) => {
    const { message, status } = await bookmarkService.AddAndRemoveBookmark(req.params.id, req.user.id)
    return ApiResponse.success(res, status, message);
}

const getAllBookmarks = async (req, res, next) => {
    const { message, status } = await bookmarkService.getAllBookmarks(req.params.id, req.user.id)
    return ApiResponse.success(res, status, message);
}

const getUserBookmarks = async (req, res, next) => {
    const { message, status , data} = await bookmarkService.getUserBookmarks(req.user.id)
    return ApiResponse.success(res, status, message , data);
}

const getSingleUserBookmark = async (req, res, next) => {
    const { message, status  , data} = await bookmarkService.getSingleUserBookmark(req.params.id, req.user.id)
    return ApiResponse.success(res, status, message , data);
}


module.exports = {
    HandleBookMark,
    getUserBookmarks,
    getSingleUserBookmark
}