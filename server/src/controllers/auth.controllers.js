const authService = require("../services/auth.service");

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

// async function tpoTest(req, res) {
//     return res.status(200).json({
//         success: true,
//         message: "TPO access granted",
//         userId: req.user.userId,
//         role: req.user.role
//     });
// }

module.exports = {
    login,
    me,
};