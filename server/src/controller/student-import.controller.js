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

module.exports = {
    preview
};