const express = require("express");
const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const offerController = require("../controller/offer.controller");

const router = express.Router();

// TPO endpoints
router.post(
  "/admin/drives/:driveId/offers",
  authenticate,
  allowRoles("TPO"),
  offerController.createOffer
);

router.get(
  "/admin/drives/:driveId/offers",
  authenticate,
  allowRoles("TPO"),
  offerController.getDriveOffers
);

router.get(
  "/admin/offers/:offerId",
  authenticate,
  allowRoles("TPO"),
  offerController.getOfferById
);

router.patch(
  "/admin/offers/:offerId",
  authenticate,
  allowRoles("TPO"),
  offerController.updateOffer
);

// Student endpoints
router.get(
  "/student/offers",
  authenticate,
  allowRoles("STUDENT"),
  offerController.getStudentOffers
);

router.get(
  "/student/offers/:offerId",
  authenticate,
  allowRoles("STUDENT"),
  offerController.getStudentOfferById
);

module.exports = router;
