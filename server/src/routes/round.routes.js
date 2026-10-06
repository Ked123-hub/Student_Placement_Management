const express = require("express");
const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const roundController = require("../controller/round.controller");

const router = express.Router();

router.post(
  "/drives/:driveId/rounds",
  authenticate,
  allowRoles("TPO"),
  roundController.createRound
);

router.get(
  "/drives/:driveId/rounds",
  authenticate,
  allowRoles("TPO"),
  roundController.getDriveRounds
);

router.patch(
  "/rounds/:roundId",
  authenticate,
  allowRoles("TPO"),
  roundController.updateRound
);

module.exports = router;
