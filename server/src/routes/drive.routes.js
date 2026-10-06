const express = require("express");
const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const controller = require("../controller/drive.controller");
const applicationController = require("../controller/application.controller");
const shortlistController = require("../controller/shortlist.controller");

const router = express.Router();

router.post(
  "/",
  authenticate,
  allowRoles("TPO"),
  controller.createDrive
);

router.patch(
  "/:id/publish",
  authenticate,
  allowRoles("TPO"),
  controller.publishDrive
);

router.get(
  "/:driveId/applications",
  authenticate,
  allowRoles("TPO"),
  applicationController.getDriveApplications
);

router.get(
  "/:driveId/shortlists/current",
  authenticate,
  allowRoles("TPO"),
  shortlistController.getCurrentShortlist
);

router.post(
  "/:driveId/shortlists",
  authenticate,
  allowRoles("TPO"),
  shortlistController.createShortlist
);

module.exports = router;