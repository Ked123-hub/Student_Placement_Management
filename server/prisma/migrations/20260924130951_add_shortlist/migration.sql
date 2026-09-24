-- CreateEnum
CREATE TYPE "ShortlistMethod" AS ENUM ('CRITERIA', 'COMPANY_LIST');

-- CreateEnum
CREATE TYPE "ShortlistStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REPLACED');

-- CreateTable
CREATE TABLE "Shortlist" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "method" "ShortlistMethod" NOT NULL,
    "status" "ShortlistStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Shortlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShortlistStudent" (
    "id" TEXT NOT NULL,
    "shortlistId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShortlistStudent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortlistStudent_shortlistId_studentId_key" ON "ShortlistStudent"("shortlistId", "studentId");

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "PlacementDrive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortlistStudent" ADD CONSTRAINT "ShortlistStudent_shortlistId_fkey" FOREIGN KEY ("shortlistId") REFERENCES "Shortlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortlistStudent" ADD CONSTRAINT "ShortlistStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
