const analyticsService = require("../services/analytics.service");

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

function handleResponse(res, data) {
  if (data && data.isCSV) {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${data.filename}.csv"`);
    return res.status(200).send(data.content);
  }

  return res.status(200).json({
    success: true,
    data
  });
}

async function getOverview(req, res) {
  try {
    const data = await analyticsService.getOverview(req.query);
    return handleResponse(res, data);
  } catch (err) {
    return sendError(res, err, "ANALYTICS_OVERVIEW_FAILED");
  }
}

async function getBranchAnalytics(req, res) {
  try {
    const data = await analyticsService.getBranchAnalytics(req.query);
    return handleResponse(res, data);
  } catch (err) {
    return sendError(res, err, "ANALYTICS_BRANCHES_FAILED");
  }
}

async function getPackageAnalytics(req, res) {
  try {
    const data = await analyticsService.getPackageAnalytics(req.query);
    return handleResponse(res, data);
  } catch (err) {
    return sendError(res, err, "ANALYTICS_PACKAGES_FAILED");
  }
}

async function getCompanyAnalytics(req, res) {
  try {
    const data = await analyticsService.getCompanyAnalytics(req.query);
    return handleResponse(res, data);
  } catch (err) {
    return sendError(res, err, "ANALYTICS_COMPANIES_FAILED");
  }
}

async function getDriveAnalytics(req, res) {
  try {
    const data = await analyticsService.getDriveAnalytics(req.query);
    return handleResponse(res, data);
  } catch (err) {
    return sendError(res, err, "ANALYTICS_DRIVES_FAILED");
  }
}

async function getRecruitmentFunnel(req, res) {
  try {
    const data = await analyticsService.getRecruitmentFunnel(req.query);
    return handleResponse(res, data);
  } catch (err) {
    return sendError(res, err, "ANALYTICS_FUNNEL_FAILED");
  }
}

module.exports = {
  getOverview,
  getBranchAnalytics,
  getPackageAnalytics,
  getCompanyAnalytics,
  getDriveAnalytics,
  getRecruitmentFunnel
};
