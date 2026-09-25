const express = require("express");
const authController = require("../controllers/auth.controllers");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.post("/login", authController.login);

router.get("/me", authenticate, authController.me);


module.exports = router;