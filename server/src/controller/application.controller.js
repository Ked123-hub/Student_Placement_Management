const applicationService = require("../services/application.service");

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

async function applyToDrive(req, res) {
  try {
    const { driveId } = req.params;

    const application = await applicationService.applyToDrive(
      req.user.userId,
      driveId
    );

    return res.status(201).json({
      success: true,
      data: application
    });
  } catch (err) {
    return sendError(res, err, "APPLICATION_CREATE_FAILED");
  }
}

async function getDriveApplications(req, res) {
  try {
    const { driveId } = req.params;

    const data = await applicationService.getDriveApplications(
      driveId,
      req.query
    );

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return sendError(res, err, "APPLICATION_FETCH_FAILED");
  }
}

async function getApplicationById(req, res) {
  try {
    const { applicationId } = req.params;

    const application = await applicationService.getApplicationById(
      applicationId
    );

    return res.status(200).json({
      success: true,
      data: application
    });
  } catch (err) {
    return sendError(res, err, "APPLICATION_FETCH_FAILED");
  }
}

module.exports = {
  applyToDrive,
  getDriveApplications,
  getApplicationById
};
