const prisma = require("../config/db");
const fs = require("fs");

async function uploadResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: "FILE_REQUIRED",
          message: "Resume PDF is required"
        }
      });
    }

    const student = await prisma.student.findUnique({
      where: {
        userId: req.user.userId
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          code: "STUDENT_NOT_FOUND",
          message: "Student profile not found"
        }
      });
    }

    const resume = await prisma.resume.create({
      data: {
        studentId: student.id,
        fileName: req.file.originalname,
        storageKey: req.file.path
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        id: resume.id,
        fileName: resume.fileName,
        uploadedAt: resume.uploadedAt
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "RESUME_UPLOAD_FAILED",
        message: err.message
      }
    });
  }
}

async function getResume(req, res) {
    try {
      const student = await prisma.student.findUnique({
        where: {
          userId: req.user.userId
        }
      });
  
      if (!student) {
        return res.status(404).json({
          success: false,
          error: {
            code: "STUDENT_NOT_FOUND",
            message: "Student profile not found"
          }
        });
      }
  
      const resume = await prisma.resume.findFirst({
        where: {
          studentId: student.id
        },
        orderBy: {
          uploadedAt: "desc"
        }
      });
  
      if (!resume) {
        return res.status(404).json({
          success: false,
          error: {
            code: "RESUME_NOT_FOUND",
            message: "No resume uploaded"
          }
        });
      }
  
      return res.status(200).json({
        success: true,
        data: {
          id: resume.id,
          fileName: resume.fileName,
          uploadedAt: resume.uploadedAt
        }
      });
  
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: {
          code: "RESUME_FETCH_FAILED",
          message: err.message
        }
      });
    }
  }

  async function downloadResume(req, res) {
    try {
      const student = await prisma.student.findUnique({
        where: {
          userId: req.user.userId
        }
      });
  
      if (!student) {
        return res.status(404).json({
          success: false,
          error: {
            code: "STUDENT_NOT_FOUND",
            message: "Student profile not found"
          }
        });
      }
  
      const resume = await prisma.resume.findFirst({
        where: {
          id: req.params.id,
          studentId: student.id
        }
      });
  
      if (!resume) {
        return res.status(404).json({
          success: false,
          error: {
            code: "RESUME_NOT_FOUND",
            message: "Resume not found"
          }
        });
      }
  
      if (!fs.existsSync(resume.storageKey)) {
        return res.status(404).json({
          success: false,
          error: {
            code: "FILE_NOT_FOUND",
            message: "Resume file not found"
          }
        });
      }
  
      return res.download(
        resume.storageKey,
        resume.fileName
      );
  
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: {
          code: "RESUME_DOWNLOAD_FAILED",
          message: err.message
        }
      });
    }
  }

module.exports = {
  uploadResume,
  getResume,
  downloadResume
};