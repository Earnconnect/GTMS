-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cvSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "cvSummary" TEXT,
ADD COLUMN     "cvUrl" TEXT;
