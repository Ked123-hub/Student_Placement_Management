const prisma = require("../config/db");
const notificationService = require("./notification.service");

function createAppError(code, message, statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

const allowedModes = ["ONLINE", "OFFLINE"];
const allowedStatuses = ["SCHEDULED", "COMPLETED", "CANCELLED"];

async function createRound(driveId, data = {}) {
  const drive = await prisma.placementDrive.findUnique({
    where: {
      id: driveId
    }
  });

  if (!drive) {
    throw createAppError(
      "DRIVE_NOT_FOUND",
      "Placement drive not found",
      404
    );
  }

  const {
    roundNumber,
    name,
    startAt,
    endAt,
    mode,
    location,
    description,
    status
  } = data;

  if (
    roundNumber === undefined ||
    roundNumber === null ||
    isNaN(Number(roundNumber)) ||
    Number(roundNumber) <= 0 ||
    !Number.isInteger(Number(roundNumber))
  ) {
    throw createAppError(
      "VALIDATION_ERROR",
      "roundNumber must be a positive integer"
    );
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    throw createAppError(
      "VALIDATION_ERROR",
      "Round name is required"
    );
  }

  if (!startAt) {
    throw createAppError(
      "VALIDATION_ERROR",
      "startAt date is required"
    );
  }

  if (!endAt) {
    throw createAppError(
      "VALIDATION_ERROR",
      "endAt date is required"
    );
  }

  const start = new Date(startAt);
  const end = new Date(endAt);

  if (isNaN(start.getTime())) {
    throw createAppError(
      "VALIDATION_ERROR",
      "Invalid startAt date format"
    );
  }

  if (isNaN(end.getTime())) {
    throw createAppError(
      "VALIDATION_ERROR",
      "Invalid endAt date format"
    );
  }

  if (start >= end) {
    throw createAppError(
      "VALIDATION_ERROR",
      "endAt must be strictly after startAt"
    );
  }

  if (!mode || !allowedModes.includes(mode)) {
    throw createAppError(
      "INVALID_ROUND_MODE",
      "mode must be ONLINE or OFFLINE"
    );
  }

  if (status !== undefined && status !== null && !allowedStatuses.includes(status)) {
    throw createAppError(
      "INVALID_ROUND_STATUS",
      "status must be SCHEDULED, COMPLETED, or CANCELLED"
    );
  }

  const round = await prisma.recruitmentRound.create({
    data: {
      driveId,
      roundNumber: Number(roundNumber),
      name: name.trim(),
      startAt: start,
      endAt: end,
      mode,
      location: location !== undefined && location !== null ? String(location).trim() : null,
      description: description !== undefined && description !== null ? String(description).trim() : null,
      status: status || "SCHEDULED"
    }
  });

  if (round.status === "SCHEDULED") {
    let candidateIds = [];
    if (round.roundNumber === 1) {
      const publishedShortlist = await prisma.shortlist.findFirst({
        where: { driveId, status: "PUBLISHED" },
        include: { students: { select: { studentId: true } } }
      });
      if (publishedShortlist && publishedShortlist.students.length > 0) {
        candidateIds = publishedShortlist.students.map((s) => s.studentId);
      } else {
        const apps = await prisma.application.findMany({
          where: { driveId, status: "APPLIED" },
          select: { studentId: true }
        });
        candidateIds = apps.map((a) => a.studentId);
      }
    } else {
      const prevRound = await prisma.recruitmentRound.findFirst({
        where: { driveId, roundNumber: round.roundNumber - 1 }
      });
      if (prevRound) {
        const passedResults = await prisma.roundResult.findMany({
          where: { roundId: prevRound.id, result: "PASSED" },
          select: { studentId: true }
        });
        candidateIds = passedResults.map((r) => r.studentId);
      }
    }

    if (candidateIds.length > 0) {
      await notificationService.safeCreateNotificationsBulk({
        studentIds: candidateIds,
        title: `Round Scheduled: ${round.name}`,
        message: `Round ${round.roundNumber} (${round.name}) has been scheduled.`,
        type: "NEXT_ROUND"
      });
    }
  }

  return round;
}

async function getDriveRounds(driveId) {
  const drive = await prisma.placementDrive.findUnique({
    where: {
      id: driveId
    }
  });

  if (!drive) {
    throw createAppError(
      "DRIVE_NOT_FOUND",
      "Placement drive not found",
      404
    );
  }

  const rounds = await prisma.recruitmentRound.findMany({
    where: {
      driveId
    },
    orderBy: {
      roundNumber: "asc"
    }
  });

  return rounds;
}

async function updateRound(roundId, data = {}) {
  const round = await prisma.recruitmentRound.findUnique({
    where: {
      id: roundId
    }
  });

  if (!round) {
    throw createAppError(
      "ROUND_NOT_FOUND",
      "Recruitment round not found",
      404
    );
  }

  const {
    roundNumber,
    name,
    startAt,
    endAt,
    mode,
    location,
    description,
    status
  } = data;

  const updateData = {};

  if (roundNumber !== undefined) {
    if (
      roundNumber === null ||
      isNaN(Number(roundNumber)) ||
      Number(roundNumber) <= 0 ||
      !Number.isInteger(Number(roundNumber))
    ) {
      throw createAppError(
        "VALIDATION_ERROR",
        "roundNumber must be a positive integer"
      );
    }
    updateData.roundNumber = Number(roundNumber);
  }

  if (name !== undefined) {
    if (!name || typeof name !== "string" || !name.trim()) {
      throw createAppError(
        "VALIDATION_ERROR",
        "Round name cannot be empty"
      );
    }
    updateData.name = name.trim();
  }

  if (mode !== undefined) {
    if (!allowedModes.includes(mode)) {
      throw createAppError(
        "INVALID_ROUND_MODE",
        "mode must be ONLINE or OFFLINE"
      );
    }
    updateData.mode = mode;
  }

  if (status !== undefined) {
    if (!allowedStatuses.includes(status)) {
      throw createAppError(
        "INVALID_ROUND_STATUS",
        "status must be SCHEDULED, COMPLETED, or CANCELLED"
      );
    }
    updateData.status = status;
  }

  const newStartAt = startAt !== undefined ? new Date(startAt) : round.startAt;
  const newEndAt = endAt !== undefined ? new Date(endAt) : round.endAt;

  if (startAt !== undefined && isNaN(newStartAt.getTime())) {
    throw createAppError(
      "VALIDATION_ERROR",
      "Invalid startAt date format"
    );
  }

  if (endAt !== undefined && isNaN(newEndAt.getTime())) {
    throw createAppError(
      "VALIDATION_ERROR",
      "Invalid endAt date format"
    );
  }

  if (startAt !== undefined || endAt !== undefined) {
    if (newStartAt >= newEndAt) {
      throw createAppError(
        "VALIDATION_ERROR",
        "endAt must be strictly after startAt"
      );
    }
    if (startAt !== undefined) updateData.startAt = newStartAt;
    if (endAt !== undefined) updateData.endAt = newEndAt;
  }

  if (location !== undefined) {
    updateData.location = location !== null && String(location).trim() !== "" ? String(location).trim() : null;
  }

  if (description !== undefined) {
    updateData.description = description !== null && String(description).trim() !== "" ? String(description).trim() : null;
  }

  if (Object.keys(updateData).length === 0) {
    throw createAppError(
      "NO_FIELDS",
      "No fields provided for update"
    );
  }

  const updatedRound = await prisma.recruitmentRound.update({
    where: {
      id: roundId
    },
    data: updateData
  });

  const apps = await prisma.application.findMany({
    where: { driveId: existing.driveId, status: "APPLIED" },
    select: { studentId: true }
  });

  if (apps.length > 0) {
    await notificationService.safeCreateNotificationsBulk({
      studentIds: apps.map((a) => a.studentId),
      title: `Round Updated: ${updatedRound.name}`,
      message: `Round ${updatedRound.roundNumber} (${updatedRound.name}) details have been updated.`,
      type: "ROUND_UPDATED"
    });
  }

  return updatedRound;
}

module.exports = {
  createRound,
  getDriveRounds,
  updateRound
};
