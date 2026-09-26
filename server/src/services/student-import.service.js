const prisma = require("../config/db");
const { parseStudentExcel } = require("../utils/excel");

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^\d{10}$/.test(String(phone));
}

function isNumber(value) {
    return value !== "" && value !== null && value !== undefined && !isNaN(Number(value));
}

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
    } else if (!isValidEmail(row.Email)) {
        errors.push("Invalid email format");
    }

    if (row.Phone && !isValidPhone(row.Phone)) {
        errors.push("Phone must contain exactly 10 digits");
    }

    if (!row.Branch) {
        errors.push("Branch is required");
    }

    if (!isNumber(row.Year)) {
        errors.push("Year must be a number");
    } else if (Number(row.Year) < 1 || Number(row.Year) > 4) {
        errors.push("Year must be between 1 and 4");
    }

    if (!isNumber(row.CGPA)) {
        errors.push("CGPA must be a number");
    } else if (Number(row.CGPA) < 0 || Number(row.CGPA) > 10) {
        errors.push("CGPA must be between 0 and 10");
    }

    if (!isNumber(row["10th Percentage"])) {
        errors.push("10th Percentage must be a number");
    } else if (
        Number(row["10th Percentage"]) < 0 ||
        Number(row["10th Percentage"]) > 100
    ) {
        errors.push("10th Percentage must be between 0 and 100");
    }

    if (!isNumber(row["12th Percentage"])) {
        errors.push("12th Percentage must be a number");
    } else if (
        Number(row["12th Percentage"]) < 0 ||
        Number(row["12th Percentage"]) > 100
    ) {
        errors.push("12th Percentage must be between 0 and 100");
    }

    if (row["Diploma Percentage"] !== "") {
        if (!isNumber(row["Diploma Percentage"])) {
            errors.push("Diploma Percentage must be a number");
        } else if (
            Number(row["Diploma Percentage"]) < 0 ||
            Number(row["Diploma Percentage"]) > 100
        ) {
            errors.push("Diploma Percentage must be between 0 and 100");
        }
    }

    if (!isNumber(row.Backlogs)) {
        errors.push("Backlogs must be a number");
    } else if (Number(row.Backlogs) < 0) {
        errors.push("Backlogs cannot be negative");
    }

    return {
        row: index + 2,
        errors
    };
}

async function importStudents(filePath) {
    const rows = parseStudentExcel(filePath);

    const errors = [];
    const prns = new Set();
    const emails = new Set();

    const students = [];

    rows.forEach((row, index) => {
        const result = validateRow(row, index);

        const prn = String(row.PRN).trim();
        const email = String(row.Email).trim().toLowerCase();

        if (prns.has(prn)) {
            result.errors.push("Duplicate PRN in Excel file");
        }

        prns.add(prn);

        if (emails.has(email)) {
            result.errors.push("Duplicate email in Excel file");
        }

        emails.add(email);

        students.push({
            row,
            result
        });
    });

    // Check database duplicates
    const existingStudents = await prisma.student.findMany({
        where: {
            OR: [
                {
                    prn: {
                        in: Array.from(prns)
                    }
                },
                {
                    email: {
                        in: Array.from(emails)
                    }
                }
            ]
        },
        select: {
            prn: true,
            email: true
        }
    });

    const existingPrns = new Set(
        existingStudents.map(student => student.prn)
    );

    const existingEmails = new Set(
        existingStudents.map(student => student.email.toLowerCase())
    );

    students.forEach(item => {
        const prn = String(item.row.PRN).trim();
        const email = String(item.row.Email).trim().toLowerCase();

        if (existingPrns.has(prn)) {
            item.result.errors.push("PRN already exists in database");
        }

        if (existingEmails.has(email)) {
            item.result.errors.push("Email already exists in database");
        }

        if (item.result.errors.length > 0) {
            errors.push(item.result);
        }
    });

    if (errors.length > 0) {
        return {
            success: false,
            totalRows: rows.length,
            importedRows: 0,
            errors
        };
    }

    const result = await prisma.$transaction(async (tx) => {
        const createdStudents = [];

        for (const item of students) {
            const row = item.row;

            const student = await tx.student.create({
                data: {
                    name: String(row.Name).trim(),
                    rollNumber: String(row["Roll Number"]).trim(),
                    prn: String(row.PRN).trim(),
                    email: String(row.Email).trim().toLowerCase(),
                    phone: row.Phone
                        ? String(row.Phone).trim()
                        : null,
                    branch: String(row.Branch).trim(),
                    year: Number(row.Year),
                    cgpa: Number(row.CGPA),
                    tenthPercent: Number(row["10th Percentage"]),
                    twelfthPercent: Number(row["12th Percentage"]),
                    diplomaPercent:
                        row["Diploma Percentage"] !== ""
                            ? Number(row["Diploma Percentage"])
                            : null,
                    backlogs: Number(row.Backlogs)
                }
            });

            createdStudents.push(student);
        }

        return createdStudents;
    });

    return {
        success: true,
        totalRows: rows.length,
        importedRows: result.length,
        errors: []
    };
}

async function previewStudents(filePath) {
    const rows = parseStudentExcel(filePath);

    const errors = [];
    const prns = new Set();
    const emails = new Set();

    const rowData = [];

    rows.forEach((row, index) => {
        const result = validateRow(row, index);

        const prn = String(row.PRN).trim();
        const email = String(row.Email).trim().toLowerCase();

        if (prn) {
            if (prns.has(prn)) {
                result.errors.push("Duplicate PRN in Excel file");
            }

            prns.add(prn);
        }

        if (email) {
            if (emails.has(email)) {
                result.errors.push("Duplicate email in Excel file");
            }

            emails.add(email);
        }

        rowData.push({
            row,
            rowNumber: index + 2,
            result
        });
    });

    // Check existing PRNs
    const existingStudents = await prisma.student.findMany({
        where: {
            OR: [
                {
                    prn: {
                        in: Array.from(prns)
                    }
                },
                {
                    email: {
                        in: Array.from(emails)
                    }
                }
            ]
        },
        select: {
            prn: true,
            email: true
        }
    });

    const existingPrns = new Set(
        existingStudents.map(student => student.prn)
    );

    const existingEmails = new Set(
        existingStudents.map(student => student.email.toLowerCase())
    );

    rowData.forEach(item => {
        const prn = String(item.row.PRN).trim();
        const email = String(item.row.Email).trim().toLowerCase();

        if (existingPrns.has(prn)) {
            item.result.errors.push("PRN already exists in database");
        }

        if (existingEmails.has(email)) {
            item.result.errors.push("Email already exists in database");
        }

        if (item.result.errors.length > 0) {
            errors.push(item.result);
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
    previewStudents,
    importStudents
};