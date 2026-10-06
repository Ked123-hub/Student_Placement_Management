const prisma = require("../config/db");
const { hashPassword } = require("../utils/password");
const { generateOtp, hashOtp } = require("../utils/otp");

async function registerStudent(prn, email, password) {
  const student = await prisma.student.findUnique({
    where: { prn }
  });

  if (!student) {
    throw new Error("Student record not found");
  }

  if (student.email.toLowerCase() !== email.toLowerCase()) {
    throw new Error("College email does not match student record");
  }

  if (student.userId) {
    throw new Error("Student is already registered");
  }

  const passwordHash = await hashPassword(password);

  const otp = generateOtp();
  const otpHash = hashOtp(otp);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.pendingStudentRegistration.upsert({
    where: {
      studentId: student.id
    },
    update: {
      email: student.email,
      passwordHash,
      otpHash,
      expiresAt,
      attempts: 0,
      verifiedAt: null
    },
    create: {
      studentId: student.id,
      email: student.email,
      passwordHash,
      otpHash,
      expiresAt
    }
  });

  // Development only.
  // Later we will send this through college email.
  console.log(`OTP for ${student.email}: ${otp}`);

  return {
    message: "OTP generated successfully"
  };
}

async function verifyStudentOtp(prn, otp) {
  const student = await prisma.student.findUnique({
    where: { prn }
  });

  if (!student) {
    throw new Error("Student record not found");
  }

  if (student.userId) {
    throw new Error("Student is already registered");
  }

  const pending = await prisma.pendingStudentRegistration.findUnique({
    where: {
      studentId: student.id
    }
  });

  if (!pending) {
    throw new Error("No pending registration found");
  }

  if (pending.verifiedAt) {
    throw new Error("Registration is already verified");
  }

  if (new Date() > pending.expiresAt) {
    throw new Error("OTP has expired");
  }

  if (pending.attempts >= 5) {
    throw new Error("Maximum OTP attempts exceeded");
  }

  const otpHash = hashOtp(otp);

  if (otpHash !== pending.otpHash) {
    await prisma.pendingStudentRegistration.update({
      where: {
        id: pending.id
      },
      data: {
        attempts: {
          increment: 1
        }
      }
    });

    throw new Error("Invalid OTP");
  }

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: student.email,
        passwordHash: pending.passwordHash,
        role: "STUDENT",
        status: "ACTIVE",
        mustChangePassword: false
      }
    });

    await tx.student.update({
      where: {
        id: student.id
      },
      data: {
        userId: newUser.id
      }
    });

    await tx.pendingStudentRegistration.delete({
      where: {
        id: pending.id
      }
    });

    return newUser;
  });

  return {
    message: "Student registration successful",
    userId: user.id
  };
}

module.exports = {
  registerStudent,
  verifyStudentOtp
};