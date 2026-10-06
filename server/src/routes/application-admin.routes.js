const express = require("express");
const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const controller = require("../controller/application.controller");

const router = express.Router();

router.get(
  "/:applicationId",
  authenticate,
  allowRoles("TPO"),
  controller.getApplicationById
);

module.exports = router;
