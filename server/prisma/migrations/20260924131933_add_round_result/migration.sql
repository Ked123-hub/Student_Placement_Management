-- CreateEnum
CREATE TYPE "RoundResultStatus" AS ENUM ('PASSED', 'FAILED', 'NOT_PROGRESSED');

-- CreateTable
CREATE TABLE "RoundResult" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "result" "RoundResultStatus" NOT NULL,
    "score" DECIMAL(6,2),
    "remarks" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,

    CONSTRAINT "RoundResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoundResult_roundId_studentId_key" ON "RoundResult"("roundId", "studentId");

-- AddForeignKey
ALTER TABLE "RoundResult" ADD CONSTRAINT "RoundResult_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "RecruitmentRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundResult" ADD CONSTRAINT "RoundResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
