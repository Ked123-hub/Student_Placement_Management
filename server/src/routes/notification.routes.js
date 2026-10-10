const express = require("express");
const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const notificationController = require("../controller/notification.controller");

const router = express.Router();

// Student endpoints
router.get(
  "/student/notifications",
  authenticate,
  allowRoles("STUDENT"),
  notificationController.getStudentNotifications
);

router.get(
  "/student/notifications/unread-count",
  authenticate,
  allowRoles("STUDENT"),
  notificationController.getUnreadCount
);

router.patch(
  "/student/notifications/read-all",
  authenticate,
  allowRoles("STUDENT"),
  notificationController.markAllAsRead
);

router.patch(
  "/student/notifications/:notificationId/read",
  authenticate,
  allowRoles("STUDENT"),
  notificationController.markAsRead
);

// Admin announcement endpoint
router.post(
  "/admin/notifications/broadcast",
  authenticate,
  allowRoles("TPO"),
  notificationController.broadcastAnnouncement
);

module.exports = router;
