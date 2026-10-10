const express = require("express");
const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const attendanceController = require("../controller/attendance.controller");

const router = express.Router();

router.post(
  "/admin/rounds/:roundId/attendance",
  authenticate,
  allowRoles("TPO"),
  attendanceController.markAttendance
);

router.post(
  "/admin/rounds/:roundId/attendance/bulk",
  authenticate,
  allowRoles("TPO"),
  attendanceController.markAttendanceBulk
);

router.get(
  "/admin/rounds/:roundId/attendance",
  authenticate,
  allowRoles("TPO"),
  attendanceController.getRoundAttendance
);

router.get(
  "/student/rounds/:roundId/attendance",
  authenticate,
  allowRoles("STUDENT"),
  attendanceController.getStudentAttendance
);

module.exports = router;
