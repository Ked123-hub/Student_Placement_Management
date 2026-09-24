-- CreateEnum
CREATE TYPE "RoundMode" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "RecruitmentRound" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "mode" "RoundMode" NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "status" "RoundStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitmentRound_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RecruitmentRound" ADD CONSTRAINT "RecruitmentRound_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "PlacementDrive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
