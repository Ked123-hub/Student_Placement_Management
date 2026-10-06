const roundService = require("../services/round.service");

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

async function createRound(req, res) {
  try {
    const { driveId } = req.params;
    const round = await roundService.createRound(driveId, req.body);

    return res.status(201).json({
      success: true,
      data: round
    });
  } catch (err) {
    return sendError(res, err, "ROUND_CREATE_FAILED");
  }
}

async function getDriveRounds(req, res) {
  try {
    const { driveId } = req.params;
    const rounds = await roundService.getDriveRounds(driveId);

    return res.status(200).json({
      success: true,
      data: rounds
    });
  } catch (err) {
    return sendError(res, err, "ROUND_FETCH_FAILED");
  }
}

async function updateRound(req, res) {
  try {
    const { roundId } = req.params;
    const round = await roundService.updateRound(roundId, req.body);

    return res.status(200).json({
      success: true,
      data: round
    });
  } catch (err) {
    return sendError(res, err, "ROUND_UPDATE_FAILED");
  }
}

module.exports = {
  createRound,
  getDriveRounds,
  updateRound
};
