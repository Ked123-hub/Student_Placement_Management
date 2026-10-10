const prisma = require("../config/db");
const notificationService = require("./notification.service");

function createAppError(code, message, statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

const allowedPlacementStatuses = ["ACTIVE", "CANCELLED"];

const placementInclude = {
  student: {
    select: {
      id: true,
      name: true,
      prn: true,
      rollNumber: true,
      email: true,
      branch: true,
      year: true,
      cgpa: true
    }
  },
  offer: {
    select: {
      id: true,
      role: true,
      package: true,
      selectionDate: true,
      status: true,
      drive: {
        select: {
          id: true,
          jobRole: true,
          package: true,
          location: true,
          company: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  }
};

async function createFinalPlacement(data = {}) {
  const { offerId, studentId, placementDate, status } = data;

  if (!offerId || typeof offerId !== "string" || !offerId.trim()) {
    throw createAppError(
      "VALIDATION_ERROR",
      "offerId is required",
      400
    );
  }

  const trimmedOfferId = offerId.trim();

  // Retrieve placement offer with relations
  const offer = await prisma.placementOffer.findUnique({
    where: {
      id: trimmedOfferId
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          prn: true
        }
      },
      drive: {
        select: {
          id: true,
          jobRole: true,
          package: true
        }
      }
    }
  });

  if (!offer) {
    throw createAppError(
      "OFFER_NOT_FOUND",
      "Placement offer not found",
      404
    );
  }

  // If studentId is explicitly provided, verify it belongs to the same student
  if (studentId !== undefined && studentId !== null) {
    if (typeof studentId !== "string" || !studentId.trim()) {
      throw createAppError(
        "VALIDATION_ERROR",
        "studentId must be a non-empty string when provided",
        400
      );
    }

    if (studentId.trim() !== offer.studentId) {
      throw createAppError(
        "OFFER_STUDENT_MISMATCH",
        "Offer does not belong to the specified student",
        400
      );
    }
  }

  const targetStudentId = offer.studentId;

  // Business rule: Only ACCEPTED offers can be finalized into FinalPlacement
  if (offer.status !== "ACCEPTED") {
    throw createAppError(
      "OFFER_NOT_ACCEPTED",
      `Only accepted placement offers can be converted to final placements. Current offer status is ${offer.status}`,
      400
    );
  }

  // Check if this offer is already linked to a final placement
  const existingOfferPlacement = await prisma.finalPlacement.findUnique({
    where: {
      offerId: trimmedOfferId
    }
  });

  if (existingOfferPlacement) {
    throw createAppError(
      "OFFER_ALREADY_PLACED",
      "This placement offer has already been converted to a final placement",
      400
    );
  }

  // Check if student already has a final placement record
  const existingStudentPlacement = await prisma.finalPlacement.findUnique({
    where: {
      studentId: targetStudentId
    }
  });

  if (existingStudentPlacement) {
    if (existingStudentPlacement.status === "ACTIVE") {
      throw createAppError(
        "STUDENT_ALREADY_PLACED",
        "Student already has an active final placement",
        400
      );
    } else {
      throw createAppError(
        "STUDENT_ALREADY_PLACED",
        "Student already has an existing final placement record",
        400
      );
    }
  }

  // Validate placementDate
  let resolvedPlacementDate = new Date();
  if (placementDate !== undefined && placementDate !== null) {
    resolvedPlacementDate = new Date(placementDate);
    if (isNaN(resolvedPlacementDate.getTime())) {
      throw createAppError(
        "VALIDATION_ERROR",
        "Invalid placementDate format",
        400
      );
    }
  }

  // Validate status
  let resolvedStatus = "ACTIVE";
  if (status !== undefined && status !== null) {
    if (!allowedPlacementStatuses.includes(status)) {
      throw createAppError(
        "INVALID_PLACEMENT_STATUS",
        "status must be ACTIVE or CANCELLED",
        400
      );
    }
    resolvedStatus = status;
  }

  // Atomic transaction
  const finalPlacement = await prisma.$transaction(async (tx) => {
    return await tx.finalPlacement.create({
      data: {
        studentId: targetStudentId,
        offerId: trimmedOfferId,
        placementDate: resolvedPlacementDate,
        status: resolvedStatus
      },
      include: placementInclude
    });
  });

  await notificationService.safeCreateNotification({
    studentId: targetStudentId,
    title: "Final Placement Confirmed",
    message: `Your final placement for ${offer.role} is confirmed!`,
    type: "ANNOUNCEMENT"
  });

  return finalPlacement;
}

async function getFinalPlacements(query = {}) {
  const where = {};

  if (query.status) {
    if (!allowedPlacementStatuses.includes(query.status)) {
      throw createAppError(
        "INVALID_PLACEMENT_STATUS",
        "status must be ACTIVE or CANCELLED",
        400
      );
    }
    where.status = query.status;
  }

  if (query.studentId && typeof query.studentId === "string" && query.studentId.trim()) {
    where.studentId = query.studentId.trim();
  }

  if (query.driveId && typeof query.driveId === "string" && query.driveId.trim()) {
    where.offer = {
      ...where.offer,
      driveId: query.driveId.trim()
    };
  }

  if (query.companyId && typeof query.companyId === "string" && query.companyId.trim()) {
    where.offer = {
      ...where.offer,
      drive: {
        companyId: query.companyId.trim()
      }
    };
  }

  const placements = await prisma.finalPlacement.findMany({
    where,
    include: placementInclude,
    orderBy: {
      placementDate: "desc"
    }
  });

  const [activeCount, cancelledCount] = await Promise.all([
    prisma.finalPlacement.count({
      where: {
        ...where,
        status: "ACTIVE"
      }
    }),
    prisma.finalPlacement.count({
      where: {
        ...where,
        status: "CANCELLED"
      }
    })
  ]);

  return {
    total: placements.length,
    summary: {
      active: activeCount,
      cancelled: cancelledCount
    },
    placements
  };
}

async function getFinalPlacementById(placementId) {
  if (!placementId || typeof placementId !== "string" || !placementId.trim()) {
    throw createAppError(
      "VALIDATION_ERROR",
      "placementId is required",
      400
    );
  }

  const placement = await prisma.finalPlacement.findUnique({
    where: {
      id: placementId.trim()
    },
    include: placementInclude
  });

  if (!placement) {
    throw createAppError(
      "PLACEMENT_NOT_FOUND",
      "Final placement not found",
      404
    );
  }

  return placement;
}

async function updateFinalPlacement(placementId, data = {}) {
  if (!placementId || typeof placementId !== "string" || !placementId.trim()) {
    throw createAppError(
      "VALIDATION_ERROR",
      "placementId is required",
      400
    );
  }

  const existingPlacement = await prisma.finalPlacement.findUnique({
    where: {
      id: placementId.trim()
    }
  });

  if (!existingPlacement) {
    throw createAppError(
      "PLACEMENT_NOT_FOUND",
      "Final placement not found",
      404
    );
  }

  const updateData = {};

  if (data.status !== undefined) {
    if (!allowedPlacementStatuses.includes(data.status)) {
      throw createAppError(
        "INVALID_PLACEMENT_STATUS",
        "status must be ACTIVE or CANCELLED",
        400
      );
    }
    updateData.status = data.status;
  }

  if (data.placementDate !== undefined) {
    const parsedDate = new Date(data.placementDate);
    if (isNaN(parsedDate.getTime())) {
      throw createAppError(
        "VALIDATION_ERROR",
        "Invalid placementDate format",
        400
      );
    }
    updateData.placementDate = parsedDate;
  }

  if (Object.keys(updateData).length === 0) {
    throw createAppError(
      "VALIDATION_ERROR",
      "No fields provided for update",
      400
    );
  }

  const updatedPlacement = await prisma.$transaction(async (tx) => {
    return await tx.finalPlacement.update({
      where: {
        id: placementId.trim()
      },
      data: updateData,
      include: placementInclude
    });
  });

  if (updateData.status) {
    await notificationService.safeCreateNotification({
      studentId: existingPlacement.studentId,
      title: "Placement Status Updated",
      message: `Your final placement status has been updated to ${updateData.status}.`,
      type: "ANNOUNCEMENT"
    });
  }

  return updatedPlacement;
}

async function getMyPlacement(userId) {
  const student = await prisma.student.findUnique({
    where: {
      userId
    }
  });

  if (!student) {
    throw createAppError(
      "STUDENT_NOT_FOUND",
      "Student profile not found",
      404
    );
  }

  const placement = await prisma.finalPlacement.findUnique({
    where: {
      studentId: student.id
    },
    include: placementInclude
  });

  return placement || null;
}

async function getStudentPlacementById(placementId, userId) {
  const student = await prisma.student.findUnique({
    where: {
      userId
    }
  });

  if (!student) {
    throw createAppError(
      "STUDENT_NOT_FOUND",
      "Student profile not found",
      404
    );
  }

  if (!placementId || typeof placementId !== "string" || !placementId.trim()) {
    throw createAppError(
      "VALIDATION_ERROR",
      "placementId is required",
      400
    );
  }

  const placement = await prisma.finalPlacement.findUnique({
    where: {
      id: placementId.trim()
    },
    include: placementInclude
  });

  // Never leak existence of another student's placement
  if (!placement || placement.studentId !== student.id) {
    throw createAppError(
      "PLACEMENT_NOT_FOUND",
      "Final placement not found",
      404
    );
  }

  return placement;
}

module.exports = {
  createFinalPlacement,
  getFinalPlacements,
  getFinalPlacementById,
  updateFinalPlacement,
  getMyPlacement,
  getStudentPlacementById
};
