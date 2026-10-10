const prisma = require("../config/db");
const notificationService = require("./notification.service");

function createAppError(code, message, statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

const allowedOfferStatuses = ["OFFERED", "ACCEPTED", "REJECTED", "WITHDRAWN"];

async function createOffer(driveId, data = {}) {
  const { studentId, role, package: offerPkg, selectionDate: selDate, status: offerStatus } = data;

  if (!studentId || typeof studentId !== "string" || !studentId.trim()) {
    throw createAppError(
      "VALIDATION_ERROR",
      "studentId is required",
      400
    );
  }

  const trimmedStudentId = studentId.trim();

  const drive = await prisma.placementDrive.findUnique({
    where: {
      id: driveId
    },
    include: {
      company: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!drive) {
    throw createAppError(
      "DRIVE_NOT_FOUND",
      "Placement drive not found",
      404
    );
  }

  const student = await prisma.student.findUnique({
    where: {
      id: trimmedStudentId
    }
  });

  if (!student) {
    throw createAppError(
      "STUDENT_NOT_FOUND",
      "Student not found",
      404
    );
  }

  const application = await prisma.application.findUnique({
    where: {
      studentId_driveId: {
        studentId: trimmedStudentId,
        driveId
      }
    }
  });

  if (!application) {
    throw createAppError(
      "APPLICATION_REQUIRED",
      "Student has not applied to this drive",
      400
    );
  }

  // Determine final recruitment round: highest roundNumber for this drive
  const finalRound = await prisma.recruitmentRound.findFirst({
    where: {
      driveId
    },
    orderBy: {
      roundNumber: "desc"
    }
  });

  if (finalRound) {
    const roundResult = await prisma.roundResult.findUnique({
      where: {
        roundId_studentId: {
          roundId: finalRound.id,
          studentId: trimmedStudentId
        }
      }
    });

    if (!roundResult || roundResult.result !== "PASSED") {
      throw createAppError(
        "FINAL_ROUND_NOT_CLEARED",
        `Student must have PASSED the final recruitment round (Round ${finalRound.roundNumber}: ${finalRound.name}) before receiving an offer`,
        400
      );
    }
  }

  // Check existing offer for this student and drive
  const existingOffer = await prisma.placementOffer.findFirst({
    where: {
      driveId,
      studentId: trimmedStudentId
    }
  });

  if (existingOffer) {
    throw createAppError(
      "OFFER_ALREADY_EXISTS",
      "An offer already exists for this student for this drive",
      400
    );
  }

  // Respect existing FinalPlacement uniqueness (student cannot hold active final placement)
  const activeFinalPlacement = await prisma.finalPlacement.findUnique({
    where: {
      studentId: trimmedStudentId
    }
  });

  if (activeFinalPlacement && activeFinalPlacement.status === "ACTIVE") {
    throw createAppError(
      "STUDENT_ALREADY_PLACED",
      "Student already has an active final placement and cannot accept new offers",
      400
    );
  }

  // Validate role
  const resolvedRole = (role && typeof role === "string" && role.trim())
    ? role.trim()
    : drive.jobRole;

  if (!resolvedRole) {
    throw createAppError(
      "VALIDATION_ERROR",
      "role is required",
      400
    );
  }

  // Validate package
  let resolvedPackage = null;
  if (offerPkg !== undefined && offerPkg !== null && offerPkg !== "") {
    const num = Number(offerPkg);
    if (isNaN(num) || num < 0 || num > 99999999.99) {
      throw createAppError(
        "VALIDATION_ERROR",
        "package must be a valid number between 0 and 99999999.99",
        400
      );
    }
    resolvedPackage = num;
  } else if (drive.package !== null && drive.package !== undefined) {
    resolvedPackage = drive.package;
  }

  // Validate selectionDate
  let resolvedSelectionDate = new Date();
  if (selDate !== undefined && selDate !== null) {
    resolvedSelectionDate = new Date(selDate);
    if (isNaN(resolvedSelectionDate.getTime())) {
      throw createAppError(
        "VALIDATION_ERROR",
        "Invalid selectionDate format",
        400
      );
    }
  }

  // Validate status
  let resolvedStatus = "OFFERED";
  if (offerStatus !== undefined && offerStatus !== null) {
    if (!allowedOfferStatuses.includes(offerStatus)) {
      throw createAppError(
        "INVALID_OFFER_STATUS",
        "status must be OFFERED, ACCEPTED, REJECTED, or WITHDRAWN",
        400
      );
    }
    resolvedStatus = offerStatus;
  }

  const offer = await prisma.placementOffer.create({
    data: {
      studentId: trimmedStudentId,
      driveId,
      role: resolvedRole,
      package: resolvedPackage,
      selectionDate: resolvedSelectionDate,
      status: resolvedStatus
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          prn: true,
          rollNumber: true,
          email: true,
          branch: true,
          year: true
        }
      },
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
  });

  await notificationService.safeCreateNotification({
    studentId: trimmedStudentId,
    title: "Placement Offer Received",
    message: `Congratulations! You have received a placement offer for the role of ${resolvedRole} from ${drive.company.name}.`,
    type: "ANNOUNCEMENT"
  });

  return offer;
}

async function getDriveOffers(driveId) {
  const drive = await prisma.placementDrive.findUnique({
    where: {
      id: driveId
    },
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
  });

  if (!drive) {
    throw createAppError(
      "DRIVE_NOT_FOUND",
      "Placement drive not found",
      404
    );
  }

  const offers = await prisma.placementOffer.findMany({
    where: {
      driveId
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          prn: true,
          rollNumber: true,
          email: true,
          branch: true,
          year: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return {
    drive,
    total: offers.length,
    offers
  };
}

async function getOfferById(offerId) {
  const offer = await prisma.placementOffer.findUnique({
    where: {
      id: offerId
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          prn: true,
          rollNumber: true,
          email: true,
          branch: true,
          year: true
        }
      },
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
      },
      finalPlacement: true
    }
  });

  if (!offer) {
    throw createAppError(
      "OFFER_NOT_FOUND",
      "Placement offer not found",
      404
    );
  }

  return offer;
}

async function updateOffer(offerId, data = {}) {
  const offer = await prisma.placementOffer.findUnique({
    where: {
      id: offerId
    }
  });

  if (!offer) {
    throw createAppError(
      "OFFER_NOT_FOUND",
      "Placement offer not found",
      404
    );
  }

  const updateData = {};

  if (data.status !== undefined) {
    if (!allowedOfferStatuses.includes(data.status)) {
      throw createAppError(
        "INVALID_OFFER_STATUS",
        "status must be OFFERED, ACCEPTED, REJECTED, or WITHDRAWN",
        400
      );
    }
    updateData.status = data.status;
  }

  if (data.role !== undefined) {
    if (!data.role || typeof data.role !== "string" || !data.role.trim()) {
      throw createAppError(
        "VALIDATION_ERROR",
        "role cannot be empty",
        400
      );
    }
    updateData.role = data.role.trim();
  }

  if (data.package !== undefined) {
    if (data.package === null || data.package === "") {
      updateData.package = null;
    } else {
      const num = Number(data.package);
      if (isNaN(num) || num < 0 || num > 99999999.99) {
        throw createAppError(
          "VALIDATION_ERROR",
          "package must be a valid number between 0 and 99999999.99",
          400
        );
      }
      updateData.package = num;
    }
  }

  if (data.selectionDate !== undefined) {
    const selDate = new Date(data.selectionDate);
    if (isNaN(selDate.getTime())) {
      throw createAppError(
        "VALIDATION_ERROR",
        "Invalid selectionDate format",
        400
      );
    }
    updateData.selectionDate = selDate;
  }

  if (Object.keys(updateData).length === 0) {
    throw createAppError(
      "VALIDATION_ERROR",
      "No fields provided for update",
      400
    );
  }

  const updatedOffer = await prisma.placementOffer.update({
    where: {
      id: offerId
    },
    data: updateData,
    include: {
      student: {
        select: {
          id: true,
          name: true,
          prn: true,
          rollNumber: true,
          email: true,
          branch: true,
          year: true
        }
      },
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
  });

  if (updateData.status) {
    await notificationService.safeCreateNotification({
      studentId: offer.studentId,
      title: "Placement Offer Status Updated",
      message: `Your placement offer for ${updatedOffer.role} has been updated to ${updateData.status}.`,
      type: "ANNOUNCEMENT"
    });
  }

  return updatedOffer;
}

async function getStudentOffers(userId) {
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

  const offers = await prisma.placementOffer.findMany({
    where: {
      studentId: student.id
    },
    include: {
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
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return offers;
}

async function getStudentOfferById(offerId, userId) {
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

  const offer = await prisma.placementOffer.findUnique({
    where: {
      id: offerId
    },
    include: {
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
  });

  // Never leak existence of another student's offer
  if (!offer || offer.studentId !== student.id) {
    throw createAppError(
      "OFFER_NOT_FOUND",
      "Placement offer not found",
      404
    );
  }

  return offer;
}

module.exports = {
  createOffer,
  getDriveOffers,
  getOfferById,
  updateOffer,
  getStudentOffers,
  getStudentOfferById
};
