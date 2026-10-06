const prisma = require("../config/db");
const eligibilityService = require("../services/eligibility.service");

const allowedFields = [
  "CGPA",
  "TENTH_PERCENT",
  "TWELFTH_PERCENT",
  "DIPLOMA_PERCENT",
  "BACKLOGS",
  "BRANCH",
  "YEAR"
];

const allowedOperators = [
  "GTE",
  "LTE",
  "GT",
  "LT",
  "EQ",
  "IN",
  "NOT_IN"
];

async function createCriteria(req, res) {
  try {
    const { driveId, field, operator, value } = req.body;

    if (!driveId || !field || !operator || value === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "driveId, field, operator and value are required"
        }
      });
    }

    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_FIELD",
          message: "Invalid eligibility field"
        }
      });
    }

    if (!allowedOperators.includes(operator)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_OPERATOR",
          message: "Invalid eligibility operator"
        }
      });
    }

    const drive = await prisma.placementDrive.findUnique({
      where: {
        id: driveId
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

    const criteria = await prisma.eligibilityCriteria.create({
      data: {
        driveId,
        field,
        operator,
        value
      }
    });

    return res.status(201).json({
      success: true,
      data: criteria
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "CRITERIA_CREATE_FAILED",
        message: err.message
      }
    });
  }
}

async function evaluateEligibility(req, res) {
  try {
    const { driveId } = req.params;

    const drive = await prisma.placementDrive.findUnique({
      where: {
        id: driveId
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

    const results =
      await eligibilityService.saveEligibility(driveId);

    const eligibleCount =
      results.filter(r => r.eligible).length;

    return res.status(200).json({
      success: true,
      data: {
        driveId,
        totalStudents: results.length,
        eligibleStudents: eligibleCount,
        ineligibleStudents:
          results.length - eligibleCount
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "ELIGIBILITY_EVALUATION_FAILED",
        message: err.message
      }
    });
  }
}

async function getEligibility(req, res) {
  try {
    const { driveId } = req.params;

    const drive = await prisma.placementDrive.findUnique({
      where: {
        id: driveId
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

    const results = await prisma.driveEligibility.findMany({
      where: {
        driveId
      },
      include: {
        student: {
          select: {
            id: true,
            prn: true,
            rollNumber: true,
            name: true,
            email: true,
            phone: true,
            branch: true,
            year: true,
            cgpa: true,
            tenthPercent: true,
            twelfthPercent: true,
            diplomaPercent: true,
            backlogs: true
          }
        }
      },
      orderBy: {
        student: {
          name: "asc"
        }
      }
    });

    const eligible = results.filter(
      item => item.eligible
    );

    const ineligible = results.filter(
      item => !item.eligible
    );

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          total: results.length,
          eligible: eligible.length,
          ineligible: ineligible.length
        },
        students: results
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "ELIGIBILITY_FETCH_FAILED",
        message: err.message
      }
    });
  }
}

module.exports = {
  createCriteria,
  evaluateEligibility,
  getEligibility
};