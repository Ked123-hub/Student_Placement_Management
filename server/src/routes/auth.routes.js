const express = require("express");
const authController = require("../controller/auth.controller");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.post("/login", authController.login);
router.get("/me", authenticate, authController.me);
router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOtp);

module.exports = router;