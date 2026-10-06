const express = require("express");
const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const controller = require("../controller/shortlist.controller");

const router = express.Router();

router.post(
  "/:shortlistId/students/bulk",
  authenticate,
  allowRoles("TPO"),
  controller.addStudentsBulk
);

router.post(
  "/:shortlistId/students",
  authenticate,
  allowRoles("TPO"),
  controller.addStudent
);

router.delete(
  "/:shortlistId/students/:studentId",
  authenticate,
  allowRoles("TPO"),
  controller.removeStudent
);

router.patch(
  "/:shortlistId/publish",
  authenticate,
  allowRoles("TPO"),
  controller.publishShortlist
);

module.exports = router;
