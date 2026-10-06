const express = require("express");
const authenticate = require("../middleware/auth");
const studentController = require("../controller/student.controller");

const router = express.Router();

router.get("/me", authenticate, studentController.getProfile);
router.patch("/me", authenticate, studentController.updateProfile);

module.exports = router;