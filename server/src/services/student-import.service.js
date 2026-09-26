const prisma = require("../config/db");
const { parseStudentExcel } = require("../utils/excel");

function validateRow(row, index) {
    const errors = [];

    if (!row.Name) {
        errors.push("Name is required");
    }

    if (!row["Roll Number"]) {
        errors.push("Roll Number is required");
    }

    if (!row.PRN) {
        errors.push("PRN is required");
    }

    if (!row.Email) {
        errors.push("Email is required");
    }

    if (!row.Branch) {
        errors.push("Branch is required");
    }

    if (!row.Year) {
        errors.push("Year is required");
    }

    if (row.CGPA === "" || row.CGPA === undefined) {
        errors.push("CGPA is required");
    }

    if (
        row["10th Percentage"] === "" ||
        row["10th Percentage"] === undefined
    ) {
        errors.push("10th Percentage is required");
    }

    if (
        row["12th Percentage"] === "" ||
        row["12th Percentage"] === undefined
    ) {
        errors.push("12th Percentage is required");
    }

    if (row.Backlogs === "" || row.Backlogs === undefined) {
        errors.push("Backlogs is required");
    }

    return {
        row: index + 2,
        errors
    };
}

async function previewStudents(filePath) {
    const rows = parseStudentExcel(filePath);

    const errors = [];

    rows.forEach((row, index) => {
        const result = validateRow(row, index);

        if (result.errors.length > 0) {
            errors.push(result);
        }
    });

    return {
        totalRows: rows.length,
        validRows: rows.length - errors.length,
        invalidRows: errors.length,
        errors
    };
}

module.exports = {
    previewStudents
};