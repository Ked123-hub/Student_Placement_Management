-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DRIVE_OPENED', 'DEADLINE_REMINDER', 'DRIVE_CLOSED', 'DRIVE_CANCELLED', 'APPLICATION_SUBMITTED', 'APPLICATION_WITHDRAWN', 'SHORTLISTED', 'NOT_SHORTLISTED', 'NEXT_ROUND', 'ROUND_UPDATED', 'ROUND_REMINDER', 'RESULT', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "AcademicUpdateStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicUpdatePeriod" (
    "id" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "AcademicUpdateStatus" NOT NULL DEFAULT 'OPEN',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicUpdatePeriod_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
