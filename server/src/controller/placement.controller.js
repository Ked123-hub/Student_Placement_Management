const placementService = require("../services/placement.service");

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

async function createFinalPlacement(req, res) {
  try {
    const placement = await placementService.createFinalPlacement(req.body);

    return res.status(201).json({
      success: true,
      data: placement
    });
  } catch (err) {
    return sendError(res, err, "PLACEMENT_CREATE_FAILED");
  }
}

async function getFinalPlacements(req, res) {
  try {
    const data = await placementService.getFinalPlacements(req.query);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return sendError(res, err, "PLACEMENT_FETCH_FAILED");
  }
}

async function getFinalPlacementById(req, res) {
  try {
    const { placementId } = req.params;
    const placement = await placementService.getFinalPlacementById(placementId);

    return res.status(200).json({
      success: true,
      data: placement
    });
  } catch (err) {
    return sendError(res, err, "PLACEMENT_FETCH_FAILED");
  }
}

async function updateFinalPlacement(req, res) {
  try {
    const { placementId } = req.params;
    const placement = await placementService.updateFinalPlacement(placementId, req.body);

    return res.status(200).json({
      success: true,
      data: placement
    });
  } catch (err) {
    return sendError(res, err, "PLACEMENT_UPDATE_FAILED");
  }
}

async function getMyPlacement(req, res) {
  try {
    const placement = await placementService.getMyPlacement(req.user.userId);

    return res.status(200).json({
      success: true,
      data: placement
    });
  } catch (err) {
    return sendError(res, err, "PLACEMENT_FETCH_FAILED");
  }
}

async function getStudentPlacementById(req, res) {
  try {
    const { placementId } = req.params;
    const placement = await placementService.getStudentPlacementById(placementId, req.user.userId);

    return res.status(200).json({
      success: true,
      data: placement
    });
  } catch (err) {
    return sendError(res, err, "PLACEMENT_FETCH_FAILED");
  }
}

module.exports = {
  createFinalPlacement,
  getFinalPlacements,
  getFinalPlacementById,
  updateFinalPlacement,
  getMyPlacement,
  getStudentPlacementById
};
