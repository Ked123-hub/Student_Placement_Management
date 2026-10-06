const prisma = require("../config/db");

async function getProfile(req, res) {
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

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "PROFILE_FETCH_FAILED",
        message: err.message
      }
    });
  }
}

async function updateProfile(req, res) {
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

    const { phone, cgpa } = req.body;

    const data = {};

    // Phone can be changed anytime
    if (phone !== undefined) {
      if (!/^\d{10}$/.test(String(phone))) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Phone must contain exactly 10 digits"
          }
        });
      }

      data.phone = String(phone);
    }

    // CGPA can be changed only during an open academic period
    if (cgpa !== undefined) {
      const now = new Date();

      const period = await prisma.academicUpdatePeriod.findFirst({
        where: {
          status: "OPEN",
          startAt: {
            lte: now
          },
          endAt: {
            gte: now
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      if (!period) {
        return res.status(403).json({
          success: false,
          error: {
            code: "CGPA_UPDATE_CLOSED",
            message: "CGPA cannot be updated at this time"
          }
        });
      }

      const value = Number(cgpa);

      if (isNaN(value) || value < 0 || value > 10) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "CGPA must be between 0 and 10"
          }
        });
      }

      data.cgpa = value;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "NO_FIELDS",
          message: "No valid fields provided for update"
        }
      });
    }

    const updatedStudent = await prisma.student.update({
      where: {
        id: student.id
      },
      data
    });

    return res.status(200).json({
      success: true,
      data: updatedStudent
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "PROFILE_UPDATE_FAILED",
        message: err.message
      }
    });
  }
}

module.exports = {
  getProfile,
  updateProfile
};