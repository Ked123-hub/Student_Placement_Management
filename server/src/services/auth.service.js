const prisma = require("../config/db");
const { comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

async function login(email, password) {
    const user = await prisma.user.findUnique({
        where: {
            email
        },
        include: {
            student: true
        }
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
        throw new Error("Account is not active");
    }

    const validPassword = await comparePassword(
        password,
        user.passwordHash
    );

    if (!validPassword) {
        throw new Error("Invalid email or password");
    }

    const token = generateToken(user);

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            mustChangePassword: user.mustChangePassword,
            student: user.student
        }
    };
}

async function getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            student: true
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        mustChangePassword: user.mustChangePassword,
        student: user.student
    };
}

module.exports = {
    login,
    getCurrentUser
};