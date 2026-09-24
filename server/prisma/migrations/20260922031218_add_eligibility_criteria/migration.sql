-- CreateEnum
CREATE TYPE "EligibilityField" AS ENUM ('CGPA', 'TENTH_PERCENT', 'TWELFTH_PERCENT', 'DIPLOMA_PERCENT', 'BACKLOGS', 'BRANCH', 'YEAR');

-- CreateEnum
CREATE TYPE "EligibilityOperator" AS ENUM ('GTE', 'LTE', 'GT', 'LT', 'EQ', 'IN', 'NOT_IN');

-- CreateTable
CREATE TABLE "EligibilityCriteria" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "field" "EligibilityField" NOT NULL,
    "operator" "EligibilityOperator" NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EligibilityCriteria_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EligibilityCriteria" ADD CONSTRAINT "EligibilityCriteria_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "PlacementDrive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
