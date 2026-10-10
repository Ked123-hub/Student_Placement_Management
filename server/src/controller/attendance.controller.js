const attendanceService = require("../services/attendance.service");

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

async function markAttendance(req, res) {
  try {
    const { roundId } = req.params;
    const { studentId, status } = req.body;

    const result = await attendanceService.markAttendance(
      roundId,
      studentId,
      status,
      req.user.userId
    );

    const statusCode = result.isUpdated ? 200 : 201;

    return res.status(statusCode).json({
      success: true,
      data: result.attendance
    });
  } catch (err) {
    return sendError(res, err, "ATTENDANCE_MARK_FAILED");
  }
}

async function markAttendanceBulk(req, res) {
  try {
    const { roundId } = req.params;
    const { attendances } = req.body;

    const result = await attendanceService.markAttendanceBulk(
      roundId,
      attendances,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    return sendError(res, err, "ATTENDANCE_BULK_FAILED");
  }
}

async function getRoundAttendance(req, res) {
  try {
    const { roundId } = req.params;

    const data = await attendanceService.getRoundAttendance(
      roundId,
      req.query
    );

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return sendError(res, err, "ATTENDANCE_FETCH_FAILED");
  }
}

async function getStudentAttendance(req, res) {
  try {
    const { roundId } = req.params;

    const data = await attendanceService.getStudentAttendance(
      roundId,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return sendError(res, err, "ATTENDANCE_FETCH_FAILED");
  }
}

module.exports = {
  markAttendance,
  markAttendanceBulk,
  getRoundAttendance,
  getStudentAttendance
};
