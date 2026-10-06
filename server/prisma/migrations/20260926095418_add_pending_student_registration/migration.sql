-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('STUDENT_REGISTRATION');

-- CreateTable
CREATE TABLE "PendingStudentRegistration" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingStudentRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingStudentRegistration_studentId_key" ON "PendingStudentRegistration"("studentId");

-- AddForeignKey
ALTER TABLE "PendingStudentRegistration" ADD CONSTRAINT "PendingStudentRegistration_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
