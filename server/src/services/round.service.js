const prisma = require("../config/db");

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

  return updatedRound;
}

module.exports = {
  createRound,
  getDriveRounds,
  updateRound
};
