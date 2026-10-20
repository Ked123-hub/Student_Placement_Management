const express = require("express");
const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const analyticsController = require("../controller/analytics.controller");

const router = express.Router();

// All analytics endpoints require TPO authorization
router.use(authenticate, allowRoles("TPO"));

router.get("/overview", analyticsController.getOverview);
router.get("/branches", analyticsController.getBranchAnalytics);
router.get("/packages", analyticsController.getPackageAnalytics);
router.get("/companies", analyticsController.getCompanyAnalytics);
router.get("/drives", analyticsController.getDriveAnalytics);
router.get("/funnel", analyticsController.getRecruitmentFunnel);

module.exports = router;
