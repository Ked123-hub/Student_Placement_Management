require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/auth.routes");
const studentAdminRoutes = require("./routes/student-admin.routes");
const studentRoutes = require("./routes/student.routes");
const academicPeriodRoutes = require("./routes/academic-period.routes");
const resumeRoutes = require("./routes/resume.routes");
const companyRoutes = require("./routes/company.routes");
const driveRoutes = require("./routes/drive.routes");
const eligibilityRoutes = require("./routes/eligibility.routes");
const studentDriveRoutes = require("./routes/student-drive.routes");
const applicationAdminRoutes = require("./routes/application-admin.routes");
const shortlistAdminRoutes = require("./routes/shortlist-admin.routes");
const roundRoutes = require("./routes/round.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const roundResultRoutes = require("./routes/round-result.routes");
const offerRoutes = require("./routes/offer.routes");
const placementRoutes = require("./routes/placement.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Placement Management API is running"
    });
});

app.use("/api/student/drives", studentDriveRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", studentAdminRoutes);
app.use("/api/admin/academic-periods", academicPeriodRoutes);
app.use("/api/students/me/resumes", resumeRoutes);
app.use("/api/admin/companies", companyRoutes);
app.use("/api/admin/drives", driveRoutes);
app.use("/api/admin/eligibility", eligibilityRoutes);
app.use("/api/admin/applications", applicationAdminRoutes);
app.use("/api/admin/shortlists", shortlistAdminRoutes);
app.use("/api/admin", roundRoutes);
app.use("/api", attendanceRoutes);
app.use("/api", roundResultRoutes);
app.use("/api", offerRoutes);
app.use("/api", placementRoutes);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});