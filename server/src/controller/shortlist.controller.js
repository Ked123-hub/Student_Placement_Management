const shortlistService = require("../services/shortlist.service");

function sendError(res, err, fallbackCode) {
  const statusCode = err.statusCode || 500;
  const code = err.code || fallbackCode;

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.message
    }
  });
}

async function createShortlist(req, res) {
  try {
    const { driveId } = req.params;
    const { method } = req.body;

    const shortlist = await shortlistService.createShortlist(
      driveId,
      method,
      req.user.userId
    );

    return res.status(201).json({
      success: true,
      data: shortlist
    });
  } catch (err) {
    return sendError(res, err, "SHORTLIST_CREATE_FAILED");
  }
}

async function getCurrentShortlist(req, res) {
  try {
    const { driveId } = req.params;

    const shortlist = await shortlistService.getCurrentShortlist(driveId);

    return res.status(200).json({
      success: true,
      data: shortlist
    });
  } catch (err) {
    return sendError(res, err, "SHORTLIST_FETCH_FAILED");
  }
}

async function addStudent(req, res) {
  try {
    const { shortlistId } = req.params;
    const { studentId } = req.body;

    const shortlist = await shortlistService.addStudentToShortlist(
      shortlistId,
      studentId
    );

    return res.status(200).json({
      success: true,
      data: shortlist
    });
  } catch (err) {
    return sendError(res, err, "SHORTLIST_ADD_FAILED");
  }
}

async function addStudentsBulk(req, res) {
  try {
    const { shortlistId } = req.params;
    const { studentIds } = req.body;

    const shortlist = await shortlistService.addStudentsBulk(
      shortlistId,
      studentIds
    );

    return res.status(200).json({
      success: true,
      data: shortlist
    });
  } catch (err) {
    return sendError(res, err, "SHORTLIST_BULK_ADD_FAILED");
  }
}

async function removeStudent(req, res) {
  try {
    const { shortlistId, studentId } = req.params;

    const shortlist = await shortlistService.removeStudentFromShortlist(
      shortlistId,
      studentId
    );

    return res.status(200).json({
      success: true,
      data: shortlist
    });
  } catch (err) {
    return sendError(res, err, "SHORTLIST_REMOVE_FAILED");
  }
}

async function publishShortlist(req, res) {
  try {
    const { shortlistId } = req.params;

    const shortlist = await shortlistService.publishShortlist(shortlistId);

    return res.status(200).json({
      success: true,
      data: shortlist
    });
  } catch (err) {
    return sendError(res, err, "SHORTLIST_PUBLISH_FAILED");
  }
}

async function getStudentShortlistStatus(req, res) {
  try {
    const { driveId } = req.params;

    const data = await shortlistService.getStudentShortlistStatus(
      req.user.userId,
      driveId
    );

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return sendError(res, err, "SHORTLIST_STATUS_FETCH_FAILED");
  }
}

module.exports = {
  createShortlist,
  getCurrentShortlist,
  addStudent,
  addStudentsBulk,
  removeStudent,
  publishShortlist,
  getStudentShortlistStatus
};
