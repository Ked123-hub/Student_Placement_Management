const express = require("express");
const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const placementController = require("../controller/placement.controller");

const router = express.Router();

// TPO endpoints
router.post(
  "/admin/placements",
  authenticate,
  allowRoles("TPO"),
  placementController.createFinalPlacement
);

router.get(
  "/admin/placements",
  authenticate,
  allowRoles("TPO"),
  placementController.getFinalPlacements
);

router.get(
  "/admin/placements/:placementId",
  authenticate,
  allowRoles("TPO"),
  placementController.getFinalPlacementById
);

router.patch(
  "/admin/placements/:placementId",
  authenticate,
  allowRoles("TPO"),
  placementController.updateFinalPlacement
);

// Student endpoints (place /me before /:placementId)
router.get(
  "/student/placements/me",
  authenticate,
  allowRoles("STUDENT"),
  placementController.getMyPlacement
);

router.get(
  "/student/placements/:placementId",
  authenticate,
  allowRoles("STUDENT"),
  placementController.getStudentPlacementById
);

module.exports = router;
