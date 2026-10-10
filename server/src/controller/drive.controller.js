const prisma = require("../config/db");
const notificationService = require("../services/notification.service");

async function createDrive(req, res) {
  try {
    const {
      companyId,
      jobRole,
      package,
      internshipStipend,
      location,
      jobDescription,
      joiningDate,
      openings,
      selectionProcess,
      requiredSkills,
      applicationDeadline
    } = req.body;

    if (
      !companyId ||
      !jobRole ||
      !location ||
      !jobDescription ||
      !openings ||
      !selectionProcess ||
      !applicationDeadline
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Required drive fields are missing"
        }
      });
    }

    const company = await prisma.company.findUnique({
      where: {
        id: companyId
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: {
          code: "COMPANY_NOT_FOUND",
          message: "Company not found"
        }
      });
    }

    if (Number(openings) <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Openings must be greater than 0"
        }
      });
    }

    const deadline = new Date(applicationDeadline);

    if (isNaN(deadline.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid application deadline"
        }
      });
    }

    const drive = await prisma.placementDrive.create({
      data: {
        companyId,
        jobRole,
        package: package !== undefined ? Number(package) : null,
        internshipStipend:
          internshipStipend !== undefined
            ? Number(internshipStipend)
            : null,
        location,
        jobDescription,
        joiningDate: joiningDate
          ? new Date(joiningDate)
          : null,
        openings: Number(openings),
        selectionProcess,
        requiredSkills: requiredSkills || null,
        applicationDeadline: deadline
      }
    });

    return res.status(201).json({
      success: true,
      data: drive
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "DRIVE_CREATE_FAILED",
        message: err.message
      }
    });
  }
}

async function publishDrive(req, res) {
  try {
    const { id } = req.params;

    const drive = await prisma.placementDrive.findUnique({
      where: {
        id
      }
    });

    if (!drive) {
      return res.status(404).json({
        success: false,
        error: {
          code: "DRIVE_NOT_FOUND",
          message: "Placement drive not found"
        }
      });
    }

    if (drive.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_DRIVE_STATUS",
          message: "Only draft drives can be published"
        }
      });
    }

    const eligibilityCount =
      await prisma.driveEligibility.count({
        where: {
          driveId: id
        }
      });

    if (eligibilityCount === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "ELIGIBILITY_NOT_EVALUATED",
          message: "Evaluate eligibility before publishing"
        }
      });
    }

    const updatedDrive =
      await prisma.placementDrive.update({
        where: {
          id
        },
        data: {
          status: "PUBLISHED"
        }
      });

    const eligibilities = await prisma.driveEligibility.findMany({
      where: {
        driveId: id,
        eligible: true
      },
      select: {
        studentId: true
      }
    });

    if (eligibilities.length > 0) {
      await notificationService.safeCreateNotificationsBulk({
        studentIds: eligibilities.map((e) => e.studentId),
        title: "New Placement Drive Opened",
        message: `A new placement drive for ${updatedDrive.jobRole} has been published. Apply before the deadline!`,
        type: "DRIVE_OPENED"
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedDrive
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "DRIVE_PUBLISH_FAILED",
        message: err.message
      }
    });
  }
}

async function getStudentDrives(req, res) {
  try {
    const student = await prisma.student.findUnique({
      where: {
        userId: req.user.userId
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          code: "STUDENT_NOT_FOUND",
          message: "Student profile not found"
        }
      });
    }

    const drives = await prisma.placementDrive.findMany({
      where: {
        status: "PUBLISHED"
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        driveEligibilities: {
          where: {
            studentId: student.id
          },
          select: {
            eligible: true
          }
        },
        applications: {
          where: {
            studentId: student.id
          },
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const data = drives.map(drive => ({
      id: drive.id,
      company: drive.company,
      jobRole: drive.jobRole,
      package: drive.package,
      internshipStipend: drive.internshipStipend,
      location: drive.location,
      jobDescription: drive.jobDescription,
      joiningDate: drive.joiningDate,
      openings: drive.openings,
      selectionProcess: drive.selectionProcess,
      requiredSkills: drive.requiredSkills,
      applicationDeadline: drive.applicationDeadline,

      eligible:
        drive.driveEligibilities.length > 0
          ? drive.driveEligibilities[0].eligible
          : false,

      applied:
        drive.applications.length > 0,

      applicationStatus:
        drive.applications.length > 0
          ? drive.applications[0].status
          : null
    }));

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "DRIVE_FETCH_FAILED",
        message: err.message
      }
    });
  }
}

module.exports = {
  createDrive,
  publishDrive,
  getStudentDrives
};    