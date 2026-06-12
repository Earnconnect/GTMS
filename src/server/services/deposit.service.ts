import { db } from "@/server/db";
import { postTransaction } from "@/server/services/wallet.service";
import { notify } from "@/server/services/notification.service";
import { logAudit } from "@/server/services/audit.service";
import { DORMANT_REACTIVATION_CENTS } from "@/lib/constants";

export async function requestDeposit(params: {
  userId: string;
  amountCents: number;
  paymentMethod: string;
  proofUrl?: string;
}) {
  return db.deposit.create({ data: params });
}

export async function approveDeposit(params: {
  depositId: string;
  adminId: string;
  adminNote?: string;
}) {
  const { depositId, adminId, adminNote } = params;

  const deposit = await db.deposit.findUnique({
    where: { id: depositId },
    include: { user: { select: { wallet: { select: { id: true } } } } },
  });
  if (!deposit) throw new Error("Deposit not found");
  if (deposit.status !== "PENDING") throw new Error("Deposit already processed");
  if (!deposit.user.wallet) throw new Error("User wallet not found");

  await db.$transaction(async (tx) => {
    await tx.deposit.update({
      where: { id: depositId },
      data: { status: "APPROVED", reviewedById: adminId, reviewedAt: new Date(), adminNote },
    });

    await tx.walletAccount.update({
      where: { id: deposit.user.wallet!.id },
      data: { balanceCents: { increment: deposit.amountCents } },
    });

    await tx.transaction.create({
      data: {
        walletId: deposit.user.wallet!.id,
        type: "DEPOSIT",
        amountCents: deposit.amountCents,
        status: "COMPLETED",
        description: `Manual deposit approved`,
        metadata: { depositId },
      },
    });
  });

  await notify({
    userId: deposit.userId,
    type: "DEPOSIT_APPROVED",
    title: "Deposit Approved",
    body: `Your deposit has been approved and credited to your wallet.`,
    link: "/dashboard/wallet",
  });

  // Auto-reactivate dormant accounts if the new balance meets the threshold
  const user = await db.user.findUnique({
    where: { id: deposit.userId },
    select: {
      status: true,
      dormantActivationCents: true,
      wallet: { select: { balanceCents: true } },
    },
  });

  if (user?.status === "DORMANT") {
    const activationAmount = user.dormantActivationCents || DORMANT_REACTIVATION_CENTS;
    const newBalance = user.wallet?.balanceCents ?? 0;

    if (newBalance >= activationAmount) {
      await db.user.update({
        where: { id: deposit.userId },
        data: { status: "ACTIVE", dormantSince: null },
      });

      await notify({
        userId: deposit.userId,
        type: "ACCOUNT_REACTIVATED",
        title: "Account Reactivated!",
        body: "Your account has been reactivated. You can now browse and complete tasks again.",
        link: "/browse",
      });
    }
  }

  await logAudit({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "DEPOSIT_APPROVED",
    targetType: "Deposit",
    targetId: depositId,
    metadata: { amountCents: deposit.amountCents, userId: deposit.userId },
  });
}

export async function rejectDeposit(params: {
  depositId: string;
  adminId: string;
  adminNote: string;
}) {
  const { depositId, adminId, adminNote } = params;

  const deposit = await db.deposit.findUnique({ where: { id: depositId } });
  if (!deposit) throw new Error("Deposit not found");
  if (deposit.status !== "PENDING") throw new Error("Deposit already processed");

  await db.deposit.update({
    where: { id: depositId },
    data: { status: "REJECTED", reviewedById: adminId, reviewedAt: new Date(), adminNote },
  });

  await notify({
    userId: deposit.userId,
    type: "DEPOSIT_REJECTED",
    title: "Deposit Rejected",
    body: adminNote || "Your deposit request has been rejected.",
    link: "/dashboard/wallet",
  });

  await logAudit({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "DEPOSIT_REJECTED",
    targetType: "Deposit",
    targetId: depositId,
  });
}
