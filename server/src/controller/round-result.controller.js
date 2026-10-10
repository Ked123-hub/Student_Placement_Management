const roundResultService = require("../services/round-result.service");

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

async function recordResult(req, res) {
  try {
    const { roundId } = req.params;

    const outcome = await roundResultService.recordResult(
      roundId,
      req.body,
      req.user.userId
    );

    const statusCode = outcome.isUpdated ? 200 : 201;

    return res.status(statusCode).json({
      success: true,
      data: outcome.result
    });
  } catch (err) {
    return sendError(res, err, "RESULT_RECORD_FAILED");
  }
}

async function recordResultsBulk(req, res) {
  try {
    const { roundId } = req.params;
    const { results } = req.body;

    const outcome = await roundResultService.recordResultsBulk(
      roundId,
      results,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: outcome
    });
  } catch (err) {
    return sendError(res, err, "RESULT_BULK_RECORD_FAILED");
  }
}

async function getRoundResults(req, res) {
  try {
    const { roundId } = req.params;

    const data = await roundResultService.getRoundResults(
      roundId,
      req.query
    );

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return sendError(res, err, "RESULT_FETCH_FAILED");
  }
}

async function getStudentRoundResult(req, res) {
  try {
    const { roundId } = req.params;

    const data = await roundResultService.getStudentRoundResult(
      roundId,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return sendError(res, err, "RESULT_FETCH_FAILED");
  }
}

module.exports = {
  recordResult,
  recordResultsBulk,
  getRoundResults,
  getStudentRoundResult
};
