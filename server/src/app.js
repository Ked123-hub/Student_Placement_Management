require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/auth.routes");
const studentAdminRoutes = require("./routes/student-admin.routes");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Placement Management API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", studentAdminRoutes);
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});