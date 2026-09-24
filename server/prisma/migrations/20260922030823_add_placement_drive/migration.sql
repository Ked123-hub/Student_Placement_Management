-- CreateTable
CREATE TABLE "PlacementDrive" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobRole" TEXT NOT NULL,
    "package" DECIMAL(10,2),
    "internshipStipend" DECIMAL(10,2),
    "location" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "joiningDate" TIMESTAMP(3),
    "openings" INTEGER NOT NULL,
    "selectionProcess" TEXT NOT NULL,
    "requiredSkills" TEXT,
    "applicationDeadline" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementDrive_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlacementDrive" ADD CONSTRAINT "PlacementDrive_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
