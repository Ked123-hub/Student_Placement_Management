const express = require("express");
const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const driveController = require("../controller/drive.controller");
const applicationController = require("../controller/application.controller");
const shortlistController = require("../controller/shortlist.controller");

const router = express.Router();

router.get(
  "/",
  authenticate,
  allowRoles("STUDENT"),
  driveController.getStudentDrives
);

router.post(
  "/:driveId/apply",
  authenticate,
  allowRoles("STUDENT"),
  applicationController.applyToDrive
);

router.get(
  "/:driveId/shortlist",
  authenticate,
  allowRoles("STUDENT"),
  shortlistController.getStudentShortlistStatus
);

module.exports = router;