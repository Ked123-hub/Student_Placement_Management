-- CreateTable
CREATE TABLE "DriveEligibility" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "eligible" BOOLEAN NOT NULL,
    "reason" TEXT,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriveEligibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriveEligibility_driveId_studentId_key" ON "DriveEligibility"("driveId", "studentId");

-- AddForeignKey
ALTER TABLE "DriveEligibility" ADD CONSTRAINT "DriveEligibility_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "PlacementDrive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveEligibility" ADD CONSTRAINT "DriveEligibility_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
