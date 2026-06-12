import { db } from "@/server/db";
import type { Prisma, TxnType } from "@/generated/prisma";
import { PLATFORM_FEE_BPS, DORMANT_REACTIVATION_CENTS } from "@/lib/constants";
import { feeFromBps } from "@/lib/money";

const SYSTEM_EMAIL = "system@gtms.internal";

export async function getSystemWalletId(): Promise<string> {
  const sys = await db.user.findUnique({
    where: { email: SYSTEM_EMAIL },
    select: { wallet: { select: { id: true } } },
  });
  if (!sys?.wallet) throw new Error("System wallet not found");
  return sys.wallet.id;
}

export async function getWallet(userId: string) {
  return db.walletAccount.findUnique({
    where: { userId },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
}

export async function getBalance(userId: string): Promise<number> {
  const w = await db.walletAccount.findUnique({
    where: { userId },
    select: { balanceCents: true },
  });
  return w?.balanceCents ?? 0;
}

interface PostTxnParams {
  walletId: string;
  type: TxnType;
  amountCents: number;
  description: string;
  metadata?: Record<string, unknown>;
  relatedTxnId?: string;
}

export async function postTransaction(params: PostTxnParams) {
  const { walletId, type, amountCents, description, metadata, relatedTxnId } = params;

  const isCredit = [
    "DEPOSIT", "EARNING", "REFUND", "REFERRAL_BONUS",
    "ADMIN_CREDIT", "LOAN", "MILESTONE_BONUS", "WELCOME_BONUS",
  ].includes(type);
  const isDebit = [
    "PAYOUT", "PLATFORM_FEE", "MEMBERSHIP_FEE", "GTMS_PASS_FEE",
  ].includes(type);

  let dormantUserId: string | null = null;

  const txn = await db.$transaction(async (tx) => {
    const wallet = await tx.walletAccount.findUnique({
      where: { id: walletId },
      select: { balanceCents: true, userId: true },
    });
    if (!wallet) throw new Error("Wallet not found");

    if (isDebit && wallet.balanceCents < amountCents) {
      throw new Error("Insufficient balance");
    }

    const created = await tx.transaction.create({
      data: {
        walletId,
        type,
        amountCents,
        status: "COMPLETED",
        description,
        metadata: metadata as Prisma.InputJsonValue | undefined,
        relatedTxnId,
      },
    });

    const updated = await tx.walletAccount.update({
      where: { id: walletId },
      data: {
        balanceCents: isCredit
          ? { increment: amountCents }
          : isDebit
          ? { decrement: amountCents }
          : undefined,
      },
      select: { balanceCents: true, userId: true },
    });

    // Trigger dormancy when a debit brings balance to zero
    if (isDebit && updated.balanceCents <= 0) {
      const user = await tx.user.findUnique({
        where: { id: updated.userId },
        select: { status: true },
      });
      if (user?.status === "ACTIVE") {
        await tx.user.update({
          where: { id: updated.userId },
          data: {
            status: "DORMANT",
            dormantSince: new Date(),
            dormantActivationCents: DORMANT_REACTIVATION_CENTS,
          },
        });
        dormantUserId = updated.userId;
      }
    }

    return created;
  });

  // Send dormancy notification outside the DB transaction
  if (dormantUserId) {
    const { notify } = await import("@/server/services/notification.service");
    await notify({
      userId: dormantUserId,
      type: "ACCOUNT_DORMANT",
      title: "Account Dormant — Action Required",
      body: `Your wallet balance has reached $0. Your account is now dormant. Deposit at least $${(DORMANT_REACTIVATION_CENTS / 100).toFixed(2)} to reactivate.`,
      link: "/dashboard/wallet",
    }).catch(() => {});
  }

  return txn;
}

export async function creditEarning(params: {
  workerId: string;
  amountCents: number;
  description: string;
  submissionId?: string;
}) {
  const { workerId, amountCents, description, submissionId } = params;

  const workerWallet = await db.walletAccount.findUnique({
    where: { userId: workerId },
    select: { id: true },
  });
  if (!workerWallet) throw new Error("Worker wallet not found");

  const platformFeeCents = feeFromBps(amountCents, PLATFORM_FEE_BPS);
  const workerAmountCents = amountCents - platformFeeCents;

  const systemWalletId = await getSystemWalletId();

  await db.$transaction(async (tx) => {
    const earningTxn = await tx.transaction.create({
      data: {
        walletId: workerWallet.id,
        type: "EARNING",
        amountCents: workerAmountCents,
        status: "COMPLETED",
        description,
        metadata: submissionId ? { submissionId } : undefined,
      },
    });

    await tx.walletAccount.update({
      where: { id: workerWallet.id },
      data: { balanceCents: { increment: workerAmountCents } },
    });

    await tx.transaction.create({
      data: {
        walletId: systemWalletId,
        type: "PLATFORM_FEE",
        amountCents: platformFeeCents,
        status: "COMPLETED",
        description: `Platform fee for ${description}`,
        relatedTxnId: earningTxn.id,
      },
    });

    await tx.walletAccount.update({
      where: { id: systemWalletId },
      data: { balanceCents: { increment: platformFeeCents } },
    });

    await tx.user.update({
      where: { id: workerId },
      data: { totalEarnedCents: { increment: workerAmountCents } },
    });

    if (submissionId) {
      await tx.submission.update({
        where: { id: submissionId },
        data: { earningTxnId: earningTxn.id },
      });
    }
  });
}
