const authService = require("../services/auth.service");
const registrationService = require("../services/registration.service");

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Email and password are required"
                }
            });
        }

        const result = await authService.login(email, password);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: {
                code: "LOGIN_FAILED",
                message: err.message
            }
        });
    }
}

async function me(req, res) {
    try {
        const user = await authService.getCurrentUser(req.user.userId);

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        return res.status(404).json({
            success: false,
            error: {
                code: "USER_NOT_FOUND",
                message: err.message
            }
        });
    }
}

async function register(req, res) {
    try {
      const { prn, email, password } = req.body;
  
      if (!prn || !email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "PRN, email and password are required"
          }
        });
      }
  
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Password must be at least 8 characters"
          }
        });
      }
  
      const result = await registrationService.registerStudent(
        prn,
        email,
        password
      );
  
      return res.status(200).json({
        success: true,
        data: result
      });
  
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: "REGISTRATION_FAILED",
          message: err.message
        }
      });
    }
  }

  async function verifyOtp(req, res) {
    try {
      const { prn, otp } = req.body;
  
      if (!prn || !otp) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "PRN and OTP are required"
          }
        });
      }
  
      const result = await registrationService.verifyStudentOtp(
        prn,
        otp
      );
  
      return res.status(200).json({
        success: true,
        data: result
      });
  
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: "OTP_VERIFICATION_FAILED",
          message: err.message
        }
      });
    }
  }

module.exports = {
    login,
    me,
    register,
    verifyOtp
};