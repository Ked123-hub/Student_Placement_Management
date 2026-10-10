const prisma = require("../config/db");
const notificationService = require("./notification.service");

function createAppError(code, message, statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

const studentSelect = {
  id: true,
  name: true,
  prn: true,
  email: true,
  branch: true,
  year: true,
  cgpa: true,
  backlogs: true,
  phone: true,
  rollNumber: true
};

const driveSelect = {
  id: true,
  jobRole: true,
  package: true,
  internshipStipend: true,
  location: true,
  applicationDeadline: true,
  status: true,
  company: {
    select: {
      id: true,
      name: true
    }
  }
};

const applicationSelect = {
  id: true,
  studentId: true,
  status: true,
  appliedAt: true,
  cgpaAtApplication: true,
  resumeId: true
};

async function formatShortlist(shortlist) {
  const studentIds = shortlist.students.map((entry) => entry.studentId);

  const applications = studentIds.length
    ? await prisma.application.findMany({
        where: {
          driveId: shortlist.driveId,
          studentId: {
            in: studentIds
          }
        },
        select: applicationSelect
      })
    : [];

  const applicationByStudentId = new Map(
    applications.map((application) => [application.studentId, application])
  );

  return {
    id: shortlist.id,
    driveId: shortlist.driveId,
    method: shortlist.method,
    status: shortlist.status,
    createdBy: shortlist.createdBy,
    createdAt: shortlist.createdAt,
    publishedAt: shortlist.publishedAt,
    drive: shortlist.drive,
    students: shortlist.students.map((entry) => ({
      id: entry.id,
      studentId: entry.studentId,
      createdAt: entry.createdAt,
      student: entry.student,
      application: applicationByStudentId.get(entry.studentId) || null
    }))
  };
}

async function loadShortlist(shortlistId, tx = prisma) {
  return tx.shortlist.findUnique({
    where: {
      id: shortlistId
    },
    include: {
      drive: {
        select: driveSelect
      },
      students: {
        include: {
          student: {
            select: studentSelect
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });
}

async function createShortlist(driveId, method, createdBy) {
  if (!method || !["COMPANY_LIST", "CRITERIA"].includes(method)) {
    throw createAppError(
      "VALIDATION_ERROR",
      "method must be COMPANY_LIST or CRITERIA"
    );
  }

  const drive = await prisma.placementDrive.findUnique({
    where: {
      id: driveId
    },
    select: driveSelect
  });

  if (!drive) {
    throw createAppError(
      "DRIVE_NOT_FOUND",
      "Placement drive not found",
      404
    );
  }

  return prisma.$transaction(async (tx) => {
    const existingDraft = await tx.shortlist.findFirst({
      where: {
        driveId,
        status: "DRAFT"
      }
    });

    if (existingDraft) {
      throw createAppError(
        "DRAFT_SHORTLIST_EXISTS",
        "A DRAFT shortlist already exists for this drive"
      );
    }

    const shortlist = await tx.shortlist.create({
      data: {
        driveId,
        method,
        status: "DRAFT",
        createdBy
      },
      include: {
        drive: {
          select: driveSelect
        },
        students: {
          include: {
            student: {
              select: studentSelect
            }
          }
        }
      }
    });

    return formatShortlist(shortlist);
  });
}

async function getCurrentShortlist(driveId) {
  const drive = await prisma.placementDrive.findUnique({
    where: {
      id: driveId
    },
    select: {
      id: true
    }
  });

  if (!drive) {
    throw createAppError(
      "DRIVE_NOT_FOUND",
      "Placement drive not found",
      404
    );
  }

  let shortlist = await prisma.shortlist.findFirst({
    where: {
      driveId,
      status: "DRAFT"
    },
    include: {
      drive: {
        select: driveSelect
      },
      students: {
        include: {
          student: {
            select: studentSelect
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!shortlist) {
    shortlist = await prisma.shortlist.findFirst({
      where: {
        driveId,
        status: "PUBLISHED"
      },
      include: {
        drive: {
          select: driveSelect
        },
        students: {
          include: {
            student: {
              select: studentSelect
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      },
      orderBy: {
        publishedAt: "desc"
      }
    });
  }

  if (!shortlist) {
    throw createAppError(
      "SHORTLIST_NOT_FOUND",
      "No current shortlist found for this drive",
      404
    );
  }

  return formatShortlist(shortlist);
}

async function assertDraftShortlist(shortlistId, tx = prisma) {
  const shortlist = await tx.shortlist.findUnique({
    where: {
      id: shortlistId
    }
  });

  if (!shortlist) {
    throw createAppError(
      "SHORTLIST_NOT_FOUND",
      "Shortlist not found",
      404
    );
  }

  if (shortlist.status !== "DRAFT") {
    throw createAppError(
      "SHORTLIST_NOT_EDITABLE",
      "Only DRAFT shortlists can be modified"
    );
  }

  return shortlist;
}

async function assertApplicantForDrive(studentId, driveId, tx = prisma) {
  const student = await tx.student.findUnique({
    where: {
      id: studentId
    },
    select: studentSelect
  });

  if (!student) {
    throw createAppError(
      "STUDENT_NOT_FOUND",
      "Student not found",
      404
    );
  }

  const application = await tx.application.findUnique({
    where: {
      studentId_driveId: {
        studentId,
        driveId
      }
    },
    select: applicationSelect
  });

  if (!application) {
    throw createAppError(
      "STUDENT_NOT_APPLICANT",
      "Student has not applied to this drive"
    );
  }

  return { student, application };
}

async function addStudentToShortlist(shortlistId, studentId) {
  if (!studentId) {
    throw createAppError(
      "VALIDATION_ERROR",
      "studentId is required"
    );
  }

  return prisma.$transaction(async (tx) => {
    const shortlist = await assertDraftShortlist(shortlistId, tx);
    await assertApplicantForDrive(studentId, shortlist.driveId, tx);

    const existing = await tx.shortlistStudent.findUnique({
      where: {
        shortlistId_studentId: {
          shortlistId,
          studentId
        }
      }
    });

    if (existing) {
      throw createAppError(
        "STUDENT_ALREADY_SHORTLISTED",
        "Student is already in this shortlist"
      );
    }

    await tx.shortlistStudent.create({
      data: {
        shortlistId,
        studentId
      }
    });

    const updated = await loadShortlist(shortlistId, tx);
    return formatShortlist(updated);
  });
}

async function addStudentsBulk(shortlistId, studentIds) {
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    throw createAppError(
      "VALIDATION_ERROR",
      "studentIds must be a non-empty array"
    );
  }

  const uniqueIds = [...new Set(studentIds.map(String))];

  if (uniqueIds.length !== studentIds.length) {
    throw createAppError(
      "VALIDATION_ERROR",
      "studentIds contains duplicates"
    );
  }

  return prisma.$transaction(async (tx) => {
    const shortlist = await assertDraftShortlist(shortlistId, tx);

    for (const studentId of uniqueIds) {
      await assertApplicantForDrive(studentId, shortlist.driveId, tx);

      const existing = await tx.shortlistStudent.findUnique({
        where: {
          shortlistId_studentId: {
            shortlistId,
            studentId
          }
        }
      });

      if (existing) {
        throw createAppError(
          "STUDENT_ALREADY_SHORTLISTED",
          `Student ${studentId} is already in this shortlist`
        );
      }
    }

    await tx.shortlistStudent.createMany({
      data: uniqueIds.map((studentId) => ({
        shortlistId,
        studentId
      }))
    });

    const updated = await loadShortlist(shortlistId, tx);
    return formatShortlist(updated);
  });
}

async function removeStudentFromShortlist(shortlistId, studentId) {
  return prisma.$transaction(async (tx) => {
    await assertDraftShortlist(shortlistId, tx);

    const entry = await tx.shortlistStudent.findUnique({
      where: {
        shortlistId_studentId: {
          shortlistId,
          studentId
        }
      }
    });

    if (!entry) {
      throw createAppError(
        "SHORTLIST_STUDENT_NOT_FOUND",
        "Student is not in this shortlist",
        404
      );
    }

    await tx.shortlistStudent.delete({
      where: {
        shortlistId_studentId: {
          shortlistId,
          studentId
        }
      }
    });

    const updated = await loadShortlist(shortlistId, tx);
    return formatShortlist(updated);
  });
}

async function publishShortlist(shortlistId) {
  const result = await prisma.$transaction(async (tx) => {
    const shortlist = await assertDraftShortlist(shortlistId, tx);

    const studentCount = await tx.shortlistStudent.count({
      where: {
        shortlistId
      }
    });

    if (studentCount === 0) {
      throw createAppError(
        "SHORTLIST_EMPTY",
        "Cannot publish an empty shortlist"
      );
    }

    await tx.shortlist.updateMany({
      where: {
        driveId: shortlist.driveId,
        status: "PUBLISHED"
      },
      data: {
        status: "REPLACED"
      }
    });

    await tx.shortlist.update({
      where: {
        id: shortlistId
      },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date()
      }
    });

    const updated = await loadShortlist(shortlistId, tx);
    return formatShortlist(updated);
  });

  if (result && Array.isArray(result.students) && result.students.length > 0) {
    const studentIds = result.students.map((s) => s.student?.id || s.studentId).filter(Boolean);
    const driveRole = result.drive?.jobRole || "Placement Drive";
    const companyName = result.drive?.company?.name || "";
    await notificationService.safeCreateNotificationsBulk({
      studentIds,
      title: "Shortlisted for Drive",
      message: `Congratulations! You have been shortlisted for ${driveRole}${companyName ? ` at ${companyName}` : ""}.`,
      type: "SHORTLISTED"
    });
  }

  return result;
}

async function getStudentShortlistStatus(userId, driveId) {
  const student = await prisma.student.findUnique({
    where: {
      userId
    },
    select: {
      id: true
    }
  });

  if (!student) {
    throw createAppError(
      "STUDENT_NOT_FOUND",
      "Student profile not found",
      404
    );
  }

  const drive = await prisma.placementDrive.findUnique({
    where: {
      id: driveId
    },
    select: {
      id: true
    }
  });

  if (!drive) {
    throw createAppError(
      "DRIVE_NOT_FOUND",
      "Placement drive not found",
      404
    );
  }

  const publishedShortlist = await prisma.shortlist.findFirst({
    where: {
      driveId,
      status: "PUBLISHED",
      students: {
        some: {
          studentId: student.id
        }
      }
    },
    select: {
      id: true
    }
  });

  return {
    driveId,
    shortlisted: Boolean(publishedShortlist)
  };
}

module.exports = {
  createShortlist,
  getCurrentShortlist,
  addStudentToShortlist,
  addStudentsBulk,
  removeStudentFromShortlist,
  publishShortlist,
  getStudentShortlistStatus
};
