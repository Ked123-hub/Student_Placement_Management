-- CreateEnum
CREATE TYPE "PlacementOfferStatus" AS ENUM ('OFFERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "FinalPlacementStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- CreateTable
CREATE TABLE "PlacementOffer" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "package" DECIMAL(10,2),
    "selectionDate" TIMESTAMP(3) NOT NULL,
    "status" "PlacementOfferStatus" NOT NULL DEFAULT 'OFFERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalPlacement" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "placementDate" TIMESTAMP(3) NOT NULL,
    "status" "FinalPlacementStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinalPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinalPlacement_studentId_key" ON "FinalPlacement"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "FinalPlacement_offerId_key" ON "FinalPlacement"("offerId");

-- AddForeignKey
ALTER TABLE "PlacementOffer" ADD CONSTRAINT "PlacementOffer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementOffer" ADD CONSTRAINT "PlacementOffer_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "PlacementDrive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalPlacement" ADD CONSTRAINT "FinalPlacement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalPlacement" ADD CONSTRAINT "FinalPlacement_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "PlacementOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
