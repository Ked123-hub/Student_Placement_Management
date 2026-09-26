const multer = require("multer");

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowed = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
        ];

        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only Excel files are allowed"));
        }

        cb(null, true);
    }
});

module.exports = upload;