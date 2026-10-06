const express = require("express");
const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const controller = require("../controller/academic-period.controller");

const router = express.Router();

router.post(
  "/",
  authenticate,
  allowRoles("TPO"),
  controller.createPeriod
);

router.patch(
  "/close",
  authenticate,
  allowRoles("TPO"),
  controller.closePeriod
);

module.exports = router;