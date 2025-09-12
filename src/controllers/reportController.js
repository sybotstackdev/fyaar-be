const reportServive = require('../services/reportService.js')
const ApiResponse = require('../utils/response');

const CreateReport = async (req, res, next) => {
    const { message, status, data } = await reportServive.createReport(req.body, req.user.id)
    return ApiResponse.success(res, status, message, data);
}

const getAllReports = async (req, res, next) => {
    const { message, status, data } = await reportServive.getAllReports(req.query)
    return ApiResponse.success(res, status, message, data);
}

const getSingleReport = async (req, res, next) => {
    const { message, status, data } = await reportServive.getSingleReport(req.params.id)
    return ApiResponse.success(res, status, message, data);
}

const updateReportStatus = async (req, res, next) => {
    const { message, status, data } = await reportServive.updateReportStatus(req.params.id)
    return ApiResponse.success(res, status, message, data);
}

const deleteReport = async (req, res, next) => {
    const { message, status, data } = await reportServive.deleteReport(req.params.id)
    return ApiResponse.success(res, status, message, data);
}


module.exports = {
    CreateReport,
    getAllReports,
    getSingleReport,
    updateReportStatus,
    deleteReport
}