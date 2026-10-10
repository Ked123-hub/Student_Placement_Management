const prisma = require("../config/db");

function createAppError(code, message, statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

const allowedNotificationTypes = [
  "DRIVE_OPENED",
  "DEADLINE_REMINDER",
  "DRIVE_CLOSED",
  "DRIVE_CANCELLED",
  "APPLICATION_SUBMITTED",
  "APPLICATION_WITHDRAWN",
  "SHORTLISTED",
  "NOT_SHORTLISTED",
  "NEXT_ROUND",
  "ROUND_UPDATED",
  "ROUND_REMINDER",
  "RESULT",
  "ANNOUNCEMENT"
];

async function createNotification({ studentId, title, message, type }) {
  if (!studentId || typeof studentId !== "string" || !studentId.trim()) {
    throw createAppError("VALIDATION_ERROR", "studentId is required", 400);
  }

  if (!title || typeof title !== "string" || !title.trim()) {
    throw createAppError("VALIDATION_ERROR", "title is required", 400);
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    throw createAppError("VALIDATION_ERROR", "message is required", 400);
  }

  if (!type || !allowedNotificationTypes.includes(type)) {
    throw createAppError(
      "INVALID_NOTIFICATION_TYPE",
      `type must be one of: ${allowedNotificationTypes.join(", ")}`,
      400
    );
  }

  const notification = await prisma.notification.create({
    data: {
      studentId: studentId.trim(),
      title: title.trim(),
      message: message.trim(),
      type
    }
  });

  return notification;
}

async function createNotificationsBulk({ studentIds, title, message, type }) {
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return { count: 0 };
  }

  if (!title || typeof title !== "string" || !title.trim()) {
    throw createAppError("VALIDATION_ERROR", "title is required", 400);
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    throw createAppError("VALIDATION_ERROR", "message is required", 400);
  }

  if (!type || !allowedNotificationTypes.includes(type)) {
    throw createAppError(
      "INVALID_NOTIFICATION_TYPE",
      `type must be one of: ${allowedNotificationTypes.join(", ")}`,
      400
    );
  }

  // Deduplicate student IDs
  const uniqueStudentIds = [...new Set(studentIds.filter(id => id && typeof id === "string" && id.trim()))];

  if (uniqueStudentIds.length === 0) {
    return { count: 0 };
  }

  const result = await prisma.notification.createMany({
    data: uniqueStudentIds.map(studentId => ({
      studentId: studentId.trim(),
      title: title.trim(),
      message: message.trim(),
      type
    }))
  });

  return result;
}

// Safe helpers that catch and log errors to avoid rolling back critical workflows
async function safeCreateNotification(data) {
  try {
    return await createNotification(data);
  } catch (err) {
    console.error(`[NotificationService] Failed to create notification for student ${data?.studentId}:`, err.message);
    return null;
  }
}

async function safeCreateNotificationsBulk(data) {
  try {
    return await createNotificationsBulk(data);
  } catch (err) {
    console.error(`[NotificationService] Failed to create bulk notifications:`, err.message);
    return { count: 0 };
  }
}

