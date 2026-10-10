const notificationService = require("../services/notification.service");

function sendError(res, err, fallbackCode) {
  const statusCode = err.statusCode || 500;
  const code = err.code || fallbackCode;

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.message
    }
  });
}

async function getStudentNotifications(req, res) {
  try {
    const data = await notificationService.getStudentNotifications(
      req.user.userId,
      req.query
    );

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return sendError(res, err, "NOTIFICATION_FETCH_FAILED");
  }
}

async function getUnreadCount(req, res) {
  try {
    const data = await notificationService.getUnreadCount(req.user.userId);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return sendError(res, err, "NOTIFICATION_COUNT_FAILED");
  }
}

async function markAsRead(req, res) {
  try {
    const { notificationId } = req.params;
    const notification = await notificationService.markAsRead(
      notificationId,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    return sendError(res, err, "NOTIFICATION_UPDATE_FAILED");
  }
}

async function markAllAsRead(req, res) {
  try {
    const data = await notificationService.markAllAsRead(req.user.userId);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return sendError(res, err, "NOTIFICATION_UPDATE_FAILED");
  }
}

async function broadcastAnnouncement(req, res) {
  try {
    const data = await notificationService.broadcastAnnouncement(req.body);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return sendError(res, err, "ANNOUNCEMENT_FAILED");
  }
}

module.exports = {
  getStudentNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  broadcastAnnouncement
};
