-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'WELCOME_BONUS';
ALTER TYPE "NotificationType" ADD VALUE 'COMBINATION_INTRO';

-- AlterEnum
ALTER TYPE "TxnType" ADD VALUE 'WELCOME_BONUS';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstMilestoneClaimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gtmsPassDiscountPct" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "welcomeBonusClaimed" BOOLEAN NOT NULL DEFAULT false;