async function getStudentNotifications(userId, query = {}) {
  const student = await prisma.student.findUnique({
    where: { userId }
  });

  if (!student) {
    throw createAppError("STUDENT_NOT_FOUND", "Student profile not found", 404);
  }

  const where = {
    studentId: student.id
  };

  // Pagination
  let page = 1;
  let limit = 20;

  if (query.page !== undefined && query.page !== null && query.page !== "") {
    const parsedPage = Number(query.page);
    if (isNaN(parsedPage) || !Number.isInteger(parsedPage) || parsedPage < 1) {
      throw createAppError("VALIDATION_ERROR", "page must be a positive integer", 400);
    }
    page = parsedPage;
  }

  if (query.limit !== undefined && query.limit !== null && query.limit !== "") {
    const parsedLimit = Number(query.limit);
    if (isNaN(parsedLimit) || !Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw createAppError("VALIDATION_ERROR", "limit must be an integer between 1 and 100", 400);
    }
    limit = parsedLimit;
  }

  // Filter by type
  if (query.type) {
    if (!allowedNotificationTypes.includes(query.type)) {
      throw createAppError(
        "INVALID_NOTIFICATION_TYPE",
        `type filter must be one of: ${allowedNotificationTypes.join(", ")}`,
        400
      );
    }
    where.type = query.type;
  }

  // Filter by read status
  const readFilter = query.read !== undefined ? query.read : query.isRead;
  if (readFilter !== undefined && readFilter !== null && readFilter !== "") {
    const str = String(readFilter).trim().toLowerCase();
    if (str === "true" || str === "read") {
      where.readAt = { not: null };
    } else if (str === "false" || str === "unread") {
      where.readAt = null;
    } else if (str !== "all") {
      throw createAppError("VALIDATION_ERROR", "read filter must be true, false, or all", 400);
    }
  }

  const [total, unreadCount, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { studentId: student.id, readAt: null } }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit
    })
  ]);

  const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);

  return {
    notifications,
    pagination: {
      total,
      unreadCount,
      page,
      limit,
      totalPages
    }
  };
}

async function getUnreadCount(userId) {
  const student = await prisma.student.findUnique({
    where: { userId }
  });

  if (!student) {
    throw createAppError("STUDENT_NOT_FOUND", "Student profile not found", 404);
  }

  const unreadCount = await prisma.notification.count({
    where: {
      studentId: student.id,
      readAt: null
    }
  });

  return { unreadCount };
}

async function markAsRead(notificationId, userId) {
  if (!notificationId || typeof notificationId !== "string" || !notificationId.trim()) {
    throw createAppError("VALIDATION_ERROR", "notificationId is required", 400);
  }

  const student = await prisma.student.findUnique({
    where: { userId }
  });

  if (!student) {
    throw createAppError("STUDENT_NOT_FOUND", "Student profile not found", 404);
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId.trim() }
  });

  // Never leak existence of another student's notification
  if (!notification || notification.studentId !== student.id) {
    throw createAppError("NOTIFICATION_NOT_FOUND", "Notification not found", 404);
  }

  if (notification.readAt !== null) {
    return notification;
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId.trim() },
    data: { readAt: new Date() }
  });

  return updated;
}

async function markAllAsRead(userId) {
  const student = await prisma.student.findUnique({
    where: { userId }
  });

  if (!student) {
    throw createAppError("STUDENT_NOT_FOUND", "Student profile not found", 404);
  }

  const result = await prisma.notification.updateMany({
    where: {
      studentId: student.id,
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });

  return { markedCount: result.count };
}

async function broadcastAnnouncement({ title, message, driveId, studentIds }) {
  if (!title || typeof title !== "string" || !title.trim()) {
    throw createAppError("VALIDATION_ERROR", "title is required", 400);
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    throw createAppError("VALIDATION_ERROR", "message is required", 400);
  }

  let targetStudentIds = [];

  if (Array.isArray(studentIds) && studentIds.length > 0) {
    targetStudentIds = studentIds.map(id => String(id).trim()).filter(Boolean);
  } else if (driveId && typeof driveId === "string" && driveId.trim()) {
    const applications = await prisma.application.findMany({
      where: { driveId: driveId.trim() },
      select: { studentId: true }
    });
    targetStudentIds = applications.map(app => app.studentId);
  } else {
    const students = await prisma.student.findMany({
      select: { id: true }
    });
    targetStudentIds = students.map(s => s.id);
  }

  const outcome = await createNotificationsBulk({
    studentIds: targetStudentIds,
    title: title.trim(),
    message: message.trim(),
    type: "ANNOUNCEMENT"
  });

  return { sentCount: outcome.count };
}

module.exports = {
  allowedNotificationTypes,
  createNotification,
  createNotificationsBulk,
  safeCreateNotification,
  safeCreateNotificationsBulk,
  getStudentNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  broadcastAnnouncement
};
