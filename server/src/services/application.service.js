const prisma = require("../config/db");
const notificationService = require("./notification.service");

function createAppError(code, message, statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

async function applyToDrive(userId, driveId) {
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

  if (drive.status !== "PUBLISHED") {
    throw createAppError(
      "DRIVE_NOT_PUBLISHED",
      "Students can only apply to published drives"
    );
  }

  const now = new Date();

  if (now > drive.applicationDeadline) {
    throw createAppError(
      "APPLICATION_DEADLINE_PASSED",
      "Application deadline has passed"
    );
  }

  const eligibility = await prisma.driveEligibility.findUnique({
    where: {
      driveId_studentId: {
        driveId,
        studentId: student.id
      }
    }
  });

  if (!eligibility || eligibility.eligible !== true) {
    throw createAppError(
      "STUDENT_NOT_ELIGIBLE",
      "Student is not eligible for this drive"
    );
  }

  // Confident restriction from schema: one student can have at most one FinalPlacement.
  // ACTIVE final placement means the student is already placed.
  const finalPlacement = await prisma.finalPlacement.findUnique({
    where: {
      studentId: student.id
    }
  });

  if (finalPlacement && finalPlacement.status === "ACTIVE") {
    throw createAppError(
      "STUDENT_ALREADY_PLACED",
      "Student already has an active final placement and cannot apply"
    );
  }

  const existingApplication = await prisma.application.findUnique({
    where: {
      studentId_driveId: {
        studentId: student.id,
        driveId
      }
    }
  });

  if (existingApplication) {
    throw createAppError(
      "APPLICATION_ALREADY_EXISTS",
      "Student has already applied to this drive"
    );
  }

  const resume = await prisma.resume.findFirst({
    where: {
      studentId: student.id
    },
    orderBy: {
      uploadedAt: "desc"
    }
  });

  if (!resume) {
    throw createAppError(
      "RESUME_REQUIRED",
      "Upload a resume before applying to a drive"
    );
  }

  try {
    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        driveId: drive.id,
        resumeId: resume.id,
        cgpaAtApplication: student.cgpa,
        status: "APPLIED"
      },
      include: {
        resume: {
          select: {
            id: true,
            fileName: true,
            uploadedAt: true
          }
        },
        drive: {
          select: {
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
          }
        }
      }
    });

    await notificationService.safeCreateNotification({
      studentId: student.id,
      title: "Application Submitted",
      message: `Your application for ${drive.jobRole} at ${drive.company.name} has been submitted successfully.`,
      type: "APPLICATION_SUBMITTED"
    });

    return application;
  } catch (err) {
    if (err.code === "P2002") {
      throw createAppError(
        "APPLICATION_ALREADY_EXISTS",
        "Student has already applied to this drive"
      );
    }

    throw err;
  }
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

const resumeSelect = {
  id: true,
  fileName: true,
  uploadedAt: true
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

function buildDriveApplicationFilters(query) {
  const studentWhere = {};

  if (query.branch) {
    studentWhere.branch = String(query.branch);
  }

  if (query.year !== undefined && query.year !== "") {
    const year = Number(query.year);

    if (Number.isNaN(year)) {
      throw createAppError(
        "VALIDATION_ERROR",
        "year must be a number"
      );
    }

    studentWhere.year = year;
  }

  const cgpaFilter = {};

  if (query.minCgpa !== undefined && query.minCgpa !== "") {
    const minCgpa = Number(query.minCgpa);

    if (Number.isNaN(minCgpa)) {
      throw createAppError(
        "VALIDATION_ERROR",
        "minCgpa must be a number"
      );
    }

    cgpaFilter.gte = minCgpa;
  }

  if (query.maxCgpa !== undefined && query.maxCgpa !== "") {
    const maxCgpa = Number(query.maxCgpa);

    if (Number.isNaN(maxCgpa)) {
      throw createAppError(
        "VALIDATION_ERROR",
        "maxCgpa must be a number"
      );
    }

    cgpaFilter.lte = maxCgpa;
  }

  if (Object.keys(cgpaFilter).length > 0) {
    studentWhere.cgpa = cgpaFilter;
  }

  if (query.search) {
    const search = String(query.search).trim();

    if (search) {
      studentWhere.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          prn: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          email: {
            contains: search,
            mode: "insensitive"
          }
        }
      ];
    }
  }

  const where = {};

  if (query.status) {
    const status = String(query.status).toUpperCase();

    if (!["APPLIED", "WITHDRAWN"].includes(status)) {
      throw createAppError(
        "VALIDATION_ERROR",
        "status must be APPLIED or WITHDRAWN"
      );
    }

    where.status = status;
  }

  if (Object.keys(studentWhere).length > 0) {
    where.student = studentWhere;
  }

  return where;
}

async function getDriveApplications(driveId, query = {}) {
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

  const filters = buildDriveApplicationFilters(query);

  const applications = await prisma.application.findMany({
    where: {
      driveId,
      ...filters
    },
    select: {
      id: true,
      status: true,
      appliedAt: true,
      withdrawnAt: true,
      cgpaAtApplication: true,
      student: {
        select: studentSelect
      },
      resume: {
        select: resumeSelect
      }
    },
    orderBy: {
      appliedAt: "desc"
    }
  });

  return {
    drive,
    total: applications.length,
    applications
  };
}

async function getApplicationById(applicationId) {
  const application = await prisma.application.findUnique({
    where: {
      id: applicationId
    },
    select: {
      id: true,
      status: true,
      appliedAt: true,
      withdrawnAt: true,
      cgpaAtApplication: true,
      student: {
        select: studentSelect
      },
      resume: {
        select: resumeSelect
      },
      drive: {
        select: driveSelect
      }
    }
  });

  if (!application) {
    throw createAppError(
      "APPLICATION_NOT_FOUND",
      "Application not found",
      404
    );
  }

  return application;
}

module.exports = {
  applyToDrive,
  getDriveApplications,
  getApplicationById
};
