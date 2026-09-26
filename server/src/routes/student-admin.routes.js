const express = require("express");

const authenticate = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const upload = require("../middleware/upload");

const studentImportController = require("../controller/student-import.controller");

const router = express.Router();

router.post(
    "/students/import/preview",
    authenticate,
    allowRoles("TPO"),
    upload.single("file"),
    studentImportController.preview
);

router.post(
    "/students/import/confirm",
    authenticate,
    allowRoles("TPO"),
    upload.single("file"),
    studentImportController.confirm
);

module.exports = router;