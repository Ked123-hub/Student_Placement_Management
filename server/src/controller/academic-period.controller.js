const prisma = require("../config/db");

async function createPeriod(req, res) {
  try {
    const { startAt, endAt } = req.body;

    if (!startAt || !endAt) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "startAt and endAt are required"
        }
      });
    }

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid date format"
        }
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "endAt must be after startAt"
        }
      });
    }

    const period = await prisma.academicUpdatePeriod.create({
      data: {
        startAt: start,
        endAt: end,
        status: "OPEN",
        createdBy: req.user.userId
      }
    });

    return res.status(201).json({
      success: true,
      data: period
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "PERIOD_CREATE_FAILED",
        message: err.message
      }
    });
  }
}

async function closePeriod(req, res) {
  try {
    const period = await prisma.academicUpdatePeriod.findFirst({
      where: {
        status: "OPEN"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!period) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NO_OPEN_PERIOD",
          message: "No open academic update period found"
        }
      });
    }

    const updatedPeriod = await prisma.academicUpdatePeriod.update({
      where: {
        id: period.id
      },
      data: {
        status: "CLOSED"
      }
    });

    return res.status(200).json({
      success: true,
      data: updatedPeriod
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "PERIOD_CLOSE_FAILED",
        message: err.message
      }
    });
  }
}

module.exports = {
  createPeriod,
  closePeriod
};