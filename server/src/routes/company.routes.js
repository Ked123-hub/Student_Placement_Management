const express = require("express");
const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const controller = require("../controller/company.controller");

const router = express.Router();

router.post(
  "/",
  authenticate,
  allowRoles("TPO"),
  controller.createCompany
);

module.exports = router;