const express = require("express");
const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const controller = require("../controller/eligibility.controller");

const router = express.Router();

router.post(
  "/",
  authenticate,
  allowRoles("TPO"),
  controller.createCriteria
);

router.post(
  "/:driveId/evaluate",
  authenticate,
  allowRoles("TPO"),
  controller.evaluateEligibility
);

router.get(
  "/:driveId",
  authenticate,
  allowRoles("TPO"),
  controller.getEligibility
);

module.exports = router;