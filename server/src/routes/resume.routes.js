const express = require("express");
const authenticate = require("../middleware/auth");
const upload = require("../middleware/resume-upload");
const controller = require("../controller/resume.controller");

const router = express.Router();

router.post(
  "/",
  authenticate,
  upload.single("resume"),
  controller.uploadResume
);

router.get(
    "/",
    authenticate,
    controller.getResume
);

router.get(
    "/:id/download",
    authenticate,
    controller.downloadResume
);

module.exports = router;