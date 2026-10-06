const prisma = require("../config/db");

async function createCompany(req, res) {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Company name is required"
        }
      });
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim()
      }
    });

    return res.status(201).json({
      success: true,
      data: company
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "COMPANY_CREATE_FAILED",
        message: err.message
      }
    });
  }
}

module.exports = {
  createCompany
};