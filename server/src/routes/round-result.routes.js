const express = require("express");
const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const roundResultController = require("../controller/round-result.controller");

const router = express.Router();

router.post(
  "/admin/rounds/:roundId/results",
  authenticate,
  allowRoles("TPO"),
  roundResultController.recordResult
);

router.post(
  "/admin/rounds/:roundId/results/bulk",
  authenticate,
  allowRoles("TPO"),
  roundResultController.recordResultsBulk
);

router.get(
  "/admin/rounds/:roundId/results",
  authenticate,
  allowRoles("TPO"),
  roundResultController.getRoundResults
);

router.get(
  "/student/rounds/:roundId/result",
  authenticate,
  allowRoles("STUDENT"),
  roundResultController.getStudentRoundResult
);

module.exports = router;
