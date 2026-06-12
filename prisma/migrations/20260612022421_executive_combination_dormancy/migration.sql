-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'MILESTONE_BONUS';
ALTER TYPE "NotificationType" ADD VALUE 'GTMS_PASS_ACTIVATED';
ALTER TYPE "NotificationType" ADD VALUE 'ACCOUNT_DORMANT';
ALTER TYPE "NotificationType" ADD VALUE 'ACCOUNT_REACTIVATED';

-- AlterEnum
ALTER TYPE "TaskCategory" ADD VALUE 'COMBINATION';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TxnType" ADD VALUE 'MILESTONE_BONUS';
ALTER TYPE "TxnType" ADD VALUE 'GTMS_PASS_FEE';

-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'DORMANT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dormantActivationCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dormantSince" TIMESTAMP(3),
ADD COLUMN     "gtmsPassActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gtmsPassPurchasedAt" TIMESTAMP(3);
