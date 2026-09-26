const studentImportService = require("../services/student-import.service");

async function preview(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "FILE_REQUIRED",
                    message: "Excel file is required"
                }
            });
        }

        const result = await studentImportService.previewStudents(
            req.file.path
        );

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            error: {
                code: "IMPORT_FAILED",
                message: err.message
            }
        });
    }
}

async function confirm(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "FILE_REQUIRED",
                    message: "Excel file is required"
                }
            });
        }

        const result = await studentImportService.importStudents(
            req.file.path
        );

        if (!result.success) {
            return res.status(422).json({
                success: false,
                error: {
                    code: "VALIDATION_FAILED",
                    message: "Excel validation failed",
                    details: result.errors
                }
            });
        }

        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            error: {
                code: "IMPORT_FAILED",
                message: "Failed to import students"
            }
        });
    }
}

module.exports = {
    preview,
    confirm
};